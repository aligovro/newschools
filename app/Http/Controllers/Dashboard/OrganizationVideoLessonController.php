<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreOrganizationVideoLessonRequest;
use App\Http\Requests\Organization\UpdateOrganizationVideoLessonRequest;
use App\Http\Resources\OrganizationVideoLessonResource;
use App\Models\Organization;
use App\Models\OrganizationVideoLesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class OrganizationVideoLessonController extends Controller
{
    public function index(Request $request, Organization $organization): JsonResponse|InertiaResponse
    {
        if ($request->wantsJson()) {
            $perPage = min($request->get('per_page', 20), 100);
            $lessons = $organization->videoLessons()->paginate($perPage);

            return response()->json([
                'data' => OrganizationVideoLessonResource::collection($lessons->items()),
                'pagination' => [
                    'current_page' => $lessons->currentPage(),
                    'last_page' => $lessons->lastPage(),
                    'per_page' => $lessons->perPage(),
                    'total' => $lessons->total(),
                ],
            ]);
        }

        $organization->load('region:id,name');
        $lessons = $organization->videoLessons()->paginate(20);

        return Inertia::render('dashboard/organizations/OrganizationVideoLessonsPage', [
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'type' => $organization->type,
                'status' => $organization->status,
                'region' => $organization->region ? ['name' => $organization->region->name] : null,
            ],
            'initialLessons' => OrganizationVideoLessonResource::collection($lessons->items())->resolve(),
            'hasMore' => $lessons->currentPage() < $lessons->lastPage(),
        ]);
    }

    public function store(StoreOrganizationVideoLessonRequest $request, Organization $organization): JsonResponse
    {
        $data = $request->only(['title', 'description', 'video_url', 'sort_order']);

        if ($request->hasFile('thumbnail')) {
            $data['thumbnail'] = $request->file('thumbnail')->store('organization-video-lessons', 'public');
        }

        $lesson = $organization->videoLessons()->create($data);

        return response()->json([
            'message' => 'Видео урок успешно добавлен',
            'data' => new OrganizationVideoLessonResource($lesson),
        ], 201);
    }

    public function show(Organization $organization, OrganizationVideoLesson $videoLesson): JsonResponse
    {
        if ($videoLesson->organization_id !== $organization->id) {
            abort(404);
        }

        return response()->json([
            'data' => new OrganizationVideoLessonResource($videoLesson),
        ]);
    }

    public function update(
        UpdateOrganizationVideoLessonRequest $request,
        Organization $organization,
        OrganizationVideoLesson $videoLesson,
    ): JsonResponse {
        if ($videoLesson->organization_id !== $organization->id) {
            abort(404);
        }

        $data = $request->only(['title', 'description', 'video_url', 'sort_order']);

        if ($request->hasFile('thumbnail')) {
            if ($videoLesson->thumbnail && Storage::disk('public')->exists($videoLesson->thumbnail)) {
                Storage::disk('public')->delete($videoLesson->thumbnail);
            }
            $data['thumbnail'] = $request->file('thumbnail')->store('organization-video-lessons', 'public');
        }

        $videoLesson->update($data);

        return response()->json([
            'message' => 'Видео урок успешно обновлён',
            'data' => new OrganizationVideoLessonResource($videoLesson->fresh()),
        ]);
    }

    public function destroy(Organization $organization, OrganizationVideoLesson $videoLesson): JsonResponse
    {
        if ($videoLesson->organization_id !== $organization->id) {
            abort(404);
        }

        if ($videoLesson->thumbnail && Storage::disk('public')->exists($videoLesson->thumbnail)) {
            Storage::disk('public')->delete($videoLesson->thumbnail);
        }

        $videoLesson->delete();

        return response()->json([
            'message' => 'Видео урок успешно удалён',
        ]);
    }
}
