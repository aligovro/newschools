<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use App\Services\WidgetDataService;
use Illuminate\Support\Facades\Cache;

trait HasSiteWidgets
{
    /**
     * Получение виджетов и позиций главного сайта
     * Используется для отображения виджетов на публичных страницах
     */
    protected function getSiteWidgetsAndPositions(): array
    {
        $site = Site::where('site_type', 'main')->published()->first();

        if (!$site) {
            abort(404, 'Главный сайт не настроен');
        }

        /** @var WidgetDataService $widgetDataService */
        $widgetDataService = app(WidgetDataService::class);
        $widgetsConfig = Cache::remember("site_widgets_config_{$site->id}", 300, function () use ($widgetDataService, $site) {
            return $widgetDataService->getSiteWidgetsWithData($site->id);
        });

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

        return [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'description' => $site->description,
                'favicon' => $site->getFaviconUrlAttribute(),
                'template' => $site->template,
                'site_type' => $site->site_type,
                'widgets_config' => $widgetsConfig,
                'seo_config' => $site->formatted_seo_config ?? [],
                'layout_config' => $site->layout_config ?? [],
            ],
            'positions' => $positions,
            'position_settings' => $positionSettings,
        ];
    }
}

