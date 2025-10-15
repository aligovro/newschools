<?php

namespace App\Console\Commands;

use App\Models\SiteWidget;
use App\Services\WidgetDataService;
use Illuminate\Console\Command;

class MigrateWidgetData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'widgets:migrate-data {--site-id= : ID сайта для миграции (опционально)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Мигрировать данные виджетов из JSON в нормализованные таблицы';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Начинаем миграцию данных виджетов...');

        $siteId = $this->option('site-id');
        $widgetDataService = app(WidgetDataService::class);

        // Получаем виджеты для миграции
        $query = SiteWidget::with(['widget', 'position']);

        if ($siteId) {
            $query->where('site_id', $siteId);
            $this->info("Мигрируем данные для сайта ID: {$siteId}");
        } else {
            $this->info('Мигрируем данные для всех сайтов');
        }

        $widgets = $query->get();
        $this->info("Найдено виджетов для миграции: {$widgets->count()}");

        $bar = $this->output->createProgressBar($widgets->count());
        $bar->start();

        $migrated = 0;
        $errors = 0;

        foreach ($widgets as $widget) {
            try {
                // Обновляем slug поля
                $widget->update([
                    'widget_slug' => $widget->widget->slug ?? 'unknown',
                    'position_slug' => $widget->position->slug ?? 'unknown',
                    'sort_order' => $widget->order ?? 0,
                ]);

                // Мигрируем данные
                $widgetDataService->migrateWidgetData($widget);
                $migrated++;
            } catch (\Exception $e) {
                $this->error("Ошибка при миграции виджета ID {$widget->id}: " . $e->getMessage());
                $errors++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();

        $this->info("Миграция завершена!");
        $this->info("Успешно мигрировано: {$migrated}");
        $this->info("Ошибок: {$errors}");

        // Показываем статистику
        $stats = $widgetDataService->getWidgetStats($siteId ?? 0);
        $this->info("Статистика по типам виджетов:");
        foreach ($stats as $type => $count) {
            $this->line("  {$type}: {$count}");
        }

        return Command::SUCCESS;
    }
}
