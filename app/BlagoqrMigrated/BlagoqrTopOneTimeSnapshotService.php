<?php

namespace App\BlagoqrMigrated;

use App\Enums\DonationStatus;
use App\Models\Donation;
use App\Services\ProjectDonations\ProjectDonationsService;
use Illuminate\Support\Facades\DB;

/**
 * Пересчёт снапшота «Топ поддержавших выпусков» из донатов организации.
 * Вызывается после миграции платежей из blagoqr или по команде для blagoqr-организаций.
 * Группирует по нормализованной категории (Выпуск X г., Друзья лицея, Родители) и пишет в organization_blagoqr_top_one_time_snapshots.
 */
final class BlagoqrTopOneTimeSnapshotService
{
    public function __construct(
        private BlagoqrMigratedOrgResolver $resolver,
        private BlagoqrTopOneTimeSnapshotRepository $repository,
    ) {}

    /**
     * Посчитать по донатам организации и сохранить снапшот.
     * Берёт только Completed донаты, группирует по donor_name с нормализацией под выпуски/роли.
     */
    public function computeAndSaveForOrganization(int $organizationId): int
    {
        if (!$this->resolver->isBlagoqrMigratedById($organizationId)) {
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
