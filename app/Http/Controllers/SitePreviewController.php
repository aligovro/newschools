<?php

namespace App\Http\Controllers;

use App\Models\OrganizationSite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SitePreviewController extends Controller
{
  /**
   * Показать превью сайта
   */
  public function preview(Request $request, $slug)
  {
    try {
      $site = OrganizationSite::where('slug', $slug)
        ->where('status', 'published')
        ->firstOrFail();

      // Получаем конфигурацию виджетов из нормализованных таблиц
      $widgetDataService = app(\App\Services\WidgetDataService::class);
      $widgetsConfig = $widgetDataService->getSiteWidgetsWithData($site->id);

      \Log::info('SitePreviewController::preview - widgets config:', [
        'site_id' => $site->id,
        'widgets_count' => count($widgetsConfig),
        'first_widget' => $widgetsConfig[0] ?? null,
      ]);

      return Inertia::render('SitePreview', [
        'site' => [
          'id' => $site->id,
          'name' => $site->name,
          'slug' => $site->slug,
          'description' => $site->description,
          'template' => $site->template,
          'widgets_config' => $widgetsConfig,
          'seo_config' => $site->seo_config ?? [],
        ],
      ]);
    } catch (\Exception $e) {
      abort(404, 'Сайт не найден');
    }
  }
}
