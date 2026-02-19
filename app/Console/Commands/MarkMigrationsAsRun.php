<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Добавляет записи в таблицу migrations для миграций, которые уже применены к БД,
 * но отсутствуют в таблице. Не выполняет код миграций — только вносит записи.
 *
 * По умолчанию помечает только миграции ДО 2026_02_12_000000 (старые).
 * Миграции от 2026_02_12_000000 и ниже остаются для php artisan migrate.
 */
class MarkMigrationsAsRun extends Command
{
    private const CUTOFF = '2026_02_12_000000_create_blagoqr_import_tables';

    protected $signature = 'migrate:mark-run
        {--before= : Только миграции до этой (по умолчанию: 2026_02_12_000000_create_blagoqr_import_tables)}
        {--all : Пометить все отсутствующие, включая новые}
        {--dry-run : Только показать, что будет добавлено}
        {--force : Без подтверждения}';

    protected $description = 'Добавить в migrations записи для старых миграций (новые от 2026_02_12 — для migrate)';

    public function handle(): int
    {
        $migrationsPath = database_path('migrations');
        $files = glob($migrationsPath . '/*.php');

        $migrationNames = collect($files)
            ->map(fn ($path) => pathinfo($path, PATHINFO_FILENAME))
            ->sort()
            ->values();

        $existing = DB::table('migrations')->pluck('migration')->toArray();
        $missing = $migrationNames->diff($existing)->values();

        if (! $this->option('all')) {
            $before = $this->option('before') ?: self::CUTOFF;
            $before = str_ends_with($before, '.php') ? pathinfo($before, PATHINFO_FILENAME) : $before;
            $missing = $missing->filter(fn ($name) => $name < $before)->values();
        }

        if ($missing->isEmpty()) {
            $this->info('Нет миграций для добавления.');
            if (! $this->option('all')) {
                $this->comment('  (Помечаются только миграции до ' . self::CUTOFF . ')');
            }

            return self::SUCCESS;
        }

        $this->info('Найдено миграций для добавления: ' . $missing->count());
        if (! $this->option('all')) {
            $this->comment('  Только до ' . self::CUTOFF . '. Новые (от неё) — для php artisan migrate');
        }
        $this->table(['Миграция'], $missing->map(fn ($m) => [$m])->toArray());

        if ($this->option('dry-run')) {
            $this->warn('Режим dry-run: записи не добавлены.');

            return self::SUCCESS;
        }

        if (! $this->option('force') && ! $this->confirm('Добавить эти записи в migrations?', true)) {
            return self::FAILURE;
        }

        $nextBatch = (int) DB::table('migrations')->max('batch') + 1;

        foreach ($missing as $name) {
            DB::table('migrations')->insert([
                'migration' => $name,
                'batch' => $nextBatch,
            ]);
        }

        $this->info("Добавлено записей: {$missing->count()} (batch {$nextBatch}).");

        return self::SUCCESS;
    }
}
