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

    return [
      'site' => [
        'id' => $site->id,
        'name' => $site->name,
        'slug' => $site->slug,
        'description' => $site->description,
        'favicon' => $site->getFaviconUrlAttribute(),
        'template' => $site->template,
        'widgets_config' => $widgetsConfig,
        'seo_config' => $site->seo_config ?? [],
        'layout_config' => $site->layout_config ?? [],
      ],
      'positions' => $positions,
    ];
  }

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

    $data = $this->getSiteWidgetsAndPositions();

    return Inertia::render('SitePreview', $data);
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
      $org->logo = $org->logo ? '/storage/' . $org->logo : null;
      $org->image = !empty($org->images) && is_array($org->images) && count($org->images) > 0
        ? '/storage/' . $org->images[0]
        : null;
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

    // Подготавливаем данные организации для отображения
    $organizationData = [
      'id' => $organization->id,
      'name' => $organization->name,
      'slug' => $organization->slug,
      'description' => $organization->description,
      'logo' => $organization->logo ? '/storage/' . $organization->logo : null,
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

    $data = $this->getSiteWidgetsAndPositions();

    return Inertia::render('main-site/ProjectShow', array_merge($data, [
      'project' => $project,
    ]));
  }
}
