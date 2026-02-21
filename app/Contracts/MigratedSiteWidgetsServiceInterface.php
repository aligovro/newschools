<?php

namespace App\Contracts;

use App\Models\Site;

/**
 * Контракт для создания виджетов сайта по пресету (legacy/migrated sites).
 * Реализация живёт в модуле blagoqr_import и использует промежуточные таблицы импорта.
 */
interface MigratedSiteWidgetsServiceInterface
{
    /**
     * Создать виджеты для сайта по пресету.
     *
     * @param  array<string, mixed>|null  $preset  Ключи: template, positions (массив с position_slug, widgets)
     * @return array{created: int, skipped: int, errors: array<int, string>}
     */
    public function seedFromPreset(Site $site, ?array $preset = null): array;

    /**
     * Обновить счётчики у виджетов share_buttons из данных импорта.
     *
     * @return int Количество обновлённых виджетов
     */
    public function updateShareButtonsCountsFromWpOptions(int $organizationId): int;
}
