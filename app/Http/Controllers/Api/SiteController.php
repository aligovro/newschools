<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationDomain;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class SiteController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of sites (organizations with domains).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('organizations.view');

        $query = Organization::with(['region', 'city', 'settlement', 'primaryDomain', 'domains'])
            ->whereHas('domains'); // Only organizations with domains (sites)

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

        // Фильтрация по домену
        if ($request->filled('domain')) {
            $query->whereHas('domains', function ($q) use ($request) {
                $q->where('domain', 'like', "%{$request->domain}%")
                    ->orWhere('custom_domain', 'like', "%{$request->domain}%");
            });
        }

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('domains', function ($domainQuery) use ($search) {
                        $domainQuery->where('domain', 'like', "%{$search}%")
                            ->orWhere('custom_domain', 'like', "%{$search}%");
                    });
            });
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $sites = $query->paginate($request->get('per_page', 15));

        return response()->json($sites);
    }

    /**
     * Display the specified site.
     */
    public function show(Organization $site): JsonResponse
    {
        $this->authorize('organizations.view');

        // Ensure this organization has domains (is a site)
        if (!$site->domains()->exists()) {
            return response()->json([
                'message' => 'Organization is not a site (no domains found)'
            ], 404);
        }

        $site->load(['region', 'city', 'settlement', 'primaryDomain', 'domains', 'settings', 'seo']);

        return response()->json($site);
    }

    /**
     * Get site statistics.
     */
    public function statistics(Organization $site): JsonResponse
    {
        $this->authorize('organizations.view');

        // Ensure this organization has domains (is a site)
        if (!$site->domains()->exists()) {
            return response()->json([
                'message' => 'Organization is not a site (no domains found)'
            ], 404);
        }

        $stats = [
            'total_donations' => $site->total_donations,
            'total_donations_rubles' => $site->total_donations_rubles,
            'active_projects_count' => $site->active_projects_count,
            'members_count' => $site->members_count,
            'projects_count' => $site->projects()->count(),
            'fundraisers_count' => $site->fundraisers()->count(),
            'news_count' => $site->news()->count(),
            'domains_count' => $site->domains()->count(),
            'primary_domain' => $site->primaryDomain?->domain,
            'custom_domain' => $site->primaryDomain?->custom_domain,
        ];

        return response()->json($stats);
    }

    /**
     * Get site domains.
     */
    public function domains(Organization $site): JsonResponse
    {
        $this->authorize('organizations.view');

        // Ensure this organization has domains (is a site)
        if (!$site->domains()->exists()) {
            return response()->json([
                'message' => 'Organization is not a site (no domains found)'
            ], 404);
        }

        $domains = $site->domains()->get();

        return response()->json($domains);
    }

    /**
     * Add domain to site.
     */
    public function addDomain(Request $request, Organization $site): JsonResponse
    {
        $this->authorize('organizations.edit');

        $validator = Validator::make($request->all(), [
            'domain' => 'required|string|max:255|unique:organization_domains,domain',
            'custom_domain' => 'nullable|string|max:255|unique:organization_domains,custom_domain',
            'is_primary' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // If setting as primary, unset other primary domains
        if ($request->get('is_primary', false)) {
            $site->domains()->update(['is_primary' => false]);
        }

        $domain = $site->domains()->create($request->all());

        return response()->json($domain, 201);
    }

    /**
     * Remove domain from site.
     */
    public function removeDomain(Organization $site, OrganizationDomain $domain): JsonResponse
    {
        $this->authorize('organizations.edit');

        // Ensure the domain belongs to this site
        if ($domain->organization_id !== $site->id) {
            return response()->json([
                'message' => 'Domain does not belong to this site'
            ], 403);
        }

        $domain->delete();

        return response()->json([
            'message' => 'Domain removed successfully'
        ]);
    }
}
