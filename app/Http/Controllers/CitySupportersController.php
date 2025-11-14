<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Http\Controllers\Controller;
use App\Services\CitySupportersService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CitySupportersController extends Controller
{
    public function __construct(
        private readonly CitySupportersService $citySupportersService
    ) {}

    /**
     * Получить топ поддерживающих городов для организации
     */
    public function getTopCities(Request $request, Organization $organization): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 6);
        $search = trim((string) $request->get('search', ''));
        $sortBy = $request->get('sort_by', 'amount'); // amount | supporters | schools | name
        $sortOrder = $request->get('sort_order', 'desc');

        $data = $this->citySupportersService->getTopCitiesForOrganization(
            $organization,
            $perPage,
            $search,
            $sortBy,
            $sortOrder
        );

        return response()->json([
            'success' => true,
            'data' => $data['data'],
            'pagination' => $data['pagination'],
        ]);
    }


    /**
     * Публичный топ поддерживающих городов без привязки к организации (для главного сайта)
     */
    public function getTopCitiesPublic(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 6);
        $search = trim((string) $request->get('search', ''));
        $sortBy = $request->get('sort_by', 'amount'); // amount | supporters | schools | name
        $sortOrder = $request->get('sort_order', 'desc');

        $data = $this->citySupportersService->getTopCitiesPublic(
            $perPage,
            $search,
            $sortBy,
            $sortOrder
        );

        return response()->json([
            'success' => true,
            'data' => $data['data'],
            'pagination' => $data['pagination'],
        ]);
    }


    /**
     * Очистить кеш для организации
     */
    public static function clearCacheForOrganization(int $organizationId): void
    {
        CitySupportersService::clearCacheForOrganization($organizationId);
    }

    /**
     * Очистить публичный кеш
     */
    public static function clearPublicCache(): void
    {
        CitySupportersService::clearPublicCache();
    }
}
