<?php

namespace App\BlagoqrMigrated;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Снапшот «Топ регулярно-поддерживающих» для организаций из blagoqr.
 * Читает/пишет только organization_top_recurring_snapshots (отдельно от основной логики топа по донатам).
 */
final class BlagoqrTopRecurringSnapshotRepository
{
    /**
     * @return Collection<int, object{donor_label: string, total_amount: int, donations_count: int}>
     */
    public function get(int $organizationId): Collection
    {
        return DB::table('organization_top_recurring_snapshots')
            ->where('organization_id', $organizationId)
            ->orderByDesc('total_amount')
            ->get();
    }

    /**
     * Полностью заменить снапшот для организации.
     *
     * @param  array<int, array{donor_label: string, total_amount: int, donations_count: int}>  $rows
     */
    public function replace(int $organizationId, array $rows): void
    {
        DB::table('organization_top_recurring_snapshots')
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
                'donations_count' => (int) ($row['donations_count'] ?? 0),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('organization_top_recurring_snapshots')->insert($insert);
    }
}
