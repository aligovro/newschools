<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class ClearSiteCache extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'site:clear-cache {site_id? : ID сайта для очистки кеша}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Очистить кеш виджетов и настроек для сайта';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $siteId = $this->argument('site_id');

        if ($siteId) {
            // Очищаем кеш для конкретного сайта
            Cache::forget("site_widgets_config_{$siteId}");
            Cache::forget("site_widget_settings_{$siteId}");
            Cache::forget("site_positions_{$siteId}");
            Cache::forget("site_position_settings_{$siteId}");

            // Очищаем кеш страниц сайта
            $cacheKeys = Cache::get("site_{$siteId}_page_keys", []);
            foreach ($cacheKeys as $key) {
                Cache::forget($key);
            }
            Cache::forget("site_{$siteId}_page_keys");

            $this->info("Кеш для сайта #{$siteId} успешно очищен!");
        } else {
            // Очищаем весь кеш виджетов
            $this->info('Очистка всего кеша виджетов...');
            Cache::flush();
            $this->info('Весь кеш успешно очищен!');
        }

        return Command::SUCCESS;
    }
}
