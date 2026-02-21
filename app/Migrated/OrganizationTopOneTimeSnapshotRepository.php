<?php

namespace App\Migrated;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Снапшот «Топ поддержавших выпусков» (разовые платежи по категориям) для мигрированных организаций.
 * Таблица organization_top_one_time_snapshots.
 */
final class OrganizationTopOneTimeSnapshotRepository
{
    /**
     * @return Collection<int, object{donor_label: string, total_amount: int, payments_count: int}>
     */
    public function get(int $organizationId): Collection
    {
        return DB::table('organization_top_one_time_snapshots')
            ->where('organization_id', $organizationId)
            ->orderByDesc('total_amount')
            ->get();
    }

    /**
     * Полностью заменить снапшот для организации.
     *
     * @param  array<int, array{donor_label: string, total_amount: int, payments_count: int}>  $rows
     */
    public function replace(int $organizationId, array $rows): void
    {
        DB::table('organization_top_one_time_snapshots')
            ->where('organization_id', $organizationId)
            ->delete();

        if (empty($rows)) {
            return;
        }

        $now = now();
        $insert = [];
        foreach ($rows as $row) {
            $insert[] = [
                'organization_id' => $organizationId,
                'donor_label' => $row['donor_label'],
                'total_amount' => (int) ($row['total_amount'] ?? 0),
                'payments_count' => (int) ($row['payments_count'] ?? 0),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('organization_top_one_time_snapshots')->insert($insert);
    }
}
