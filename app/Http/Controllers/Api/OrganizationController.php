<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrganizationController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of organizations.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('organizations.view');

        $query = Organization::with(['region', 'city', 'settlement', 'primaryDomain']);

        // Фильтрация по типу
        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        // Фильтрация по региону
        if ($request->filled('region_id')) {
            $query->byRegion($request->region_id);
        }

        // Фильтрация по городу
        if ($request->filled('city_id')) {
            $query->byCity($request->city_id);
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Фильтрация по публичности
        if ($request->filled('is_public')) {
            $query->where('is_public', $request->is_public);
        }

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $organizations = $query->paginate($request->get('per_page', 15));

        return response()->json($organizations);
    }

    /**
     * Store a newly created organization.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('organizations.create');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:organizations',
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'region_id' => 'nullable|exists:regions,id',
            'city_id' => 'nullable|exists:cities,id',
            'settlement_id' => 'nullable|exists:settlements,id',
            'city_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|string|max:500',
            'images' => 'nullable|array',
            'contacts' => 'nullable|array',
            'type' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,pending',
            'is_public' => 'nullable|boolean',
            'features' => 'nullable|array',
            'founded_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $organization = Organization::create($request->all());
        $organization->load(['region', 'city', 'settlement', 'primaryDomain']);

        return response()->json($organization, 201);
    }

    /**
     * Display the specified organization.
     */
    public function show(Organization $organization): JsonResponse
    {
        $this->authorize('organizations.view');

        $organization->load(['region', 'city', 'settlement', 'primaryDomain', 'settings', 'seo']);

        return response()->json($organization);
    }

    /**
     * Update the specified organization.
     */
    public function update(Request $request, Organization $organization): JsonResponse
    {
        $this->authorize('organizations.edit');

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
                Rule::unique('organizations')->ignore($organization->id)
            ],
            'description' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'region_id' => 'nullable|exists:regions,id',
            'city_id' => 'nullable|exists:cities,id',
            'settlement_id' => 'nullable|exists:settlements,id',
            'city_name' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|string|max:500',
            'images' => 'nullable|array',
            'contacts' => 'nullable|array',
            'type' => 'nullable|string|max:100',
            'status' => 'nullable|in:active,inactive,pending',
            'is_public' => 'nullable|boolean',
            'features' => 'nullable|array',
            'founded_at' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $organization->update($request->all());
        $organization->load(['region', 'city', 'settlement', 'primaryDomain']);

        return response()->json($organization);
    }

    /**
     * Remove the specified organization.
     */
    public function destroy(Organization $organization): JsonResponse
    {
        $this->authorize('organizations.delete');

        $organization->delete();

        return response()->json([
            'message' => 'Organization deleted successfully'
        ]);
    }

    /**
     * Get organization statistics.
     */
    public function statistics(Organization $organization): JsonResponse
    {
        $this->authorize('organizations.view');

        $stats = [
            'total_donations' => $organization->total_donations,
            'total_donations_rubles' => $organization->total_donations_rubles,
            'active_projects_count' => $organization->active_projects_count,
            'members_count' => $organization->members_count,
            'projects_count' => $organization->projects()->count(),
            'fundraisers_count' => $organization->fundraisers()->count(),
            'news_count' => $organization->news()->count(),
        ];

        return response()->json($stats);
    }
}
