<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
        $organizationId = $request->integer('organization_id');
        $limit = max(1, min((int) $request->get('limit', 6), 30));

        $projects = Project::query()
            ->with('organization')
            ->where('status', 'active')
            ->when($organizationId, function ($q) use ($organizationId) {
                $q->where('organization_id', $organizationId);
            })
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(function (Project $p) {
                return [
                    'id' => $p->id,
                    'title' => $p->title,
                    'short_description' => $p->short_description ?? '',
                    'image' => $p->image_url,
                    'target_amount' => (int) $p->target_amount,
                    'current_amount' => (int) $p->collected_amount,
                    'status' => $p->status,
                    'created_at' => optional($p->created_at)->toDateTimeString(),
                    'organization_name' => optional($p->organization)->name,
                    'organization_id' => $p->organization_id,
                    'slug' => $p->slug,
                    'link' => null,
                ];
            });

        return response()->json([
            'data' => $projects,
        ]);
    }
}
