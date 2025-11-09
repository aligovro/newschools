<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\ProjectSponsorsRequest;
use App\Http\Resources\Sponsors\SponsorResource;
use App\Models\Project;
use App\Services\Sponsors\ProjectSponsorService;
use Illuminate\Http\JsonResponse;

class PublicSponsorController extends Controller
{
    public function __construct(
        private readonly ProjectSponsorService $projectSponsorService,
    ) {
    }

    public function projectSponsors(ProjectSponsorsRequest $request, Project $project): JsonResponse
    {
        $paginator = $this->projectSponsorService->paginate(
            $project,
            $request->sort(),
            $request->perPage(),
            $request->page(),
        );

        $data = SponsorResource::collection(collect($paginator->items()))->resolve();

        return response()->json([
            'success' => true,
            'sort' => $request->sort(),
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

