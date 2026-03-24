<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationClubRequest;
use App\Http\Requests\Organization\UpdateOrganizationClubRequest;
use App\Http\Resources\OrganizationClubResource;
use App\Models\Organization;
use App\Models\OrganizationClub;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OrganizationClubController extends Controller
{
    public function index(Request $request, Organization $organization): JsonResponse|InertiaResponse
    {
        if ($request->wantsJson()) {
            $perPage = min($request->get('per_page', 20), 100);
            $clubs = $organization->clubs()->paginate($perPage);

            return response()->json([
                'data' => OrganizationClubResource::collection($clubs->items()),
                'pagination' => [
                    'current_page' => $clubs->currentPage(),
                    'last_page' => $clubs->lastPage(),
                    'per_page' => $clubs->perPage(),
                    'total' => $clubs->total(),
                ],
            ]);
        }

        $organization->load('region:id,name');
        $clubs = $organization->clubs()->paginate(20);

        return Inertia::render('dashboard/organizations/OrganizationClubsPage', [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'type' => $organization->type,
                'status' => $organization->status,
                'region' => $organization->region ? ['name' => $organization->region->name] : null,
            ],
            'initialClubs' => OrganizationClubResource::collection($clubs->items())->resolve(),
            'hasMore' => $clubs->currentPage() < $clubs->lastPage(),
        ]);
    }

    public function store(StoreOrganizationClubRequest $request, Organization $organization): JsonResponse
    {
        $data = $request->only(['name', 'description', 'sort_order', 'schedule']);
        $data['schedule'] = $this->normalizeSchedule($data['schedule'] ?? []);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('organization-clubs', 'public');
        }

        $club = $organization->clubs()->create($data);

        if ($request->hasFile('gallery')) {
            $galleryPaths = [];
            foreach ($request->file('gallery') as $image) {
                $galleryPaths[] = $image->store('organization-clubs/gallery', 'public');
            }
            $club->update(['gallery' => $galleryPaths]);
        }

        return response()->json([
            'message' => 'Кружок/секция успешно создан',
            'data' => new OrganizationClubResource($club),
        ], 201);
    }

    public function show(Organization $organization, OrganizationClub $club): JsonResponse
    {
        if ($club->organization_id !== $organization->id) {
            abort(404);
        }

        return response()->json([
            'data' => new OrganizationClubResource($club),
        ]);
    }

    public function update(
        UpdateOrganizationClubRequest $request,
        Organization $organization,
        OrganizationClub $club,
    ): JsonResponse {
        if ($club->organization_id !== $organization->id) {
            abort(404);
        }

        $data = $request->only(['name', 'description', 'sort_order', 'schedule']);
        $data['schedule'] = $this->normalizeSchedule($data['schedule'] ?? []);

        if ($request->hasFile('image')) {
            if ($club->image && Storage::disk('public')->exists($club->image)) {
                Storage::disk('public')->delete($club->image);
            }
            $data['image'] = $request->file('image')->store('organization-clubs', 'public');
        }

        $club->update($data);

        $shouldSyncGallery = $request->has('gallery_sync')
            || $request->has('existing_gallery')
            || $request->hasFile('gallery');

        if ($shouldSyncGallery) {
            $finalGallery = [];
            $existingFromRequest = $request->input('existing_gallery', []);

            if (is_array($existingFromRequest)) {
                $finalGallery = array_map(function ($path) {
                    return ltrim(str_replace('/storage/', '', (string) $path), '/');
                }, $existingFromRequest);
            }

            if ($request->hasFile('gallery')) {
                foreach ($request->file('gallery') as $image) {
                    $finalGallery[] = $image->store('organization-clubs/gallery', 'public');
                }
            }

            $club->update(['gallery' => $finalGallery]);
        }

        return response()->json([
            'message' => 'Кружок/секция успешно обновлён',
            'data' => new OrganizationClubResource($club->fresh()),
        ]);
    }

    public function destroy(Organization $organization, OrganizationClub $club): JsonResponse
    {
        if ($club->organization_id !== $organization->id) {
            abort(404);
        }

        if ($club->image && Storage::disk('public')->exists($club->image)) {
            Storage::disk('public')->delete($club->image);
        }

        if ($club->gallery) {
            foreach ($club->gallery as $imagePath) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        $club->delete();

        return response()->json([
            'message' => 'Кружок/секция успешно удалён',
        ]);
    }

    private function normalizeSchedule(?array $schedule): array
    {
        if (!is_array($schedule)) {
            return [];
        }
        $days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        $result = [];
        foreach ($days as $day) {
            $val = $schedule[$day] ?? null;
            $result[$day] = $val && trim((string) $val) !== '' ? trim((string) $val) : null;
        }
        return $result;
    }
}
