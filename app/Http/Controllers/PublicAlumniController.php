<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\OrganizationAlumniRequest;
use App\Http\Resources\Alumni\AlumniResource;
use App\Models\Organization;
use App\Services\Organizations\OrganizationAlumniService;
use Illuminate\Http\JsonResponse;

class PublicAlumniController extends Controller
{
    public function __construct(
        private readonly OrganizationAlumniService $organizationAlumniService,
    ) {
    }

    public function organizationAlumni(OrganizationAlumniRequest $request, Organization $organization): JsonResponse
    {
        if (!$organization->is_public || $organization->status !== 'active') {
            abort(404);
        }

        $paginator = $this->organizationAlumniService->paginate(
            $organization,
            $request->perPage(),
            $request->page(),
        );

        $data = AlumniResource::collection(collect($paginator->items()))->resolve();

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
            'has_more' => $paginator->currentPage() < $paginator->lastPage(),
        ]);
    }
}


