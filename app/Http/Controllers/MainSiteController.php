<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\HasSiteWidgets;
use App\Models\Organization;
use App\Http\Resources\OrganizationStaffResource;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainSiteController extends Controller
{
    use HasSiteWidgets;

    public function index(Request $request)
    {
        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/Index', $data);
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

        $perPage = (int) $request->input('per_page', 6);
        $perPage = max(1, min($perPage, 24));

        $organizations = $query->orderBy('created_at', 'desc')->paginate($perPage);
        $organizations->appends($request->except('page'));

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
            // Директор теперь берется из organization_staff через связь director
            if ($org->director) {
                // Преобразуем директора в нужный формат через Resource
                $org->director = (new OrganizationStaffResource($org->director))->toArray(request());
            } else {
                // Оставляем director_name для обратной совместимости, если директор не найден в staff
                $adminUser = $org->users->first();
                if ($adminUser) {
                    $org->director_name = $adminUser->name ?? null;
                }
            }
            return $org;
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
        ];

        $data = $this->getSiteWidgetsAndPositions();

        return Inertia::render('main-site/OrganizationShow', array_merge($data, [
            'organization' => $organizationData,
            'organizationId' => $organization->id, // Передаем organizationId для виджетов
        ]));
    }
}
