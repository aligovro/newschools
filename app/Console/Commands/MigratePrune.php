<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Удаляет устаревшие таблицы и записи из migrations.
 * Использует config('migrations.prune.tables_to_drop').
 */
class MigratePrune extends Command
{
    protected $signature = 'migrate:prune
        {--tables : Удалить устаревшие таблицы из config}
        {--orphans : Удалить записи migrations для несуществующих файлов}
        {--dry-run : Только показать, что будет сделано}
        {--force : Без подтверждения}';

    protected $description = 'Удалить устаревшие таблицы и выровнять таблицу migrations';

    public function handle(): int
    {
        $doTables = $this->option('tables');
        $doOrphans = $this->option('orphans');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');

        if (! $doTables && ! $doOrphans) {
            $this->warn('Укажите --tables и/или --orphans.');
            $this->line('  --tables   удалить таблицы из config(migrations.prune.tables_to_drop)');
            $this->line('  --orphans  удалить записи migrations для отсутствующих файлов');

            return self::FAILURE;
        }

        $changed = false;

        if ($doOrphans) {
            $changed = $this->pruneOrphanMigrations($dryRun, $force) || $changed;
        }

        if ($doTables) {
            $changed = $this->pruneObsoleteTables($dryRun, $force) || $changed;
        }

        if (! $changed) {
            $this->info('Нечего удалять.');
        }

        return self::SUCCESS;
    }

    private function pruneOrphanMigrations(bool $dryRun, bool $force): bool
    {
        $migrationsPath = database_path('migrations');
        $files = glob($migrationsPath . '/*.php');
        $existingFiles = collect($files)
            ->map(fn ($path) => pathinfo($path, PATHINFO_FILENAME))
            ->flip()
            ->all();

        $dbMigrations = DB::table('migrations')->pluck('migration');
        $orphans = $dbMigrations->filter(fn ($name) => ! isset($existingFiles[$name]))->values();

        if ($orphans->isEmpty()) {
            $this->info('Нет orphan-записей в migrations.');

            return false;
        }

        $this->warn('Orphan-записи в migrations (файлов нет): ' . $orphans->count());
        $this->table(['migration'], $orphans->map(fn ($m) => [$m])->toArray());

        if ($dryRun) {
            $this->comment('Режим dry-run: записи не удалены.');

            return true;
        }

        if (! $force && ! $this->confirm('Удалить эти записи из migrations?', true)) {
            return false;
        }

        DB::table('migrations')->whereIn('migration', $orphans->toArray())->delete();
        $this->info("Удалено записей: {$orphans->count()}.");

        return true;
    }

    private function pruneObsoleteTables(bool $dryRun, bool $force): bool
    {
        $tables = config('migrations.prune.tables_to_drop', []);

        if (empty($tables)) {
            $this->info('Нет таблиц в config(migrations.prune.tables_to_drop).');

            return false;
        }

        $toDrop = collect($tables)->filter(fn ($t) => Schema::hasTable($t))->values();

        if ($toDrop->isEmpty()) {
            $this->info('Указанные таблицы отсутствуют в БД.');

            return false;
        }

        $this->warn('Таблицы к удалению: ' . $toDrop->count());
        $this->table(['table'], $toDrop->map(fn ($t) => [$t])->toArray());

        if ($dryRun) {
            $this->comment('Режим dry-run: таблицы не удалены.');

            return true;
        }

        if (! $force && ! $this->confirm('Удалить эти таблицы?', true)) {
            return false;
        }

        foreach ($toDrop as $table) {
            Schema::dropIfExists($table);
            $this->line("  Удалена: {$table}");
        }
        $this->info("Удалено таблиц: {$toDrop->count()}.");

        return true;
    }
}
