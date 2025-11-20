<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\SuggestedOrganization\DeleteSuggestedOrganizationRequest;
use App\Http\Requests\SuggestedOrganization\SuggestedOrganizationListRequest;
use App\Http\Requests\SuggestedOrganization\UpdateSuggestedOrganizationRequest;
use App\Http\Resources\SuggestedOrganizationResource;
use App\Models\SuggestedOrganization;
use App\Services\SuggestedOrganizations\SuggestedOrganizationQueryService;
use App\Services\SuggestedOrganizations\SuggestedOrganizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuggestedOrganizationController extends Controller
{
    public function index(
        SuggestedOrganizationListRequest $request,
        SuggestedOrganizationQueryService $queryService
    ): JsonResponse {
        $filters = $request->validated();

        $query = $queryService->applyFilters(
            $queryService->baseQuery(),
            $filters
        );

        $queryService->applySorting($query, (string) $filters['sort_by'], (string) $filters['sort_direction']);

        $paginator = $queryService->paginate(
            $query,
            (int) $filters['per_page'],
            (int) $filters['page']
        );
        $paginator->appends($filters);

        return SuggestedOrganizationResource::collection($paginator)
            ->additional([
                'filters' => $filters,
                'support' => [
                    'statuses' => SuggestedOrganization::STATUSES,
                    'sortable_fields' => SuggestedOrganization::SORTABLE_FIELDS,
                ],
            ])
            ->response();
    }

    public function update(
        UpdateSuggestedOrganizationRequest $request,
        SuggestedOrganization $suggestedOrganization,
        SuggestedOrganizationService $service
    ): SuggestedOrganizationResource {
        $updated = $service->update($suggestedOrganization, $request->validated());

        return SuggestedOrganizationResource::make($updated);
    }

    public function destroy(
        DeleteSuggestedOrganizationRequest $request,
        SuggestedOrganization $suggestedOrganization,
        SuggestedOrganizationService $service
    ): JsonResponse {
        $service->delete($suggestedOrganization);

        return response()->noContent();
    }

    /**
     * Получить количество непросмотренных предложенных организаций
     */
    public function unviewedCount(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => true,
                'data' => ['count' => 0],
            ]);
        }

        $count = $user->getUnviewedSuggestedOrganizationsCount();

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Отметить предложенную организацию как просмотренную
     */
    public function markAsViewed(
        Request $request,
        SuggestedOrganization $suggestedOrganization
    ): JsonResponse {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не авторизован',
            ], 401);
        }

        $user->markSuggestedOrganizationAsViewed($suggestedOrganization);

        return response()->json([
            'success' => true,
            'message' => 'Предложение отмечено как просмотренное',
        ]);
    }
}


