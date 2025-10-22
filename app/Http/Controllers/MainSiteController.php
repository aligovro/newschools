<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Services\WidgetDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $widgetsConfig = $widgetDataService->getSiteWidgetsWithData($site->id);

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
    }
}
