<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use App\Models\Organization;
use App\Models\Project;
use App\Services\WidgetDataService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;

class MainSiteController extends Controller
{
    private function getSiteWidgetsAndPositions()
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
                'seo_config' => $site->seo_config ?? [],
                'layout_config' => $site->layout_config ?? [],
            ],
            'positions' => $positions,
            'position_settings' => $positionSettings,
        ];
    }

    public function index(Request $request)
    {
        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/Index', $data);
    }

    public function organizations(Request $request)
    {
        $query = Organization::with(['region', 'city', 'adminUser'])
            ->where('status', 'active')
            ->where('is_public', true)
            ->withCount([
                'projects',
                'members',
                'donations as donations_total' => function ($q) {
                    $q->where('status', 'completed')->selectRaw('sum(amount)');
                },
                'donations as donations_collected' => function ($q) {
                    $q->where('status', 'completed')
                        ->whereNotNull('paid_at')
                        ->selectRaw('sum(amount)');
                },
                'donations as sponsors_count' => function ($q) {
                    $q->where('status', 'completed')
                        ->whereNotNull('paid_at')
                        ->selectRaw('COUNT(DISTINCT user_id)');
                }
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('region_id')) {
            $query->where('region_id', $request->region_id);
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        $organizations = $query->orderBy('created_at', 'desc')->paginate(12);

        // Форматируем данные организаций для отображения
        $organizations->getCollection()->transform(function ($org) {
            $org->logo = $org->logo ? '/storage/' . ltrim($org->logo, '/') : null;
            // Приоритет: logo, затем первая из галереи
            if (!empty($org->logo)) {
                $org->image = $org->logo;
            } elseif (!empty($org->images) && is_array($org->images) && count($org->images) > 0) {
                $org->image = '/storage/' . ltrim($org->images[0], '/');
            } else {
                $org->image = null;
            }
            // Убеждаемся что координаты доступны
            $org->latitude = $org->latitude;
            $org->longitude = $org->longitude;
            // Форматируем суммы из копеек в рубли
            $org->donations_total = $org->donations_total ? $org->donations_total / 100 : 0;
            $org->donations_collected = $org->donations_collected ? $org->donations_collected / 100 : 0;
            // Директор из adminUser
            if ($org->adminUser) {
                $org->director_name = $org->adminUser->name ?? null;
            }
            return $org;
        });

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/Organizations', array_merge($data, [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'region_id', 'city_id']),
        ]));
    }

    public function organization($slug)
    {
        $organization = Organization::where('slug', $slug)
            ->where('status', 'active')
            ->where('is_public', true)
            ->with(['region', 'city', 'projects' => function ($q) {
                $q->where('status', 'active')->limit(6);
            }])
            ->firstOrFail();

        // Подготавливаем галерею изображений
        $gallery = [];
        if (!empty($organization->images) && is_array($organization->images)) {
            $gallery = array_map(function ($image) {
                return '/storage/' . ltrim($image, '/');
            }, $organization->images);
        }

        // Подготавливаем данные организации для отображения
        $organizationData = [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
            'description' => $organization->description,
            'logo' => $organization->logo ? '/storage/' . $organization->logo : null,
            'gallery' => $gallery,
            'region' => $organization->region ? [
                'id' => $organization->region->id,
                'name' => $organization->region->name,
            ] : null,
            'city' => $organization->city ? [
                'id' => $organization->city->id,
                'name' => $organization->city->name,
            ] : null,
            'type' => $organization->type,
            'projects' => $organization->projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'slug' => $project->slug,
                    'description' => $project->description,
                    'image' => $project->image ? '/storage/' . $project->image : null,
                    'target_amount_rubles' => $project->target_amount_rubles ?? ($project->target_amount / 100),
                    'collected_amount_rubles' => $project->collected_amount_rubles ?? ($project->collected_amount / 100),
                    'progress_percentage' => $project->progress_percentage ?? 0,
                ];
            }),
        ];

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/OrganizationShow', array_merge($data, [
            'organization' => $organizationData,
            'organizationId' => $organization->id, // Передаем organizationId для виджетов
        ]));
    }

    public function projects(Request $request)
    {
        $query = Project::with(['organization', 'organization.region'])
            ->where('status', 'active');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $projects = $query->orderBy('created_at', 'desc')->paginate(12);

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/Projects', array_merge($data, [
            'projects' => $projects,
            'filters' => $request->only(['search', 'category']),
        ]));
    }

    public function project($slug)
    {
        $project = Project::where('slug', $slug)
            ->where('status', 'active')
            ->with(['organization', 'organization.region'])
            ->firstOrFail();

        // Подготавливаем галерею изображений
        $gallery = [];
        if (!empty($project->gallery) && is_array($project->gallery)) {
            $gallery = array_map(function ($image) {
                return '/storage/' . ltrim($image, '/');
            }, $project->gallery);
        }

        // Подготавливаем данные проекта для отображения
        $projectData = [
            'id' => $project->id,
            'title' => $project->title,
            'slug' => $project->slug,
            'description' => $project->description,
            'short_description' => $project->short_description,
            'image' => $project->image ? '/storage/' . ltrim($project->image, '/') : null,
            'gallery' => $gallery,
            'target_amount_rubles' => $project->target_amount_rubles ?? ($project->target_amount / 100),
            'collected_amount_rubles' => $project->collected_amount_rubles ?? ($project->collected_amount / 100),
            'progress_percentage' => $project->progress_percentage ?? 0,
            'has_stages' => $project->has_stages ?? false,
            'stages' => $project->stages ?? [],
            'category' => $project->category,
            'start_date' => $project->start_date,
            'end_date' => $project->end_date,
            'beneficiaries' => $project->beneficiaries ?? [],
            'progress_updates' => $project->progress_updates ?? [],
            'organization' => $project->organization ? [
                'id' => $project->organization->id,
                'name' => $project->organization->name,
                'slug' => $project->organization->slug,
            ] : null,
        ];

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/ProjectShow', array_merge($data, [
            'project' => $projectData,
        ]));
    }
}
