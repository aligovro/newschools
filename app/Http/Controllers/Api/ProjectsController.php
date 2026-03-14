<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Models\ProjectCategory;
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
        $categorySlug = $request->string('category')->toString();
        $withMeta = $request->boolean('with_meta') && $organizationId > 0;

        $query = Project::query()
            ->with(['organization', 'categories'])
            ->where('status', 'active')
            ->when($organizationId > 0, fn ($q) => $q->where('organization_id', $organizationId))
            ->when($excludeSlug, fn ($q) => $q->where('slug', '!=', $excludeSlug))
            ->when($categorySlug, fn ($q) => $q->byCategory($categorySlug));

        $projects = (clone $query)->orderByDesc('created_at')->limit($limit)->get();

        $response = ProjectResource::collection($projects);

        if ($withMeta) {
            $baseQuery = Project::query()
                ->where('status', 'active')
                ->where('organization_id', $organizationId);

            $categories = ProjectCategory::query()
                ->active()
                ->ordered()
                ->whereHas('projects', fn ($q) => $q->where('organization_id', $organizationId)->where('status', 'active'))
                ->withCount(['projects' => fn ($q) => $q->where('organization_id', $organizationId)->where('status', 'active')])
                ->get()
                ->map(fn ($c) => ['slug' => $c->slug, 'name' => $c->name, 'count' => $c->projects_count])
                ->toArray();

            $totalTargetRubles = (float) (clone $baseQuery)->get()->sum(fn ($p) => $p->funding['target']['value'] ?? 0);

            $response->additional([
                'meta' => [
                    'categories' => $categories,
                    'total_target_rubles' => round($totalTargetRubles, 2),
                    'total_target_formatted' => number_format(round($totalTargetRubles, 0), 0, '.', ' ') . ' ₽',
                ],
            ]);
        }

        return $response->response();
    }
}
