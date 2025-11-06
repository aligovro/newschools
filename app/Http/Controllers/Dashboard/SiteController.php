<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Site;
use App\Models\Organization;
use App\Http\Resources\OrganizationSiteResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use App\Http\Requests\Site\StoreSiteRequest;
use App\Http\Requests\Site\UpdateSiteRequest;
use App\Services\GlobalSettingsService;
use Inertia\Inertia;

class SiteController extends Controller
{
  public function __construct()
  {
    $this->middleware('auth');
  }

  public function index(Request $request)
  {
    $query = Site::with(['organization'])
      ->withCount(['pages', 'widgets']);

    // Поиск
    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('name', 'like', "%{$search}%")
          ->orWhere('slug', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%")
          ->orWhereHas('organization', function ($orgQuery) use ($search) {
            $orgQuery->where('name', 'like', "%{$search}%");
          });
      });
    }

    // Фильтрация по статусу
    if ($request->filled('status')) {
      $query->where('status', $request->status);
    }

    // Фильтрация по шаблону
    if ($request->filled('template')) {
      $query->where('template', $request->template);
    }

    // Фильтрация по организации
    if ($request->filled('organization_id')) {
      $query->where('organization_id', $request->organization_id);
    }

    // Сортировка
    $sortBy = $request->get('sort_by', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');

    // Разрешенные поля для сортировки
    $allowedSortFields = ['name', 'created_at', 'updated_at', 'status', 'template'];
    if (in_array($sortBy, $allowedSortFields)) {
      $query->orderBy($sortBy, $sortDirection);
    } else {
      $query->orderBy('created_at', 'desc');
    }

    // Пагинация
    $perPage = min($request->get('per_page', 15), 100);
    $sites = $query->paginate($perPage);

    // Получаем организации для фильтра
    $organizations = Organization::select('id', 'name')
      ->orderBy('name')
      ->get();

    // Получаем доступные шаблоны
    $templates = \App\Models\SiteTemplate::select('slug', 'name')
      ->where('is_active', true)
      ->orderBy('sort_order')
      ->get();

    $globalSettings = app(GlobalSettingsService::class);
    $terminology = $globalSettings->getTerminology();

    return Inertia::render('sites/SiteManagementPage', [
      'sites' => InertiaResource::paginate($sites, OrganizationSiteResource::class),
      'organizations' => $organizations,
      'templates' => $templates,
      'filters' => $request->only(['search', 'status', 'template', 'organization_id', 'sort_by', 'sort_direction', 'per_page']),
      'terminology' => $terminology,
    ]);
  }

  public function show(Request $request, Site $site)
  {
    $user = $request->user();

    // Загружаем связи для проверки прав
    $site->load(['organization', 'domain']);

    // Проверка прав доступа
    // Суперадмин видит все, админ сайта - только свой сайт
    if (!$user->hasRole('super_admin')) {
      // Проверяем, является ли пользователь админом организации этого сайта
      if ($site->organization_id && $site->organization) {
        // Проверяем права доступа через связи пользователя с организацией
        $isOrgAdmin = $site->organization->users()
          ->where('user_id', $user->id)
          ->wherePivot('role', 'admin')
          ->exists();
        if (!$isOrgAdmin) {
          abort(403, 'У вас нет доступа к этому сайту');
        }
      } else {
        // Если сайт без организации, разрешаем только суперадмину
        abort(403, 'У вас нет доступа к этому сайту');
      }
    }

    // Загружаем страницы с пагинацией
    $pagesQuery = $site->pages()
      ->with(['parent:id,title,slug'])
      ->orderBy('sort_order')
      ->orderBy('created_at', 'desc');

    // Поиск по страницам
    if ($request->filled('page_search')) {
      $search = $request->page_search;
      $pagesQuery->where(function ($q) use ($search) {
        $q->where('title', 'like', "%{$search}%")
          ->orWhere('slug', 'like', "%{$search}%")
          ->orWhere('excerpt', 'like', "%{$search}%");
      });
    }

    // Фильтрация по статусу страниц
    if ($request->filled('page_status')) {
      $pagesQuery->where('status', $request->page_status);
    }

    $perPage = min($request->get('page_per_page', 10), 50);
    $pages = $pagesQuery->paginate($perPage, ['*'], 'page_page')
      ->withQueryString();

    // Загружаем виджеты
    $widgets = $site->widgets()->with(['widget', 'position'])->get();

    return Inertia::render('sites/Show', [
      'site' => [
        'id' => $site->id,
        'name' => $site->name,
        'slug' => $site->slug,
        'description' => $site->description,
        'template' => $site->template,
        'site_type' => $site->site_type,
        'status' => $site->status->value ?? $site->status,
        'is_public' => $site->is_public,
        'is_maintenance_mode' => $site->is_maintenance_mode,
        'logo' => $site->logo,
        'favicon' => $site->favicon,
        'created_at' => $site->created_at?->toISOString(),
        'updated_at' => $site->updated_at?->toISOString(),
        'published_at' => $site->published_at?->toISOString(),
        'organization' => $site->organization ? [
          'id' => $site->organization->id,
          'name' => $site->organization->name,
          'slug' => $site->organization->slug,
        ] : null,
        'domain' => $site->domain ? [
          'id' => $site->domain->id,
          'domain' => $site->domain->domain,
          'custom_domain' => $site->domain->custom_domain,
        ] : null,
        'pages_count' => $site->pages()->count(),
        'widgets_count' => $widgets->count(),
      ],
      'pages' => \App\Http\Resources\SitePageResource::collection($pages),
      'pageFilters' => $request->only(['page_search', 'page_status', 'page_per_page']),
    ]);
  }

  public function store(StoreSiteRequest $request)
  {
    $template = \App\Models\SiteTemplate::where('slug', $request->template)->first();

    $site = Site::create([
      'organization_id' => $request->organization_id,
      'name' => $request->name,
      'slug' => $request->slug,
      'description' => $request->description,
      'template' => $request->template,
      'site_type' => $request->get('site_type', 'organization'),
      'layout_config' => $template->layout_config ?? [],
      'theme_config' => $template->theme_config ?? [],
      'content_blocks' => [],
      'navigation_config' => [],
      'seo_config' => [
        'title' => $request->name,
        'description' => $request->description,
        'keywords' => [],
      ],
      'status' => 'draft',
      'is_public' => false,
      'is_maintenance_mode' => false,
    ]);

    return redirect()->back()->with('success', 'Сайт успешно создан');
  }

  public function update(UpdateSiteRequest $request, Site $site)
  {
    $site->update($request->only([
      'name',
      'slug',
      'description',
      'template',
      'status',
      'is_public',
      'is_maintenance_mode',
    ]));

    return redirect()->back()->with('success', 'Сайт успешно обновлен');
  }

  public function destroy(Site $site)
  {
    $site->delete();
    return redirect()->back()->with('success', 'Сайт успешно удален');
  }
}
