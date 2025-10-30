<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Site;
use App\Models\City;
use App\Http\Resources\OrganizationResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

class PublicOrganizationController extends Controller
{
    /**
     * Отображение списка организаций
     */
    public function index(Request $request)
    {
        $query = Organization::with(['region', 'city', 'sites'])
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

        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $limit = min($request->get('limit', 20), 100);
        $cities = $query->orderBy('name')->limit($limit)->get();

        return response()->json(
            $cities->map(function ($city) {
                return [
                    'id' => $city->id,
                    'name' => $city->name,
                    'region' => $city->region
                        ? ['name' => $city->region->name]
                        : null,
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
                ]);
            }

            // Если не нашли по координатам, возвращаем null
            return response()->json(null);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Ошибка определения города'], 500);
        }
    }
}
