<?php

namespace App\Console\Commands;

use App\Models\Site;
use App\Models\SiteWidget;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Services\WidgetDataService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateWidgetsConfig extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'widgets:migrate-config {--site-id= : ID сайта для миграции (опционально)}';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Мигрировать данные виджетов из widgets_config в нормализованные таблицы';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Начинаем миграцию данных из widgets_config...');

    $siteId = $this->option('site-id');
    $widgetDataService = app(WidgetDataService::class);

    // Получаем сайты для миграции
    $query = Site::whereNotNull('widgets_config');

    if ($siteId) {
      $query->where('id', $siteId);
      $this->info("Мигрируем данные для сайта ID: {$siteId}");
    } else {
      $this->info('Мигрируем данные для всех сайтов');
    }

    $sites = $query->get();
    $this->info("Найдено сайтов для миграции: {$sites->count()}");

    $totalWidgets = 0;
    $migratedWidgets = 0;
    $errors = 0;

    foreach ($sites as $site) {
      $this->info("Обрабатываем сайт ID: {$site->id} - {$site->name}");

      $widgetsConfig = $site->widgets_config ?? [];
      $this->info("  Виджетов в config: " . count($widgetsConfig));

      $totalWidgets += count($widgetsConfig);

      // Очищаем старые виджеты из site_widgets
      SiteWidget::where('site_id', $site->id)->delete();
      $this->info("  Удалены старые виджеты из site_widgets");

      foreach ($widgetsConfig as $widgetData) {
        try {
          // Находим widget и position
          $widget = Widget::where('widget_slug', $widgetData['widget_slug'])->first();
          $position = WidgetPosition::where('slug', $widgetData['position_slug'])->first();

          if (!$widget) {
            $this->warn("    Widget не найден: {$widgetData['widget_slug']}");
            continue;
          }

          if (!$position) {
            $this->warn("    Position не найден: {$widgetData['position_slug']}");
            continue;
          }

          // Создаем SiteWidget
          $config = $widgetData['config'] ?? [];
          $settings = $widgetData['settings'] ?? [];

          $siteWidget = new SiteWidget();
          $siteWidget->site_id = $site->id;
          $siteWidget->widget_id = $widget->id;
          $siteWidget->position_id = $position->id;
          $siteWidget->name = $widgetData['name'];
          $siteWidget->position_name = $widgetData['position_name'];
          $siteWidget->position_slug = $widgetData['position_slug'];
          $siteWidget->widget_slug = $widgetData['slug'];
          $siteWidget->config = $config;
          $siteWidget->settings = $settings;
          $siteWidget->order = $widgetData['order'] ?? 0;
          $siteWidget->sort_order = $widgetData['order'] ?? 0;
          $siteWidget->is_active = $widgetData['is_active'] ?? true;
          $siteWidget->is_visible = $widgetData['is_visible'] ?? true;
          $siteWidget->save();

          $this->info("    Config keys: " . implode(', ', array_keys($config)));

          // Мигрируем данные в нормализованные таблицы
          $this->info("    Calling migrateWidgetData for {$widgetData['name']}");
          $widgetDataService->migrateWidgetData($siteWidget);

          // Проверяем результат миграции
          $siteWidget->refresh();
          $configsCount = $siteWidget->configs->count();
          $heroSlidesCount = $siteWidget->heroSlides->count();
          $formFieldsCount = $siteWidget->formFields->count();

          $migratedWidgets++;
          $this->info("    ✓ Мигрирован виджет: {$widgetData['name']} ({$widgetData['slug']}) - configs: {$configsCount}, hero slides: {$heroSlidesCount}, form fields: {$formFieldsCount}");
        } catch (\Exception $e) {
          $this->error("    ✗ Ошибка при миграции виджета {$widgetData['name']}: " . $e->getMessage());
          $errors++;
        }
      }
    }

    $this->info("Миграция завершена!");
    $this->info("Всего виджетов в config: {$totalWidgets}");
    $this->info("Успешно мигрировано: {$migratedWidgets}");
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
