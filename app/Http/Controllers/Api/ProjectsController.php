<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectsController extends Controller
{
    /**
     * Получить последние проекты (публично)
     */
    public function latest(Request $request): JsonResponse
    {
        $organizationId = $request->filled('organization_id')
            ? (int) $request->input('organization_id')
            : null;
        $limit = max(1, min((int) $request->get('limit', 6), 30));
        $excludeSlug = $request->string('exclude_slug')->toString();

        $projects = Project::query()
            ->with('organization')
            ->where('status', 'active')
            ->when($organizationId > 0, function ($query) use ($organizationId) {
                $query->where('organization_id', $organizationId);
            })
            ->when($excludeSlug, function ($query) use ($excludeSlug) {
                $query->where('slug', '!=', $excludeSlug);
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return ProjectResource::collection($projects)->response();
    }
}
