<?php

namespace App\Migrated;

use App\Enums\DonationStatus;
use App\Models\Donation;
use App\Services\ProjectDonations\ProjectDonationsService;
use Illuminate\Support\Facades\DB;

/**
 * Пересчёт снапшота «Топ поддержавших выпусков» из донатов организации.
 * Вызывается после миграции платежей или по команде для legacy-организаций.
 */
final class MigratedTopOneTimeSnapshotService
{
    public function __construct(
        private MigratedOrgResolver $resolver,
        private OrganizationTopOneTimeSnapshotRepository $repository,
    ) {}

    /**
     * Посчитать по донатам организации и сохранить снапшот.
     */
    public function computeAndSaveForOrganization(int $organizationId): int
    {
        if (!$this->resolver->isLegacyMigratedById($organizationId)) {
            return 0;
        }

        $rows = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                SUM(amount) as total_amount,
                COUNT(id) as payments_count
            ')
            ->where('organization_id', $organizationId)
            ->where('status', DonationStatus::Completed->value)
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'))
            ->get();

        $normalized = [];
        foreach ($rows as $row) {
            $label = ProjectDonationsService::normalizeDonorLabelGraduateOnly($row->donor_label);
            if ($label === null) {
                continue;
            }
            if (!isset($normalized[$label])) {
                $normalized[$label] = ['total_amount' => 0, 'payments_count' => 0];
            }
            $normalized[$label]['total_amount'] += (int) $row->total_amount;
            $normalized[$label]['payments_count'] += (int) $row->payments_count;
        }

        uasort($normalized, fn ($a, $b) => $b['total_amount'] <=> $a['total_amount']);
        $toSave = [];
        foreach ($normalized as $donorLabel => $data) {
            $toSave[] = [
                'donor_label' => $donorLabel,
                'total_amount' => $data['total_amount'],
                'payments_count' => $data['payments_count'],
            ];
        }

        $this->repository->replace($organizationId, $toSave);

        return count($toSave);
    }
}
