<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Enums\DonationStatus;
use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use App\Http\Resources\Alumni\AlumniResource;
use App\Http\Resources\NewsResource;
use App\Http\Resources\OrganizationStaffResource;
use App\Http\Resources\Sponsors\SponsorResource;
use App\Models\News;
use App\Models\Organization;
use App\Models\Site;
use App\Services\Organizations\OrganizationAlumniService;
use App\Services\Sponsors\OrganizationSponsorService;
use App\Services\Seo\SeoPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainSiteController extends Controller
{
    use HasSiteWidgets;

    public function __construct(
        private readonly OrganizationSponsorService $organizationSponsorService,
        private readonly OrganizationAlumniService $organizationAlumniService,
        private readonly SeoPresenter $seoPresenter,
    ) {}

    public function index(Request $request)
    {
        $data = $this->getSiteWidgetsAndPositions();

        /** @var Site|null $siteModel */
        $siteModel = Site::where('site_type', 'main')->published()->first();

        $seo = null;
        if ($siteModel) {
            $seo = $this->seoPresenter->forMainSite(
                $siteModel,
                [],
                $request->fullUrl()
            );
        }

        return Inertia::render('main-site/Index', array_merge($data, [
            'seo' => $seo,
        ]));
    }

    public function organizations(Request $request)
    {
        $query = Organization::with([
            'region',
            'city',
            'director' => function ($query) {
                $query->whereNull('deleted_at');
            },
            'users' => function ($query) {
                $query->wherePivot('role', 'organization_admin');
            }
        ])
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
                'donations as donation_sponsors_count' => function ($q) {
                    $q->where('status', 'completed')
                        ->whereNotNull('paid_at')
                        ->whereNotNull('donor_id')
                        ->selectRaw('COUNT(DISTINCT donor_id)');
                },
                'sponsorMemberships as sponsor_members_count',
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

        $perPage = (int) $request->input('per_page', 6);
        $perPage = max(1, min($perPage, 24));

        $organizations = $query->orderBy('created_at', 'desc')->paginate($perPage);
        $organizations->appends($request->except('page'));

        // Форматируем данные организаций для отображения
        // Используем OrganizationResource, чтобы не дублировать логику нормализации путей/связей
        $organizations->getCollection()->transform(function ($org) {
            /** @var \App\Models\Organization $org */
            $resourceData = (new \App\Http\Resources\OrganizationResource($org))->toArray(request());

            // Приоритет: logo, затем первая картинка из images — аналогично тому, как мы делали вручную
            $image = $resourceData['logo'] ?? null;
            if (!$image && !empty($resourceData['images']) && is_array($resourceData['images'])) {
                $firstImage = $resourceData['images'][0] ?? null;
                if (is_string($firstImage) && $firstImage !== '') {
                    $image = $firstImage;
                }
            }
            $resourceData['image'] = $image;

            // Форматируем суммы из копеек в рубли (donations_* приходят как агрегаты с withCount/withSum)
            $resourceData['donations_total'] = $org->donations_total
                ? $org->donations_total / 100
                : 0;
            $resourceData['donations_collected'] = $org->donations_collected
                ? $org->donations_collected / 100
                : 0;

            // Количества проектов/участников/спонсоров
            $resourceData['projects_count'] = (int) ($org->projects_count ?? 0);
            $resourceData['members_count'] = (int) ($org->members_count ?? 0);

            $sponsorMembersCount = (int) ($org->sponsor_members_count ?? 0);
            $donationSponsorsCount = (int) ($org->donation_sponsors_count ?? 0);
            $resourceData['sponsors_count'] = max($sponsorMembersCount, $donationSponsorsCount);

            // Директор: берем из OrganizationResource (через OrganizationStaffResource)
            $director = $resourceData['director'] ?? null;
            if (is_array($director) && !empty($director)) {
                // Для карточки используем full_name + нормализованный photo из Resource
                $resourceData['director_name'] = $director['full_name'] ?? null;
            } else {
                // Если отдельного директора нет — берем администратора организации
                $adminUser = $org->users->first();
                $resourceData['director_name'] = $adminUser->name ?? null;
            }

            // Координаты — просто пробрасываем как есть
            $resourceData['latitude'] = $org->latitude;
            $resourceData['longitude'] = $org->longitude;

            return $resourceData;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $organizations->items(),
                'meta' => [
                    'current_page' => $organizations->currentPage(),
                    'last_page' => $organizations->lastPage(),
                    'per_page' => $organizations->perPage(),
                    'total' => $organizations->total(),
                ],
            ]);
        }

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/Organizations', array_merge($data, [
            'organizations' => $organizations,
            'filters' => $request->only(['search', 'region_id', 'city_id']),
        ]));
    }

    public function news(Request $request)
    {
        $query = News::query()
            ->with(['organization:id,name,slug'])
            ->whereNull('organization_id')
            ->where('status', NewsStatus::Published)
            ->where('visibility', NewsVisibility::Public)
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        $perPage = (int) $request->input('per_page', 6);
        $perPage = max(3, min($perPage, 12));

        $news = $query
            ->orderByDesc('published_at')
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $news->appends($request->except('page'));

        $transformed = $news->through(
            fn($item) => (new NewsResource($item))->toArray($request),
        );

        if ($request->wantsJson()) {
            return response()->json([
                'data' => $transformed->items(),
                'meta' => [
                    'current_page' => $transformed->currentPage(),
                    'last_page' => $transformed->lastPage(),
                    'per_page' => $transformed->perPage(),
                    'total' => $transformed->total(),
                ],
            ]);
        }

        $data = $this->getSiteWidgetsAndPositions();

        /** @var Site|null $siteModel */
        $siteModel = Site::where('site_type', 'main')->published()->first();
        $seo = null;
        if ($siteModel) {
            $seo = $this->seoPresenter->forSite(
                $siteModel,
                [
                    'pageTitle' => 'Новости',
                    'pageDescription' => 'Новости и события главного сайта',
                    'seo_overrides' => [],
                ],
                $request->fullUrl()
            );
        }

        return Inertia::render('main-site/News', array_merge($data, [
            'news' => $transformed,
            'filters' => $request->only(['search', 'type']),
            'seo' => $seo,
        ]));
    }

    public function showNews(Request $request, string $slug)
    {
        $news = News::query()
            ->with(['organization:id,name,slug'])
            ->where('slug', $slug)
            ->whereNull('organization_id')
            ->where('status', NewsStatus::Published)
            ->where('visibility', NewsVisibility::Public)
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->firstOrFail();

        $newsData = (new NewsResource($news))->toArray($request);

        $data = $this->getSiteWidgetsAndPositions();

        /** @var Site|null $siteModel */
        $siteModel = Site::where('site_type', 'main')->published()->first();
        $seo = null;
        if ($siteModel) {
            $seo = $this->seoPresenter->forNews(
                $siteModel,
                $news,
                $request->fullUrl()
            );
        }

        return Inertia::render('main-site/NewsShow', array_merge($data, [
            'news' => $newsData,
            'seo' => $seo,
        ]));
    }

    public function organization($slug)
    {
        $organization = Organization::where('slug', $slug)
            ->where('status', 'active')
            ->where('is_public', true)
            ->with([
                'region',
                'city',
                'projects' => function ($q) {
                    $q->where('status', 'active')->limit(6);
                },
                'director',
            ])
            ->withCount([
                'donations as donation_sponsors_count' => function ($q) {
                    $q->where('status', DonationStatus::Completed)
                        ->whereNotNull('paid_at')
                        ->whereNotNull('donor_id')
                        ->selectRaw('COUNT(DISTINCT donor_id)');
                },
                'sponsorMemberships as sponsor_members_count',
            ])
            ->firstOrFail();

        // Подготавливаем галерею изображений
        $gallery = [];
        if (!empty($organization->images) && is_array($organization->images)) {
            $gallery = array_map(function ($image) {
                return '/storage/' . ltrim($image, '/');
            }, $organization->images);
        }

        // Статистика
        $completedDonationsQuery = $organization->donations()
            ->where('status', DonationStatus::Completed)
            ->whereNotNull('paid_at');

        $sponsorMembersCount = $organization->sponsor_members_count ?? $organization->sponsorMemberships()->count();
        $donationSponsorsCount = $organization->donation_sponsors_count ?? (clone $completedDonationsQuery)
            ->whereNotNull('donor_id')
            ->distinct('donor_id')
            ->count('donor_id');

        $sponsorsCount = max((int) $sponsorMembersCount, (int) $donationSponsorsCount);

        unset($organization->sponsor_members_count, $organization->donation_sponsors_count);

        $autoPaymentsCount = (clone $completedDonationsQuery)
            ->where(function ($query) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = true")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->count();

        $alumniCount = $organization->members()
            ->where('is_public', true)
            ->count();

        $projectsCount = $organization->projects()
            ->where('status', 'active')
            ->count();

        $directorData = null;
        if ($organization->relationLoaded('director') && $organization->director) {
            $directorData = (new OrganizationStaffResource($organization->director))->toArray(request());
        } else {
            $fallbackDirector = $organization->adminUser();
            if ($fallbackDirector) {
                $directorData = [
                    'full_name' => $fallbackDirector->name,
                    'photo' => null,
                ];
            }
        }

        // Подготавливаем данные организации для отображения
        $needsSummary = $organization->needs;

        $organizationData = [
            'id' => $organization->id,
            'name' => $organization->name,
            'slug' => $organization->slug,
            'description' => $organization->description,
            'logo' => $organization->logo ? '/storage/' . $organization->logo : null,
            'gallery' => $gallery,
            'needs' => $needsSummary,
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
            'stats' => [
                'alumni' => $alumniCount,
                'sponsors' => $sponsorsCount,
                'autopayments' => $autoPaymentsCount,
                'projects' => $projectsCount,
            ],
            'director' => $directorData,
        ];

        $sponsorsPaginator = $this->organizationSponsorService->paginate(
            $organization,
            'top',
            OrganizationSponsorService::DEFAULT_PER_PAGE,
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

        $alumniPaginator = $this->organizationAlumniService->paginate(
            $organization,
            OrganizationAlumniService::DEFAULT_PER_PAGE,
            1,
        );

        $alumniPayload = [
            'data' => AlumniResource::collection(collect($alumniPaginator->items()))->resolve(),
            'pagination' => [
                'current_page' => $alumniPaginator->currentPage(),
                'last_page' => $alumniPaginator->lastPage(),
                'per_page' => $alumniPaginator->perPage(),
                'total' => $alumniPaginator->total(),
            ],
        ];

        $data = $this->getSiteWidgetsAndPositions();

        /** @var Site|null $siteModel */
        $siteModel = Site::where('site_type', 'main')->published()->first();
        $seo = null;
        if ($siteModel) {
            $seo = $this->seoPresenter->forOrganization(
                $siteModel,
                $organization,
                request()->fullUrl()
            );
        }

        return Inertia::render('main-site/OrganizationShow', array_merge($data, [
            'organization' => $organizationData,
            'organizationId' => $organization->id, // Передаем organizationId для виджетов
            'sponsors' => $sponsorsPayload,
            'alumni' => $alumniPayload,
            'seo' => $seo,
        ]));
    }
}
