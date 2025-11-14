<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SitePreviewController extends Controller
{
    /**
     * Показать превью сайта
     */
    public function preview(Request $request, $slug)
    {
        try {
            $site = Cache::remember("site_by_slug_{$slug}", 300, function () use ($slug) {
                return Site::where('slug', $slug)
                    ->where('status', 'published')
                    ->firstOrFail();
            });

            // Получаем конфигурацию виджетов из нормализованных таблиц (с кешем)
            $widgetsConfig = Cache::remember("site_widgets_config_{$site->id}", 300, function () use ($site) {
                $widgetDataService = app(\App\Services\WidgetDataService::class);
                return $widgetDataService->getSiteWidgetsWithData($site->id);
            });

            // Позиции для шаблона (с кешем)
            $positions = Cache::remember("site_positions_{$site->template}", 600, function () use ($site) {
                $template = SiteTemplate::where('slug', $site->template)->first();
                $query = WidgetPosition::active()->ordered();
                if ($template) {
                    $query->where(function ($q) use ($template) {
                        $q->where('template_id', $template->id)->orWhereNull('template_id');
                    });
                }
                return $query->get();
            });

            $positionSettings = Cache::remember("site_position_settings_{$site->id}", 300, function () use ($site) {
                return \App\Models\SitePositionSetting::where('site_id', $site->id)->get();
            });

            Log::info('SitePreviewController::preview - widgets config:', [
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
                    'seo_config' => $site->formatted_seo_config ?? [],
                ],
                'positions' => $positions,
                'position_settings' => $positionSettings,
            ]);
        } catch (\Exception $e) {
            abort(404, 'Сайт не найден');
        }
    }
}
