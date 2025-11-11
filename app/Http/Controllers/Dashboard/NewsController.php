<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\News\StoreNewsRequest;
use App\Http\Requests\News\UpdateNewsRequest;
use App\Http\Resources\NewsResource;
use App\Models\News;
use App\Models\Organization;
use App\Services\News\NewsQueryService;
use App\Services\News\NewsService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewsController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly NewsQueryService $queryService,
        private readonly NewsService $newsService,
    )
    {
        $this->middleware(['auth', 'verified']);
    }

    public function all(Request $request): Response
    {
        $this->authorize('viewAny', News::class);

        $query = $this->queryService->baseQuery();
        $query = $this->queryService->applyPermissions($query, $request->user());
        $query = $this->queryService->applyFilters($query, $request);

        $news = $this->queryService->paginate($query, $request);

        return Inertia::render('dashboard/news/NewsIndex', [
            'context' => [
                'mode' => 'global',
                'organization' => null,
            ],
            'news' => [
                'data' => NewsResource::collection($news->items())->resolve(),
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'last_page' => $news->lastPage(),
                    'per_page' => $news->perPage(),
                    'total' => $news->total(),
                ],
            ],
            'filters' => $request->only([
                'search',
                'status',
                'visibility',
                'type',
                'organization_id',
                'featured',
                'upcoming',
                'starts_from',
                'starts_to',
            ]),
            'lookups' => [
                'organizations' => $request->user()->isSuperAdmin()
                    ? Organization::query()->select('id', 'name')->orderBy('name')->get()
                    : [],
            ],
            'permissions' => [
                'canCreate' => $request->user()->can('create', News::class),
            ],
        ]);
    }

    public function index(Request $request, Organization $organization): Response
    {
        $this->authorize('viewAny', News::class);

        if (!$request->user()->isSuperAdmin() && !$request->user()->belongsToOrganization($organization->id)) {
            abort(403);
        }

        $request->merge(['organization_id' => $organization->id]);

        $query = $this->queryService->baseQuery()
            ->where('organization_id', $organization->id);

        $query = $this->queryService->applyFilters($query, $request);

        $news = $this->queryService->paginate($query, $request);

        return Inertia::render('dashboard/news/NewsIndex', [
            'context' => [
                'mode' => 'organization',
                'organization' => $organization->only(['id', 'name', 'slug']),
            ],
            'news' => [
                'data' => NewsResource::collection($news->items())->resolve(),
                'meta' => [
                    'current_page' => $news->currentPage(),
                    'last_page' => $news->lastPage(),
                    'per_page' => $news->perPage(),
                    'total' => $news->total(),
                ],
            ],
            'filters' => $request->only([
                'search',
                'status',
                'visibility',
                'type',
                'featured',
                'upcoming',
                'starts_from',
                'starts_to',
            ]),
            'lookups' => [
                'organizations' => [],
            ],
            'permissions' => [
                'canCreate' => $request->user()->can('create', News::class),
            ],
        ]);
    }

    public function create(Request $request, ?Organization $organization = null): Response
    {
        $this->authorize('create', News::class);

        if ($organization && !$request->user()->belongsToOrganization($organization->id) && !$request->user()->isSuperAdmin()) {
            abort(403);
        }

        return Inertia::render('dashboard/news/NewsForm', $this->formProps($request, $organization, null));
    }

    public function store(StoreNewsRequest $request, ?Organization $organization = null): RedirectResponse
    {
        $this->authorize('create', News::class);

        if ($organization && !$request->user()->belongsToOrganization($organization->id) && !$request->user()->isSuperAdmin()) {
            abort(403);
        }

        $payload = $request->validatedPayload();

        if ($organization) {
            $payload['organization_id'] = $organization->id;
        }

        $news = $this->newsService->create($payload, $request->newsable(), $request->user());

        $redirect = $organization
            ? route('organizations.news.edit', [$organization, $news])
            : route('news.edit', $news);

        return redirect($redirect)->with('success', 'Материал успешно создан');
    }

    public function show(Request $request, News $news, ?Organization $organization = null): Response
    {
        $this->authorize('view', $news);

        if ($organization) {
            $this->ensureOrganizationContext($organization, $news);
        }

        $news->load(['organization', 'newsable']);

        return Inertia::render('dashboard/news/NewsShow', [
            'context' => [
                'mode' => $organization ? 'organization' : 'global',
                'organization' => $organization?->only(['id', 'name', 'slug']),
            ],
            'news' => [
                'data' => (new NewsResource($news))->toArray($request),
            ],
            'permissions' => [
                'canManage' => $request->user()->can('update', $news),
            ],
        ]);
    }

    public function edit(Request $request, News $news, ?Organization $organization = null): Response
    {
        $this->authorize('update', $news);

        if ($organization) {
            $this->ensureOrganizationContext($organization, $news);
        }

        $news->load(['organization', 'newsable']);

        return Inertia::render('dashboard/news/NewsForm', $this->formProps($request, $organization, $news));
    }

    public function update(UpdateNewsRequest $request, News $news, ?Organization $organization = null): RedirectResponse
    {
        $this->authorize('update', $news);

        if ($organization) {
            $this->ensureOrganizationContext($organization, $news);
        }

        $payload = $request->validatedPayload();

        if ($organization) {
            $payload['organization_id'] = $organization->id;
        }

        $this->newsService->update($news, $payload, $request->newsable(), $request->user());

        $redirect = $organization
            ? route('organizations.news.edit', [$organization, $news])
            : route('news.edit', $news);

        return redirect($redirect)->with('success', 'Материал обновлен');
    }

    public function destroy(Request $request, News $news, ?Organization $organization = null): RedirectResponse
    {
        $this->authorize('delete', $news);

        if ($organization) {
            $this->ensureOrganizationContext($organization, $news);
        }

        $this->newsService->delete($news, $request->user());

        $redirect = $organization
            ? route('organizations.news.index', $organization)
            : route('news.index');

        return redirect($redirect)->with('success', 'Материал удален');
    }

    private function ensureOrganizationContext(Organization $organization, News $news): void
    {
        if ($news->organization_id !== $organization->id) {
            abort(404);
        }
    }

    private function formProps(Request $request, ?Organization $organization, ?News $news): array
    {
        $user = $request->user();

        if ($organization && !$user->belongsToOrganization($organization->id) && !$user->isSuperAdmin()) {
            throw ValidationException::withMessages([
                'organization_id' => 'Нет доступа к выбранной организации.',
            ]);
        }

        return [
            'context' => [
                'mode' => $organization ? 'organization' : 'global',
                'organization' => $organization?->only(['id', 'name', 'slug']),
            ],
            'news' => $news ? (new NewsResource($news))->toArray($request) : null,
            'defaults' => [
                'status' => $news?->status?->value ?? 'draft',
                'visibility' => $news?->visibility?->value ?? 'public',
                'type' => $news?->type ?? 'event',
                'starts_at' => $news?->starts_at?->toISOString(),
                'ends_at' => $news?->ends_at?->toISOString(),
            ],
            'lookups' => [
                'organizations' => $user->isSuperAdmin()
                    ? Organization::query()->select('id', 'name')->orderBy('name')->get()
                    : [],
            ],
            'permissions' => [
                'canManage' => $news ? $user->can('update', $news) : $user->can('create', News::class),
            ],
        ];
    }
}

