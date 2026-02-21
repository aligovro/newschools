<?php

namespace App\Services;

use App\Contracts\MigratedSiteWidgetsServiceInterface;
use App\Models\Site;

/**
 * Заглушка, когда модуль blagoqr_import не загружен.
 * Реализация с доступом к промежуточным таблицам импорта живёт в blagoqr_import.
 */
final class NullMigratedSiteWidgetsService implements MigratedSiteWidgetsServiceInterface
{
    public function seedFromPreset(Site $site, ?array $preset = null): array
    {
        return ['created' => 0, 'skipped' => 0, 'errors' => []];
    }

    public function updateShareButtonsCountsFromWpOptions(int $organizationId): int
    {
        return 0;
    }
}
