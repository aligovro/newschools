<?php

namespace App\Http\Controllers\Concerns;

use App\Models\Site;
use App\Models\SitePositionSetting;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use App\Services\SiteStylesService;
use App\Services\WidgetDataService;
use Illuminate\Support\Facades\Cache;

trait GetsSiteWidgetsData
{
    protected function getSiteWidgetsAndPositionsFor(Site $site): array
    {
        $widgetDataService = app(WidgetDataService::class);

        $widgetsConfig = Cache::remember(
            "site_widgets_config_{$site->id}",
            300,
            fn () => $widgetDataService->getSiteWidgetsWithData($site->id)
        );

        $positions = Cache::remember(
            "site_positions_{$site->template}",
            600,
            function () use ($site) {
                $template = SiteTemplate::where('slug', $site->template)->first();
                $query = WidgetPosition::active()->ordered();
                if ($template) {
                    $query->where(fn ($q) => $q->where('template_id', $template->id)->orWhereNull('template_id'));
                }
                return $query->get()->map(fn ($p) => [
                    'id' => $p->id,
                    'template_id' => $p->template_id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'description' => $p->description,
                    'area' => $p->area,
                    'order' => $p->order ?? $p->sort_order ?? 0,
                    'allowed_widgets' => $p->allowed_widgets ?? [],
                    'layout_config' => $p->layout_config ?? [],
                    'is_required' => $p->is_required ?? false,
                    'is_active' => $p->is_active ?? true,
                    'created_at' => $p->created_at?->toISOString(),
                    'updated_at' => $p->updated_at?->toISOString(),
                ]);
            }
        );

        $positionSettings = Cache::remember(
            "site_position_settings_{$site->id}",
            300,
            fn () => SitePositionSetting::where('site_id', $site->id)->get()->map(fn ($s) => [
                'position_slug' => $s->position_slug,
                'visibility_rules' => $s->visibility_rules ?? [],
                'layout_overrides' => $s->layout_overrides ?? [],
            ])
        );

        $custom = $site->custom_settings ?? [];
        $stylesService = app(SiteStylesService::class);
        return [
            'site' => array_merge([
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'description' => $site->description,
                'favicon' => $site->getFaviconUrlAttribute(),
                'template' => $site->template,
                'site_type' => $site->site_type,
                'organization_id' => $site->organization_id,
                'widgets_config' => $widgetsConfig,
                'seo_config' => $site->formatted_seo_config ?? [],
                'layout_config' => $site->layout_config ?? [],
                'custom_css' => $custom['custom_css'] ?? null,
            ], [
                'styles_file_path' => $stylesService->getStylesRelativePath($site->id),
                'styles_css_url' => $stylesService->getStylesCssUrl($site->id),
            ]),
            'positions' => $positions,
            'position_settings' => $positionSettings,
        ];
    }
}
