<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use App\Services\WidgetDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class MainSiteController extends Controller
{
    public function index(Request $request)
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
            'positions' => $positions,
        ]);
    }
}
