<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationClubResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationClubsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->filled('organization_id')
            ? (int) $request->input('organization_id')
            : null;
        $limit  = max(1, min((int) $request->get('limit', 20), 50));
        $offset = max(0, (int) $request->get('offset', 0));

        if (!$organizationId || $organizationId < 1) {
            return response()->json(['data' => [], 'total' => 0, 'has_more' => false]);
        }

        $organization = Organization::find($organizationId);
        if (!$organization) {
            return response()->json(['data' => [], 'total' => 0, 'has_more' => false]);
        }

        $total = $organization->clubs()->count();
        $clubs = $organization->clubs()
            ->skip($offset)
            ->take($limit)
            ->get();

        return response()->json([
            'data'     => OrganizationClubResource::collection($clubs)->resolve($request),
            'total'    => $total,
            'has_more' => ($offset + $limit) < $total,
        ]);
    }
}
