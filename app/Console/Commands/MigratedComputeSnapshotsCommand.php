<?php

namespace App\Console\Commands;

use App\Migrated\MigratedTopOneTimeSnapshotService;
use App\Migrated\MigratedTopRecurringSnapshotService;
use App\Models\Organization;
use Illuminate\Console\Command;

/**
 * Пересчёт снапшотов «Топ поддержавших выпусков» и «Топ регулярно-поддерживающих»
 * для мигрированных организаций (is_legacy_migrated).
 * Используется после миграции или при необходимости обновить данные.
 */
class MigratedComputeSnapshotsCommand extends Command
{
    protected $signature = 'migrated:compute-snapshots
        {--organization-id= : ID организации (если не указан — все is_legacy_migrated)}';

    protected $description = 'Пересчёт снапшотов топов для мигрированных организаций';

    public function handle(
        MigratedTopOneTimeSnapshotService $topOneTimeService,
        MigratedTopRecurringSnapshotService $topRecurringService
    ): int {
        $organizationId = $this->option('organization-id');

        $organizations = $organizationId
            ? Organization::where('id', (int) $organizationId)->where('is_legacy_migrated', true)->get()
            : Organization::where('is_legacy_migrated', true)->get();

        if ($organizations->isEmpty()) {
            $this->warn('Нет мигрированных организаций для обработки.');
            return self::SUCCESS;
        }

        foreach ($organizations as $org) {
            $this->info("Организация #{$org->id} ({$org->name})...");
            $oneTimeCount = $topOneTimeService->computeAndSaveForOrganization($org->id);
            $recurringCount = $topRecurringService->computeAndSaveForOrganization($org->id);
            $this->line("  Топ поддержавших: {$oneTimeCount} записей, Топ регулярно-поддерживающих: {$recurringCount} записей");
        }

        $this->info('Готово.');
        return self::SUCCESS;
    }
}
