<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Services\GlobalSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicApiController extends Controller
{
    /**
     * Получить конфигурацию карт с дефолтным городом и регионом
     */
    public function getMapsConfig(GlobalSettingsService $settingsService): JsonResponse
    {
        $settings = $settingsService->getSettings();
        $integrations = $settings->integration_settings ?? [];
        $system = $settings->system_settings ?? [];

        $defaultCityId = $system['default_city_id'] ?? null;
        $defaultCityFallback = $system['default_city_fallback'] ?? 'Москва';
        $defaultCityRegion = null;

        // Получаем регион дефолтного города из БД
        if ($defaultCityId) {
            $city = City::with('region')->find($defaultCityId);
            if ($city && $city->region) {
                $defaultCityRegion = [
                    'id' => $city->region->id,
                    'name' => $city->region->name,
                ];
            }
        }

        return response()->json([
            'yandexMapApiKey' => $integrations['yandex_map_apikey'] ?? null,
            'yandexSuggestApiKey' => $integrations['yandex_suggest_apikey'] ?? null,
            'defaultCityId' => $defaultCityId,
            'defaultCityFallback' => $defaultCityFallback,
            'defaultCityRegion' => $defaultCityRegion,
        ]);
    }

    /**
     * Резолвинг города по названию (после геокодинга)
     */
    public function resolveCity(Request $request): JsonResponse
    {
        $name = trim((string) $request->get('name', ''));

        if ($name === '') {
            return response()->json(['error' => 'Empty name'], 422);
        }

        $city = City::where('name', 'like', $name)
            ->orWhere('name', 'like', "%$name%")
            ->orderByRaw("CASE WHEN name = ? THEN 0 ELSE 1 END", [$name])
            ->first();

        return response()->json([
            'city' => $city ? [
                'id' => $city->id,
                'name' => $city->name,
                'region_id' => $city->region_id,
                'latitude' => $city->latitude,
                'longitude' => $city->longitude,
            ] : null,
        ]);
    }
}
