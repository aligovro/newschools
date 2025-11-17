<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Http\Resources\Sponsors\SponsorResource;
use App\Models\Project;
use App\Models\ProjectCategory;
use App\Services\Sponsors\ProjectSponsorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PublicProjectController extends Controller
{
    use HasSiteWidgets;

    public function __construct(
        private readonly ProjectSponsorService $projectSponsorService,
    ) {}

    /**
     * Отображение списка проектов
     */
    public function index(Request $request)
    {
        $query = Project::with(['organization', 'organization.region', 'organization.city', 'categories'])
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

        // Фильтр по городу организации
        if ($request->filled('city_id')) {
            $query->whereHas('organization.city', function ($q) use ($request) {
                $q->where('id', $request->city_id);
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

            // Форматируем данные организации
            if ($project->organization) {
                $org = $project->organization;
                $project->organization_name = $org->name;
                $project->organization_address = $org->address ?? '';
                if ($org->city) {
                    $project->organization_address = ($org->city->name ?? '') .
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

        $filters = $request->only(['search', 'category', 'city_id']);
        // Преобразуем city_id в число, если он есть
        if (isset($filters['city_id']) && $filters['city_id'] !== null) {
            $filters['city_id'] = (int) $filters['city_id'];
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
     */
    public function show($slug)
    {
        $project = Project::where('slug', $slug)
            ->where('status', 'active')
            ->with(['organization', 'organization.region', 'organization.city', 'stages' => function ($query) {
                $query->orderBy('order', 'asc');
            }])
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
                    'stage_number' => $stage->order,
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
                    'order' => $stage->order,
                    'project_url' => '/project/' . $project->slug,
                ];
            })->sortByDesc('order')->values()->toArray();
        }

        // Подготавливаем данные проекта для отображения
        $projectFunding = $project->funding;

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
            'category' => $project->category,
            'start_date' => $project->start_date,
            'end_date' => $project->end_date,
            'beneficiaries' => $project->beneficiaries ?? [],
            'progress_updates' => $project->progress_updates ?? [],
            'organization' => $project->organization ? [
                'id' => $project->organization->id,
                'name' => $project->organization->name,
                'slug' => $project->organization->slug,
                'address' => $project->organization->address,
                'city' => $project->organization->city ? [
                    'id' => $project->organization->city->id,
                    'name' => $project->organization->city->name,
                ] : null,
            ] : null,
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

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/ProjectShow', array_merge($data, [
            'project' => $projectData,
            'sponsors' => $sponsorsPayload,
            'organizationId' => $project->organization?->id,
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
