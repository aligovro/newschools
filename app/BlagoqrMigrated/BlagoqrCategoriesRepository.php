<?php

namespace App\BlagoqrMigrated;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Хранение категорий доноров (выпуски, роли) для организаций из blagoqr.
 * Только таблица organization_blagoqr_categories — без смешивания с основной логикой.
 */
final class BlagoqrCategoriesRepository
{
    /**
     * @return Collection<int, object{id: int, key: string, label: string, type: string, display_order: int}>
     */
    public function getCategories(int $organizationId): Collection
    {
        return DB::table('organization_blagoqr_categories')
            ->where('organization_id', $organizationId)
            ->orderBy('display_order')
            ->orderBy('label')
            ->get();
    }

    /**
     * Синхронизировать список категорий: вставка новых, обновление label/type у существующих.
     *
     * @param  array<int, array{key: string, label: string, type: string}>  $categories
     */
    public function syncCategories(int $organizationId, array $categories): void
    {
        $existingKeys = DB::table('organization_blagoqr_categories')
            ->where('organization_id', $organizationId)
            ->pluck('key')
            ->all();

        $now = now();
        $order = 0;
        foreach ($categories as $cat) {
            $key = $cat['key'] ?? '';
            $label = $cat['label'] ?? $key;
            $type = $cat['type'] ?? 'graduate';
            if ($key === '') {
                continue;
            }
            DB::table('organization_blagoqr_categories')->updateOrInsert(
                [
                    'organization_id' => $organizationId,
                    'key' => $key,
                ],
                [
                    'label' => $label,
                    'type' => $type,
                    'display_order' => $order++,
                    'updated_at' => $now,
                ]
            );
        }

        $newKeys = array_column($categories, 'key');
        $toDelete = array_diff($existingKeys, array_filter($newKeys));
        if (!empty($toDelete)) {
            DB::table('organization_blagoqr_categories')
                ->where('organization_id', $organizationId)
                ->whereIn('key', $toDelete)
                ->delete();
        }
    }
}
