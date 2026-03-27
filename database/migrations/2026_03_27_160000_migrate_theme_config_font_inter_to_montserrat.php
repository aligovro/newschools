<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * В theme_config у сайтов и шаблонов ранее по умолчанию был Inter; приводим к Montserrat (как в макете).
     * Трогаем только строки, где в JSON явно указан Inter (без изменения остальных шрифтов).
     */
    public function up(): void
    {
        foreach (['sites', 'site_templates'] as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'theme_config')) {
                continue;
            }

            $this->migrateTableThemeFont($table);
        }
    }

    /**
     * Откат не выполняем: после миграции часть записей с Montserrat могла быть изменена вручную;
     * обратная замена Montserrat → Inter испортила бы такие данные.
     */
    public function down(): void
    {
        // intentionally empty
    }

    private function migrateTableThemeFont(string $table): void
    {
        DB::table($table)
            ->whereNotNull('theme_config')
            ->orderBy('id')
            ->chunkById(100, function ($rows) use ($table): void {
                foreach ($rows as $row) {
                    $config = $this->decodeThemeConfig($row->theme_config);
                    if ($config === null) {
                        continue;
                    }

                    $current = $config['font_family'] ?? null;
                    if (! is_string($current) || strcasecmp(trim($current), 'Inter') !== 0) {
                        continue;
                    }

                    $config['font_family'] = 'Montserrat';

                    DB::table($table)->where('id', $row->id)->update([
                        'theme_config' => json_encode($config, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
                    ]);
                }
            });
    }

    /**
     * @return array<string, mixed>|null
     */
    private function decodeThemeConfig(mixed $raw): ?array
    {
        if ($raw === null || $raw === '') {
            return null;
        }

        if (is_array($raw)) {
            return $raw;
        }

        if (! is_string($raw)) {
            return null;
        }

        try {
            $decoded = json_decode($raw, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return null;
        }

        return is_array($decoded) ? $decoded : null;
    }
};
