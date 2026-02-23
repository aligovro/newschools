<?php

namespace App\Migrated;

use App\Enums\DonationStatus;
use App\Models\Donation;
use App\Services\ProjectDonations\ProjectDonationsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Пересчёт снапшота «Топ регулярно-поддерживающих» из донатов организации.
 * Учитываются только донаты, привязанные к recurring-транзакциям (is_recurring в payment_details).
 * Вызывается после миграции платежей или по команде для legacy-организаций.
 */
final class MigratedTopRecurringSnapshotService
{
    public function __construct(
        private MigratedOrgResolver $resolver,
        private OrganizationTopRecurringSnapshotRepository $repository,
    ) {}

    /**
     * Посчитать по recurring-донатам организации и сохранить снапшот.
     */
    public function computeAndSaveForOrganization(int $organizationId): int
    {
        if (!$this->resolver->isLegacyMigratedById($organizationId)) {
            Log::debug('MigratedTopRecurringSnapshot: org not legacy migrated', ['org_id' => $organizationId]);
            return 0;
        }

        $autopayments = DB::table('organization_autopayments')
            ->where('organization_id', $organizationId)
            ->where(function ($query) {
                $query->whereIn('status', ['publish', 'active', 'ACTIVE'])
                    ->orWhereNull('status');
            })
            ->get();

        $normalized = [];

        foreach ($autopayments as $ap) {
            $donorLabel = null;

            // 1. Связь через subscription_key = payment_details.saved_payment_method_id (НЕ id транзакции)
            if ($ap->subscription_key) {
                $latestDonation = DB::table('payment_transactions')
                    ->join('donations', 'payment_transactions.id', '=', 'donations.payment_transaction_id')
                    ->where('payment_transactions.organization_id', $organizationId)
                    ->whereRaw(
                        "JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.saved_payment_method_id')) = ?",
                        [$ap->subscription_key]
                    )
                    ->where('donations.donor_name', '!=', 'Анонимное пожертвование')
                    ->whereNotNull('donations.donor_name')
                    ->where('donations.donor_name', '!=', '')
                    ->orderBy('donations.id', 'desc')
                    ->select('donations.donor_name')
                    ->first();

                if ($latestDonation) {
                    $donorLabel = $latestDonation->donor_name;
                }
            }
            
            // 2. Фолбэк на успешное пожертвование по телефону
            if (!$donorLabel && $ap->phone_number) {
                $latestByPhone = DB::table('donations')
                    ->where('organization_id', $organizationId)
                    ->where('donor_phone', $ap->phone_number)
                    ->where('status', DonationStatus::Completed->value)
                    ->where('donor_name', '!=', 'Анонимное пожертвование')
                    ->whereNotNull('donor_name')
                    ->where('donor_name', '!=', '')
                    ->orderBy('id', 'desc')
                    ->select('donor_name')
                    ->first();
                    
                if ($latestByPhone) {
                    $donorLabel = $latestByPhone->donor_name;
                }
            }
            
            $label = ProjectDonationsService::normalizeDonorLabelGraduateOnly($donorLabel ?? 'Анонимное пожертвование');
            if ($label === null) {
                continue;
            }
            
            if (!isset($normalized[$label])) {
                $normalized[$label] = ['total_amount' => 0, 'donations_count' => 0, 'phones' => []];
            }
            
            $normalized[$label]['total_amount'] += (int) $ap->amount;
            
            // Считаем уникальных людей по номеру телефона (эмуляция уникального user_id из WP)
            $uniqueId = $ap->phone_number ?: 'id_' . $ap->id;
            if (!in_array($uniqueId, $normalized[$label]['phones'], true)) {
                $normalized[$label]['phones'][] = $uniqueId;
                $normalized[$label]['donations_count'] += 1;
            }
        }

        uasort($normalized, fn ($a, $b) => $b['total_amount'] <=> $a['total_amount']);
        $toSave = [];
        foreach ($normalized as $donorLabel => $data) {
            $toSave[] = [
                'donor_label' => $donorLabel,
                'total_amount' => $data['total_amount'],
                'donations_count' => $data['donations_count'],
            ];
        }

        Log::debug('MigratedTopRecurringSnapshot: computed via active autopayments', [
            'org_id' => $organizationId,
            'rows_after_normalize' => count($toSave),
            'labels' => array_column($toSave, 'donor_label'),
        ]);

        $this->repository->replace($organizationId, $toSave);

        return count($toSave);
    }
}
