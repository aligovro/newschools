<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Http\Resources\ProjectExpenseReportResource;
use App\Http\Resources\Sponsors\SponsorResource;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Services\ProjectDonations\ProjectDonationsService;
use App\Services\ReferralService;
use App\Services\Seo\SeoPresenter;
use App\Services\Sponsors\ProjectSponsorService;
use App\Support\Money;
use App\Support\PublicDonationPrivacy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicProjectController extends Controller
{
  use HasSiteWidgets;

  public function __construct(
    private readonly ProjectSponsorService $projectSponsorService,
    private readonly ProjectDonationsService $donationsService,
    private readonly SeoPresenter $seoPresenter,
    private readonly ReferralService $referralService,
  ) {}

  /**
   * Отображение списка проектов
   * На кастомном домене организации показываются только проекты этой организации.
   */
  public function index(Request $request)
  {
    $orgId = app()->bound('current_organization_id') ? app('current_organization_id') : null;

    $query = Project::with(['organization', 'organization.region', 'organization.locality', 'categories'])
      ->when($orgId !== null, fn ($q) => $q->where('organization_id', $orgId))
      ->where('status', 'active');

    if ($request->filled('search')) {
      $search = $request->search;
      $query->where(function ($q) use ($search) {
        $q->where('title', 'like', "%{$search}%")
          ->orWhere('description', 'like', "%{$search}%");
      });
    }

    // Фильтр по категории через связь many-to-many
    if ($request->filled('category') && $request->category !== '') {
      $query->whereHas('categories', function ($q) use ($request) {
        $q->where('slug', $request->category);
      });
    }

    // Фильтр по городу / населённому пункту организации (locality_id = locality_id)
    if ($request->filled('locality_id')) {
      $query->whereHas('organization.locality', function ($q) use ($request) {
        $q->where('id', $request->locality_id);
      });
    }

    $projects = $query->orderBy('created_at', 'desc')->paginate(6);

    // Форматируем данные проектов для отображения
    $projects->getCollection()->transform(function ($project) {
      $project->image = $project->image ? '/storage/' . ltrim($project->image, '/') : null;

      $funding = $project->funding;
      $project->funding = $funding;
      $project->target_amount_rubles = $funding['target']['value'];
      $project->collected_amount_rubles = $funding['collected']['value'];
      $project->progress_percentage = $funding['progress_percentage'];

      // Основная категория проекта (slug первой категории из связи)
      if ($project->relationLoaded('categories') && $project->categories->isNotEmpty()) {
        $project->category = $project->categories->first()->slug ?? null;
      } else {
        $project->category = null;
      }

      // Форматируем данные организации
      if ($project->organization) {
        $org = $project->organization;
        $project->organization_name = $org->name;
        $project->organization_address = $org->address ?? '';
        if ($org->locality) {
          $project->organization_address = ($org->locality->name ?? '') .
            ($org->address ? ', ' . $org->address : '');
        }
        $project->organization = [
          'name' => $org->name,
          'slug' => $org->slug,
        ];
      }

      return $project;
    });

    $data = $this->getSiteWidgetsAndPositions();

    $filters = $request->only(['search', 'category', 'locality_id']);
    // Преобразуем locality_id в число, если он есть
    if (isset($filters['locality_id']) && $filters['locality_id'] !== null) {
      $filters['locality_id'] = (int) $filters['locality_id'];
    }

    // Получаем категории из БД с кешированием
    $categories = $this->getProjectCategories();

    return Inertia::render('main-site/Projects', array_merge($data, [
      'projects' => $projects,
      'filters' => $filters,
      'categories' => $categories,
    ]));
  }

  /**
   * Отображение конкретного проекта
   * На домене организации показывается только проект этой организации.
   */
  public function show($slug)
  {
    $orgId = app()->bound('current_organization_id') ? app('current_organization_id') : null;

    $project = Project::query()
      ->when($orgId !== null, fn ($q) => $q->where('organization_id', $orgId))
      ->where('slug', $slug)
      ->whereIn('status', ['active', 'completed'])
      ->with([
        'organization',
        'organization.region',
        'organization.locality',
        'categories',
        'budgetItems',
        'stages' => function ($query) {
          $query->orderBy('sort_order', 'asc');
        }
      ])
      ->firstOrFail();

    // Подготавливаем галерею изображений
    $gallery = [];
    if (!empty($project->gallery) && is_array($project->gallery)) {
      $gallery = array_map(function ($image) {
        return '/storage/' . ltrim($image, '/');
      }, $project->gallery);
    }

    // Форматируем этапы проекта
    $stages = [];
    if ($project->stages && $project->stages->count() > 0) {
      $stages = $project->stages->map(function ($stage) use ($project) {
        $funding = $stage->funding;

        return [
          'id' => $stage->id,
          'stage_number' => $stage->sort_order,
          'title' => $stage->title,
          'description' => $stage->description,
          'image' => $stage->image ? '/storage/' . ltrim($stage->image, '/') : null,
          'funding' => $funding,
          'target_amount_rubles' => $funding['target']['value'],
          'collected_amount_rubles' => $funding['collected']['value'],
          'progress_percentage' => $funding['progress_percentage'],
          'formatted_target_amount' => $funding['target']['formatted'],
          'formatted_collected_amount' => $funding['collected']['formatted'],
          'status' => $stage->status ?? 'pending',
          'is_completed' => $stage->is_completed ?? false,
          'is_active' => $stage->is_active ?? false,
          'is_pending' => $stage->is_pending ?? false,
          'sort_order' => $stage->sort_order,
          'project_url' => '/project/' . $project->slug,
        ];
      })->sortByDesc('sort_order')->values()->toArray();
    }

    // Подготавливаем данные проекта для отображения
    $projectFunding = $project->funding;

    // Основная категория проекта (slug первой категории), если есть
    $primaryCategorySlug = $project->relationLoaded('categories') && $project->categories->isNotEmpty()
      ? ($project->categories->first()->slug ?? null)
      : null;

    $projectData = [
      'id' => $project->id,
      'title' => $project->title,
      'slug' => $project->slug,
      'description' => $project->description,
      'short_description' => $project->short_description,
      'image' => $project->image ? '/storage/' . ltrim($project->image, '/') : null,
      'gallery' => $gallery,
      'funding' => $projectFunding,
      'target_amount_rubles' => $projectFunding['target']['value'],
      'collected_amount_rubles' => $projectFunding['collected']['value'],
      'progress_percentage' => $projectFunding['progress_percentage'],
      'formatted_target_amount' => $projectFunding['target']['formatted'],
      'formatted_collected_amount' => $projectFunding['collected']['formatted'],
      'has_stages' => $project->has_stages ?? false,
      'stages' => $stages,
      // slug основной категории (через связь), вместо легаси-enum поля
      'category' => $primaryCategorySlug,
      'start_date' => $project->start_date,
      'end_date' => $project->end_date,
      'beneficiaries' => $project->beneficiaries ?? [],
      'progress_updates' => $project->progress_updates ?? [],
      'organization' => $project->organization ? [
        'id' => $project->organization->id,
        'name' => $project->organization->name,
        'slug' => $project->organization->slug,
        'address' => $project->organization->address,
        'locality' => $project->organization->locality ? [
          'id' => $project->organization->locality->id,
          'name' => $project->organization->locality->name,
        ] : null,
      ] : null,
      'seo_settings' => $project->seo_settings ?? [],
      'monthly_goal_amount' => $project->monthly_goal_amount,
      'donors_count' => $project->donations()
        ->where('status', 'completed')
        ->distinct('donor_id')
        ->whereNotNull('donor_id')
        ->count('donor_id'),
      'top_payment_amount' => (int) ($project->donations()
        ->where('status', 'completed')
        ->max('amount') ?? 0),
    ];

    $sponsorsPaginator = $this->projectSponsorService->paginate(
      $project,
      'top',
      ProjectSponsorService::DEFAULT_PER_PAGE,
      1,
    );

    $sponsorsPayload = [
      'sort' => 'top',
      'data' => SponsorResource::collection(collect($sponsorsPaginator->items()))->resolve(),
      'pagination' => [
        'current_page' => $sponsorsPaginator->currentPage(),
        'last_page' => $sponsorsPaginator->lastPage(),
        'per_page' => $sponsorsPaginator->perPage(),
        'total' => $sponsorsPaginator->total(),
      ],
    ];

    // Общее число уникальных доноров (та же логика, что у вкладки «Все поступления»)
    $totalDonationsCount = $this->projectSponsorService->countAll($project);

    $topRecurring = $this->donationsService->topRecurringByDonorName(
      $project,
      ProjectDonationsService::PERIOD_ALL,
      1,
      6,
    );
    if (! empty($topRecurring['data'])) {
      $topRecurring['data'] = PublicDonationPrivacy::mapTopDonorRows($topRecurring['data']);
    }

    // Статьи расходов
    $budgetItems = $project->budgetItems->map(fn ($item) => [
      'id'               => $item->id,
      'title'            => $item->title,
      'amount_kopecks'   => $item->amount_kopecks,
      'amount_rubles'    => $item->amount_rubles,
      'formatted_amount' => $item->formatted_amount,
      'sort_order'       => $item->sort_order,
    ])->values()->toArray();

    // Сколько собрано в текущем месяце (для pill «Цель на месяц»)
    $monthlyCollectedKopecks = $project->monthly_goal_amount
      ? (int) $project->donations()
          ->where('status', 'completed')
          ->whereYear('created_at', now()->year)
          ->whereMonth('created_at', now()->month)
          ->sum('amount')
      : null;

    // Рейтинг по приглашениям (начальные данные — первая страница)
    $referralLeaderboard = $project->organization_id
      ? $this->referralService->getOrganizationLeaderboard($project->organization_id, [
          'per_page' => 6,
          'sort_by'  => 'invites',
        ])
      : ['data' => [], 'meta' => []];

    // ─── Отчёты по расходам (начальные данные для публичной страницы) ────────────
    $expenseReportMonths = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

    $monthTabs = $project->expenseReports()
      ->selectRaw('YEAR(report_date) as year, MONTH(report_date) as month, COUNT(*) as cnt')
      ->groupByRaw('YEAR(report_date), MONTH(report_date)')
      ->reorder()
      ->orderByRaw('YEAR(report_date) DESC, MONTH(report_date) DESC')
      ->get()
      ->map(fn ($row) => [
        'value' => sprintf('%04d-%02d', $row->year, $row->month),
        'label' => $expenseReportMonths[$row->month - 1] . ' ' . $row->year,
        'count' => (int) $row->cnt,
      ])
      ->toArray();

    $initialMonth    = $monthTabs[0]['value'] ?? null;
    $initialReports  = [];
    $expenseHasMore  = false;

    if ($initialMonth) {
      [$erYear, $erMonth] = explode('-', $initialMonth);
      $erPaginator = $project->expenseReports()
        ->whereYear('report_date', $erYear)
        ->whereMonth('report_date', $erMonth)
        ->paginate(3);
      $initialReports = ProjectExpenseReportResource::collection($erPaginator->items())->resolve();
      $expenseHasMore = $erPaginator->currentPage() < $erPaginator->lastPage();
    }

    // ─── Топ регионов поддержки (первые 6 записей) ───────────────────────────
    $topRegionsPerPage = 6;
    $topRegionsItems = DB::table('regions')
      ->select([
        'regions.id',
        'regions.name',
        'regions.code',
        'regions.flag_image',
        DB::raw('COALESCE(ds.total_amount, 0) as total_amount'),
        DB::raw('COALESCE(ds.donation_count, 0) as donation_count'),
      ])
      ->joinSub(
        DB::table('donations')
          ->select([
            'donations.region_id',
            DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
            DB::raw('COUNT(*) as donation_count'),
          ])
          ->where('donations.project_id', $project->id)
          ->where('donations.status', 'completed')
          ->whereNotNull('donations.region_id')
          ->groupBy('donations.region_id'),
        'ds',
        'regions.id',
        '=',
        'ds.region_id'
      )
      ->where('regions.is_active', true)
      ->orderByDesc('ds.total_amount')
      ->orderBy('regions.name')
      ->limit($topRegionsPerPage + 1)
      ->get();

    $topRegionsHasMore = $topRegionsItems->count() > $topRegionsPerPage;
    $topRegionsData = $topRegionsItems->take($topRegionsPerPage)->map(fn ($row) => [
      'id'               => $row->id,
      'name'             => $row->name,
      'code'             => $row->code,
      'flag_image_url'   => $row->flag_image ? asset('storage/' . $row->flag_image) : null,
      'donation_count'   => (int) $row->donation_count,
      'total_amount'     => (int) $row->total_amount,
      'formatted_amount' => Money::format((int) $row->total_amount),
    ])->values()->toArray();

    $data = $this->getSiteWidgetsAndPositions();

    $site = app()->bound('current_organization_site') ? app('current_organization_site') : null;
    $seo = $this->seoPresenter->forProject($project, $site, request()->fullUrl());

    return Inertia::render('main-site/ProjectShow', array_merge($data, [
      'project'             => $projectData,
      'sponsors'            => $sponsorsPayload,
      'totalDonationsCount' => $totalDonationsCount,
      'topRecurring'        => $topRecurring,
      'organizationId'      => $project->organization?->id,
      'seo'                 => $seo,
      'budgetItems'         => $budgetItems,
      'monthlyCollected'    => $monthlyCollectedKopecks,
      'referralLeaderboard' => $referralLeaderboard,
      'expenseReports'      => [
        'month_tabs'    => $monthTabs,
        'initial_month' => $initialMonth,
        'initial_data'  => $initialReports,
        'has_more'      => $expenseHasMore,
      ],
      'topRegions'          => [
        'data'     => $topRegionsData,
        'has_more' => $topRegionsHasMore,
        'meta'     => ['page' => 1, 'per_page' => $topRegionsPerPage],
      ],
    ]));
  }

  /**
   * Получить список категорий проектов с кешированием
   */
  private function getProjectCategories(): array
  {
    return Cache::remember('project_categories_list', 3600, function () {
      // Загружаем все активные категории из БД
      $categories = ProjectCategory::active()
        ->ordered()
        ->get()
        ->map(function ($category) {
          return [
            'value' => $category->slug,
            'label' => $category->name,
          ];
        })
        ->toArray();

      // Добавляем "Новые" в начало списка
      array_unshift($categories, [
        'value' => '',
        'label' => 'Новые',
      ]);

      return $categories;
    });
  }
}
