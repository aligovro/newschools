<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrganizationVideoLessonResource;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizationVideoLessonsController extends Controller
{
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

        $lessons = $organization->videoLessons()->limit($limit)->get();

        return OrganizationVideoLessonResource::collection($lessons)->response();
    }
}
