<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Site;
use App\Models\City;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationStaffResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PublicOrganizationController extends Controller
{
    /**
     * Отображение списка организаций
     */
    public function index(Request $request)
    {
        $query = Organization::with([
            'region',
            'city',
            'sites',
            'director' => function ($query) {
                $query->whereNull('deleted_at');
            }
        ])
            ->where('status', 'active')
            ->where('is_public', true);

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Фильтрация по типу
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Фильтрация по региону
        if ($request->filled('region')) {
            $query->where('region_id', $request->region);
        }

        // Фильтрация по городу
        if ($request->filled('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        // Фильтрация по координатам (для карты)
        if ($request->filled('bbox')) {
            // bbox format: south,west,north,east
            [$south, $west, $north, $east] = array_map('floatval', explode(',', $request->bbox));
            $query->whereBetween('latitude', [$south, $north])
                ->whereBetween('longitude', [$west, $east]);
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Пагинация
        $perPage = $request->get('per_page', 12);
        $organizations = $query->paginate($perPage);

        return Inertia::render('Organizations', [
            'organizations' => InertiaResource::paginate($organizations, OrganizationResource::class),
            'filters' => $request->only(['search', 'type', 'region', 'city_id', 'bbox', 'sort_by', 'sort_direction']),
        ]);
    }

    /**
     * Публичный API: список организаций (JSON)
     */
    public function apiIndex(Request $request): JsonResponse
    {
        $query = Organization::query()
            ->with([
                'region:id,name',
                'city:id,name',
                'director' => function ($query) {
                    $query->whereNull('deleted_at');
                }
            ])
            ->where('status', 'active')
            ->where('is_public', true)
            ->withCount([
                'members as members_count',
                'projects as projects_count',
            ])
            ->withSum('donations as donations_total', 'amount');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        if ($request->filled('region_id')) {
            $query->where('region_id', (int) $request->get('region_id'));
        }

        if ($request->filled('city_id')) {
            $query->where('city_id', (int) $request->get('city_id'));
        }

        if ($request->filled('organization_id')) {
            $query->where('id', (int) $request->get('organization_id'));
        }

        if ($request->filled('ids')) {
            $ids = collect(explode(',', (string) $request->get('ids')))
                ->map(fn($value) => (int) trim($value))
                ->filter(fn($value) => $value > 0)
                ->values();

            if ($ids->isNotEmpty()) {
                $query->whereIn('id', $ids->all());
            }
        }

        // Сортировка
        $allowedSort = ['created_at', 'name', 'donations_total'];
        $sortBy = in_array($request->get('order_by'), $allowedSort, true)
            ? $request->get('order_by')
            : 'created_at';
        $sortDirection = strtolower((string) $request->get('order_direction')) === 'asc' ? 'asc' : 'desc';

        // Для сортировки по сумме пожертвований нужна агрегатная колонка
        if ($sortBy === 'donations_total') {
            // withSum уже добавил donations_total, можно сортировать по ней
            $query->orderBy('donations_total', $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $limit = min(max((int) $request->get('limit', 12), 1), 100);
        $items = $query->limit($limit)->get([
            'id',
            'name',
            'slug',
            'description',
            'type',
            'status',
            'is_public',
            'logo',
            'images',
            'address',
            'region_id',
            'city_id',
            'created_at',
            'needs_target_amount',
            'needs_collected_amount',
        ]);

        // Приводим к плоскому JSON для фронта
        $result = $items->map(function ($org) {
            // Приоритет: logo, затем первая из галереи
            $rawImage = $org->logo;
            if (!$rawImage && !empty($org->images) && is_array($org->images) && count($org->images) > 0) {
                $rawImage = $org->images[0];
            }
            $imageUrl = $rawImage ? (str_starts_with($rawImage, 'http') ? $rawImage : Storage::url($rawImage)) : null;
            $logoUrl = $org->logo ? (str_starts_with($org->logo, 'http') ? $org->logo : Storage::url($org->logo)) : null;
            return [
                'id' => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'description' => $org->description,
                'address' => $org->address,
                'logo' => $logoUrl,
                'image' => $imageUrl,
                'type' => $org->type,
                'status' => $org->status,
                'is_public' => (bool) $org->is_public,
                'city' => $org->city ? ['name' => $org->city->name] : null,
                'region' => $org->region ? ['name' => $org->region->name] : null,
                'members_count' => (int) ($org->members_count ?? 0),
                'projects_count' => (int) ($org->projects_count ?? 0),
                'donations_total' => (int) ($org->donations_total ?? 0),
                'donations_collected' => (int) ($org->donations_total ?? 0),
                'needs' => $org->needs,
                'director' => $org->director ? (new OrganizationStaffResource($org->director))->toArray(request()) : null,
            ];
        });

        return response()->json(['data' => $result]);
    }

    /**
     * Отображение конкретной организации
     */
    public function show(Organization $organization)
    {
        // Проверяем, что организация публичная
        if (!$organization->is_public || $organization->status !== 'active') {
            abort(404, 'Организация не найдена');
        }

        $organization->load([
            'region',
            'city',
            'settlement',
            'director' => function ($query) {
                $query->whereNull('deleted_at');
            },
            'sites' => function ($query) {
                $query->published();
            },
            'projects' => function ($query) {
                $query->where('status', 'active')->limit(6);
            },
            'news' => function ($query) {
                $query->published()->limit(6);
            },
            'members' => function ($query) {
                $query->where('is_public', true)->limit(8);
            },
        ]);

        // Получаем статистику
        $stats = [
            'members_count' => $organization->members()->where('is_public', true)->count(),
            'projects_count' => $organization->projects()->where('status', 'active')->count(),
            'donations_total' => $organization->donations()->where('status', 'completed')->sum('amount'),
            'news_count' => $organization->news()->published()->count(),
        ];

        return Inertia::render('OrganizationShow', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'stats' => $stats,
        ]);
    }

    /**
     * API для получения данных организации
     */
    public function api(Organization $organization)
    {
        if (!$organization->is_public || $organization->status !== 'active') {
            return response()->json(['error' => 'Organization not found'], 404);
        }

        $organization->load([
            'region',
            'city',
            'director' => function ($query) {
                $query->whereNull('deleted_at');
            },
            'sites' => function ($query) {
                $query->published();
            },
            'projects' => function ($query) {
                $query->where('status', 'active');
            },
            'news' => function ($query) {
                $query->published();
            },
        ]);

        return response()->json([
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'stats' => [
                'members_count' => $organization->members()->where('is_public', true)->count(),
                'projects_count' => $organization->projects()->where('status', 'active')->count(),
                'donations_total' => $organization->donations()->where('status', 'completed')->sum('amount'),
            ],
        ]);
    }

    /**
     * Получение списка типов организаций
     */
    public function types()
    {
        $types = config('organizations.types', []);

        return response()->json([
            'types' => array_map(function ($config, $key) {
                return [
                    'key' => $key,
                    'name' => $config['name'] ?? $key,
                    'plural' => $config['plural'] ?? $config['name'] ?? $key,
                ];
            }, $types, array_keys($types))
        ]);
    }

    /**
     * Получение списка регионов
     */
    public function regions()
    {
        $regions = \App\Models\Region::with('cities')
            ->orderBy('name')
            ->get()
            ->map(function ($region) {
                return [
                    'id' => $region->id,
                    'name' => $region->name,
                    'cities' => $region->cities->map(function ($city) {
                        return [
                            'id' => $city->id,
                            'name' => $city->name,
                        ];
                    }),
                ];
            });

        return response()->json(['regions' => $regions]);
    }

    /**
     * Получить список городов с поиском
     */
    public function cities(Request $request): JsonResponse
    {
        $query = City::with('region')->where('is_active', true);

        $ids = [];
        if ($request->filled('ids')) {
            $ids = collect(explode(',', $request->get('ids')))
                ->map(fn($value) => (int) trim($value))
                ->filter(fn($value) => $value > 0)
                ->unique()
                ->values()
                ->all();
            if (!empty($ids)) {
                $query->whereIn('id', $ids);
            }
        }

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $limit = $request->filled('limit') ? (int) $request->get('limit') : null;
        if ($limit !== null) {
            $limit = max(1, min($limit, 100));
        }

        if ($limit !== null) {
            $query->limit($limit);
        } elseif (empty($ids)) {
            $query->limit(20);
        }

        $cities = $query->orderBy('name')->get();

        return response()->json(
            $cities->map(function ($city) {
                return [
                    'id' => $city->id,
                    'name' => $city->name,
                    'region' => $city->region
                        ? ['name' => $city->region->name]
                        : null,
                    'latitude' => $city->latitude !== null ? (float) $city->latitude : null,
                    'longitude' => $city->longitude !== null ? (float) $city->longitude : null,
                ];
            })
        );
    }

    /**
     * Определить город по координатам (обратный геокодинг через Яндекс API)
     */
    public function detectCity(Request $request): JsonResponse
    {
        $latitude = $request->get('latitude');
        $longitude = $request->get('longitude');

        if (!$latitude || !$longitude) {
            return response()->json(['error' => 'Координаты не указаны'], 422);
        }

        try {
            // Пробуем найти ближайший город в радиусе 50км
            $city = City::selectRaw(
                '*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
                [$latitude, $longitude, $latitude]
            )
                ->where('is_active', true)
                ->whereNotNull('latitude')
                ->whereNotNull('longitude')
                ->havingRaw('distance < 50')
                ->orderBy('distance')
                ->first();

            if ($city) {
                return response()->json([
                    'id' => $city->id,
                    'name' => $city->name,
                    'region' => $city->region
                        ? ['name' => $city->region->name]
                        : null,
                    'latitude' => $city->latitude !== null ? (float) $city->latitude : null,
                    'longitude' => $city->longitude !== null ? (float) $city->longitude : null,
                ]);
            }

            // Если не нашли по координатам, возвращаем null
            return response()->json(null);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка определения города'], 500);
        }
    }
}
