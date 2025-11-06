<?php

namespace App\Services;

use App\Models\Region;
use App\Models\City;
use App\Models\Settlement;
use App\Models\Organization;
use Illuminate\Support\Facades\Cache;

class ReferenceDataService
{
    private const CACHE_TTL = 3600; // 1 час
    private const INITIAL_REGIONS_LIMIT = 20;

    /**
     * Получить типы организаций
     */
    public function getOrganizationTypes(): array
    {
        return Cache::remember('organization_types_reference', self::CACHE_TTL, function () {
            return [
                ['value' => 'school', 'label' => 'Школа', 'description' => 'Общеобразовательное учреждение'],
                ['value' => 'university', 'label' => 'Университет', 'description' => 'Высшее учебное заведение'],
                ['value' => 'kindergarten', 'label' => 'Детский сад', 'description' => 'Дошкольное образовательное учреждение'],
                ['value' => 'other', 'label' => 'Другое', 'description' => 'Иной тип организации'],
            ];
        });
    }

    /**
     * Получить начальный список регионов (с координатами)
     */
    public function getInitialRegions(): array
    {
        return Cache::remember('regions_initial', self::CACHE_TTL, function () {
            return Region::select('id', 'name', 'code', 'latitude', 'longitude')
                ->orderBy('name')
                ->limit(self::INITIAL_REGIONS_LIMIT)
                ->get()
                ->toArray();
        });
    }

    /**
     * Получить города по региону
     */
    public function getCitiesByRegion(int $regionId): array
    {
        return Cache::remember("cities_region_{$regionId}", self::CACHE_TTL, function () use ($regionId) {
            return City::where('region_id', $regionId)
                ->select('id', 'name', 'region_id', 'latitude', 'longitude')
                ->orderBy('name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Получить населенные пункты по городу
     */
    public function getSettlementsByCity(int $cityId): array
    {
        return Cache::remember("settlements_city_{$cityId}", self::CACHE_TTL, function () use ($cityId) {
            return Settlement::where('city_id', $cityId)
                ->select('id', 'name', 'city_id')
                ->orderBy('name')
                ->get()
                ->toArray();
        });
    }

    /**
     * Получить все справочные данные для редактирования организации
     */
    public function getReferenceDataForEdit(?Organization $organization = null): array
    {
        return [
            'organizationTypes' => $this->getOrganizationTypes(),
            'regions' => $this->getInitialRegions(),
            'cities' => $organization && $organization->region_id
                ? $this->getCitiesByRegion($organization->region_id)
                : [],
            'settlements' => $organization && $organization->city_id
                ? $this->getSettlementsByCity($organization->city_id)
                : [],
        ];
    }

    /**
     * Очистить кеш справочных данных
     */
    public function clearCache(?int $regionId = null, ?int $cityId = null): void
    {
        Cache::forget('organization_types_reference');
        Cache::forget('regions_initial');

        if ($regionId) {
            Cache::forget("cities_region_{$regionId}");
        }

        if ($cityId) {
            Cache::forget("settlements_city_{$cityId}");
        }
    }
}

