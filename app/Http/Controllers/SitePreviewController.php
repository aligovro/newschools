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

      // Получаем конфигурацию виджетов
      $widgetsConfig = $site->widgets_config ?? [];

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
