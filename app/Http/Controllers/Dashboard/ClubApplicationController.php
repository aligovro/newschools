<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\ClubApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ClubApplicationResource;
use App\Models\ClubApplication;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ClubApplicationController extends Controller
{
    public function index(Request $request, Organization $organization): JsonResponse|InertiaResponse
    {
        $status = $request->get('status');

        $query = $organization->clubApplications()
            ->with('club:id,name')
            ->latest();

        if ($status && ClubApplicationStatus::tryFrom($status)) {
            $query->where('status', $status);
        }

        if ($request->wantsJson()) {
            $perPage = min($request->get('per_page', 20), 100);
            $paginated = $query->paginate($perPage);

            return response()->json([
                'data'       => ClubApplicationResource::collection($paginated->items()),
                'pagination' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page'    => $paginated->lastPage(),
                    'per_page'     => $paginated->perPage(),
                    'total'        => $paginated->total(),
                ],
            ]);
        }

        $organization->load('region:id,name');
        $paginated = $query->paginate(20);

        $counts = [
            'total'   => $organization->clubApplications()->count(),
            'pending' => $organization->clubApplications()->pending()->count(),
        ];

        return Inertia::render('dashboard/organizations/OrganizationClubApplicationsPage', [
            'organization'        => [
                'id'     => $organization->id,
                'name'   => $organization->name,
                'type'   => $organization->type,
                'status' => $organization->status,
                'region' => $organization->region ? ['name' => $organization->region->name] : null,
            ],
            'initialApplications' => ClubApplicationResource::collection($paginated->items())->resolve(),
            'hasMore'             => $paginated->currentPage() < $paginated->lastPage(),
            'counts'              => $counts,
            'statusFilter'        => $status,
        ]);
    }

    public function update(Request $request, Organization $organization, ClubApplication $application): JsonResponse
    {
        if ($application->organization_id !== $organization->id) {
            abort(404);
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                ClubApplicationStatus::Approved->value,
                ClubApplicationStatus::Rejected->value,
            ])],
        ]);

        $application->update([
            'status'      => $validated['status'],
            'reviewed_at' => now(),
            'reviewed_by' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Статус заявки обновлён',
            'data'    => new ClubApplicationResource($application->fresh()),
        ]);
    }
}
