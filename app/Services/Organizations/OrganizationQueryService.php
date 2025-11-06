<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class OrganizationQueryService
{
    private const ALLOWED_SORT_FIELDS = ['name', 'created_at', 'updated_at', 'status', 'type'];
    private const DEFAULT_SORT_FIELD = 'created_at';
    private const DEFAULT_SORT_DIRECTION = 'desc';
    private const MAX_PER_PAGE = 100;
    private const DEFAULT_PER_PAGE = 15;

    /**
     * Создать базовый запрос с необходимыми отношениями и подсчетами
     */
    public function baseQuery(): Builder
    {
        return Organization::query()
            ->with([
                'region:id,name',
                'city:id,name',
                'settlement:id,name',
            ])
            ->withCount([
                'members as members_count',
                'donations as donations_count',
            ])
            ->withSum('donations', 'amount')
            ->select([
                'id',
                'name',
                'slug',
                'description',
                'type',
                'status',
                'is_public',
                'logo',
                'created_at',
                'updated_at',
                'region_id',
                'city_id',
                'settlement_id'
            ]);
    }

    /**
     * Применить фильтры к запросу
     */
    public function applyFilters(Builder $query, Request $request): Builder
    {
        // Поиск
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Фильтрация по типу
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Фильтрация по региону
        if ($request->filled('region_id')) {
            $query->byRegion($request->region_id);
        }

        return $query;
    }

    /**
     * Применить сортировку к запросу
     */
    public function applySorting(Builder $query, Request $request): Builder
    {
        $sortBy = $request->get('sort_by', self::DEFAULT_SORT_FIELD);
        $sortDirection = $request->get('sort_direction', self::DEFAULT_SORT_DIRECTION);

        if (in_array($sortBy, self::ALLOWED_SORT_FIELDS)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy(self::DEFAULT_SORT_FIELD, self::DEFAULT_SORT_DIRECTION);
        }

        return $query;
    }

    /**
     * Получить пагинацию с ограничением
     */
    public function paginate(Builder $query, Request $request)
    {
        $perPage = min($request->get('per_page', self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
        return $query->paginate($perPage);
    }

    /**
     * Получить фильтры из запроса
     */
    public function getFilters(Request $request): array
    {
        return $request->only(['search', 'type', 'status', 'region_id', 'sort_by', 'sort_direction', 'per_page']);
    }

    /**
     * Получить полный запрос с фильтрами и сортировкой
     */
    public function getFilteredQuery(Request $request): Builder
    {
        $query = $this->baseQuery();
        $query = $this->applyFilters($query, $request);
        return $this->applySorting($query, $request);
    }
}
