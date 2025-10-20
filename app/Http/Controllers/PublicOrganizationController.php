<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationSite;
use App\Http\Resources\OrganizationResource;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
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

    // Сортировка
    $sortBy = $request->get('sort_by', 'created_at');
    $sortDirection = $request->get('sort_direction', 'desc');
    $query->orderBy($sortBy, $sortDirection);

    // Пагинация
    $perPage = $request->get('per_page', 12);
    $organizations = $query->paginate($perPage);

    return Inertia::render('Organizations', [
      'organizations' => InertiaResource::paginate($organizations, OrganizationResource::class),
      'filters' => $request->only(['search', 'type', 'region', 'sort_by', 'sort_direction']),
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
}
