<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationStaffResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationStaffController extends Controller
{
    /**
     * Публичный список сотрудников организации (преподаватели и др.)
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->filled('organization_id')
            ? (int) $request->input('organization_id')
            : null;
        $limit = max(1, min((int) $request->get('limit', 20), 50));

        if (!$organizationId || $organizationId < 1) {
            return response()->json(['data' => []]);
        }

        $organization = Organization::find($organizationId);
        if (!$organization) {
            return response()->json(['data' => []]);
        }

        $staff = $organization->staff()
            ->orderBy('position')
            ->orderBy('last_name')
            ->limit($limit)
            ->get();

        return OrganizationStaffResource::collection($staff)->response();
    }
}
