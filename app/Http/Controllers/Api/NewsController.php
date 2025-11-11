<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use App\Services\News\NewsQueryService;
use App\Services\News\NewsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NewsController extends Controller
{
    public function __construct(
        private readonly NewsQueryService $queryService,
        private readonly NewsService $newsService
    ) {
        $this->middleware(['auth']);
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', News::class);

        $query = $this->queryService->baseQuery();
        $query = $this->queryService->applyPermissions($query, $request->user());
        $query = $this->queryService->applyFilters($query, $request);

        $news = $this->queryService->paginate($query, $request);

        return NewsResource::collection($news)
            ->additional([
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'last_page' => $news->lastPage(),
                    'per_page' => $news->perPage(),
                    'total' => $news->total(),
                ],
            ])
            ->response();
    }

    public function store(StoreNewsRequest $request): JsonResponse
    {
        $this->authorize('create', News::class);

        $payload = $request->validatedPayload();
        $news = $this->newsService->create($payload, $request->newsable(), $request->user());

        return (new NewsResource($news))
            ->response()
            ->setStatusCode(201);
    }

    public function show(News $news): JsonResponse
    {
        $this->authorize('view', $news);

        $news->load(['organization', 'newsable']);

        return (new NewsResource($news))->response();
    }

    public function update(UpdateNewsRequest $request, News $news): JsonResponse
    {
        $this->authorize('update', $news);

        $payload = $request->validatedPayload();
        $updated = $this->newsService->update($news, $payload, $request->newsable(), $request->user());

        return (new NewsResource($updated))->response();
    }

    public function destroy(Request $request, News $news): JsonResponse
    {
        $this->authorize('delete', $news);

        $this->newsService->delete($news, $request->user());

        return response()->json([
            'message' => 'Материал удален',
        ]);
    }

    public function targets(Request $request): JsonResponse
    {
        $this->authorize('viewAny', News::class);

        $validated = $request->validate([
            'type' => ['required', Rule::in(['organization', 'project', 'site'])],
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $type = $validated['type'];
        $search = $validated['search'] ?? null;
        $perPage = $validated['per_page'] ?? 10;
        $user = $request->user();

        $items = match ($type) {
            'organization' => $this->searchOrganizations($user, $perPage, $search),
            'project' => $this->searchProjects($user, $perPage, $search),
            'site' => $this->searchSites($user, $perPage, $search),
        };

        return response()->json($items);
    }

    public function mainSite(Request $request): JsonResponse
    {
        $this->authorize('viewAny', News::class);

        $mainSite = Site::query()
            ->withoutGlobalScopes()
            ->where('site_type', 'main')
            ->orderByDesc('created_at')
            ->select('id', 'name')
            ->first();

        if (!$mainSite) {
            return response()->json([
                'data' => null,
            ]);
        }

        return response()->json([
            'data' => [
                'site_id' => $mainSite->id,
                'site_name' => $mainSite->name,
            ],
        ]);
    }

    private function searchOrganizations($user, int $perPage, ?string $search): array
    {
        $query = Organization::query()
            ->select('id', 'name', 'slug');

        if (!$user->isSuperAdmin()) {
            $query->whereIn('id', $user->organizations()->select('organizations.id'));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        return [
            'data' => collect($paginator->items())
                ->map(fn($organization) => [
                    'value' => $organization->id,
                    'label' => $organization->name,
                    'description' => $organization->slug,
                    'meta' => [
                        'organization_id' => $organization->id,
                        'organization_name' => $organization->name,
                    ],
                ])
                ->values()
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ];
    }

    private function searchProjects($user, int $perPage, ?string $search): array
    {
        $query = Project::query()
            ->select('id', 'title', 'organization_id')
            ->with('organization:id,name');

        if (!$user->isSuperAdmin()) {
            $query->whereIn('organization_id', $user->organizations()->select('organizations.id'));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('title')->paginate($perPage);

        return [
            'data' => collect($paginator->items())
                ->map(fn($project) => [
                    'value' => $project->id,
                    'label' => $project->title,
                    'description' => $project->organization?->name,
                    'meta' => [
                        'organization_id' => $project->organization_id,
                        'organization_name' => $project->organization?->name,
                    ],
                ])
                ->values()
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ];
    }

    private function searchSites($user, int $perPage, ?string $search): array
    {
        $query = Site::query()
            ->select('id', 'name', 'organization_id')
            ->with('organization:id,name');

        if (!$user->isSuperAdmin()) {
            $query->whereIn('organization_id', $user->organizations()->select('organizations.id'));
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        return [
            'data' => collect($paginator->items())
                ->map(fn($site) => [
                    'value' => $site->id,
                    'label' => $site->name,
                    'description' => $site->organization?->name,
                    'meta' => [
                        'organization_id' => $site->organization_id,
                        'organization_name' => $site->organization?->name,
                    ],
                ])
                ->values()
                ->all(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'has_more' => $paginator->hasMorePages(),
            ],
        ];
    }
}
