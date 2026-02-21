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

        // Диагностика: сколько recurring-транзакций и донатов
        $recurringTxCount = DB::table('payment_transactions')
            ->where('organization_id', $organizationId)
            ->where('status', 'completed')
            ->where(function ($q) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->count();
        $recurringDonationsCount = Donation::query()
            ->join('payment_transactions as pt', 'donations.payment_transaction_id', '=', 'pt.id')
            ->where('donations.organization_id', $organizationId)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($q) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(pt.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(pt.payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->count();
        Log::debug('MigratedTopRecurringSnapshot: recurring stats', [
            'org_id' => $organizationId,
            'recurring_tx_count' => $recurringTxCount,
            'recurring_donations_count' => $recurringDonationsCount,
        ]);

        // «Чел.» = уникальные подписки (saved_payment_method_id), не количество платежей
        $rows = Donation::query()
            ->join('payment_transactions as pt', 'donations.payment_transaction_id', '=', 'pt.id')
            ->where('donations.organization_id', $organizationId)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($q) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(pt.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(pt.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(pt.payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donations.donor_name), ""), "Анонимное пожертвование") as donor_label,
                SUM(donations.amount) as total_amount,
                COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(pt.payment_details, "$.saved_payment_method_id"))) as unique_people_count
            ')
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donations.donor_name), ""), "Анонимное пожертвование")'))
            ->get();

        $normalized = [];
        foreach ($rows as $row) {
            $label = ProjectDonationsService::normalizeDonorLabelGraduateOnly($row->donor_label);
            if ($label === null) {
                continue;
            }
            if (!isset($normalized[$label])) {
                $normalized[$label] = ['total_amount' => 0, 'donations_count' => 0];
            }
            $normalized[$label]['total_amount'] += (int) $row->total_amount;
            $normalized[$label]['donations_count'] += (int) $row->unique_people_count;
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

        Log::debug('MigratedTopRecurringSnapshot: computed', [
            'org_id' => $organizationId,
            'rows_before_normalize' => $rows->count(),
            'rows_after_normalize' => count($toSave),
            'labels' => array_column($toSave, 'donor_label'),
        ]);

        $this->repository->replace($organizationId, $toSave);

        return count($toSave);
    }
}
