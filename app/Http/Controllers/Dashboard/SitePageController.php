<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Site;
use App\Models\SitePage;
use App\Http\Resources\SitePageResource;
use App\Http\Requests\SitePage\StoreSitePageRequest;
use App\Http\Requests\SitePage\UpdateSitePageRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Список страниц сайта
     */
    public function index(Site $site): Response
    {
        $query = $site->pages()
            ->with(['parent:id,title,slug', 'children:id,title,slug,parent_id'])
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        // Поиск
        if (request()->filled('search')) {
            $search = request()->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Фильтрация по статусу
        if (request()->filled('status')) {
            $query->where('status', request()->status);
        }

        // Фильтрация по шаблону
        if (request()->filled('template')) {
            $query->where('template', request()->template);
        }

        // Пагинация
        $perPage = min(request()->get('per_page', 15), 100);
        $pages = $query->paginate($perPage);

        return Inertia::render('sites/pages/Index', [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
            ],
            'pages' => SitePageResource::collection($pages),
            'filters' => [
                'search' => request()->search,
                'status' => request()->status,
                'template' => request()->template,
            ],
        ]);
    }

    /**
     * Форма создания страницы
     */
    public function create(Site $site): Response
    {
        $parentPages = $site->pages()
            ->whereNull('parent_id')
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        return Inertia::render('sites/pages/Create', [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
            ],
            'parentPages' => $parentPages,
        ]);
    }

    /**
     * Создание новой страницы
     */
    public function store(StoreSitePageRequest $request, Site $site): RedirectResponse
    {
        $validated = $request->validated();
        $validated['site_id'] = $site->id;

        // Генерируем slug если не указан
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            // Проверяем уникальность сгенерированного slug
            $counter = 1;
            $originalSlug = $validated['slug'];
            while ($site->pages()->where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Если это главная страница, убираем главную страницу у других страниц
        if ($validated['is_homepage'] ?? false) {
            $site->pages()->update(['is_homepage' => false]);
        }

        // Устанавливаем значения по умолчанию
        if (!isset($validated['status'])) {
            $validated['status'] = 'draft';
        }
        if (!isset($validated['is_public'])) {
            $validated['is_public'] = false;
        }
        if (!isset($validated['show_in_navigation'])) {
            $validated['show_in_navigation'] = true;
        }
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = 0;
        }

        $page = $site->pages()->create($validated);

        // Сбрасываем кеш страницы
        $this->clearPageCache($site->id, $page->slug);

        return redirect()
            ->route('sites.pages.show', ['site' => $site, 'page' => $page])
            ->with('success', 'Страница успешно создана');
    }

    /**
     * Просмотр страницы
     */
    public function show(Site $site, SitePage $page): Response
    {
        // Проверяем, что страница принадлежит сайту
        if ($page->site_id !== $site->id) {
            abort(404);
        }

        $page->load(['parent:id,title,slug', 'children:id,title,slug,sort_order', 'site:id,name,slug']);

        return Inertia::render('sites/pages/Show', [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
            ],
            'page' => (new SitePageResource($page))->toArray(request()),
        ]);
    }

    /**
     * Форма редактирования страницы
     */
    public function edit(Site $site, SitePage $page): Response
    {
        // Проверяем, что страница принадлежит сайту
        if ($page->site_id !== $site->id) {
            abort(404);
        }

        // Загружаем связи страницы
        $page->load(['parent', 'children', 'site']);

        $parentPages = $site->pages()
            ->where('id', '!=', $page->id)
            ->where(function ($query) use ($page) {
                $query->whereNull('parent_id')
                    ->orWhere('parent_id', '!=', $page->id);
            })
            ->orderBy('title')
            ->get(['id', 'title', 'slug']);

        return Inertia::render('sites/pages/Edit', [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
            ],
            'page' => (new SitePageResource($page))->toArray(request()),
            'parentPages' => $parentPages,
        ]);
    }

    /**
     * Обновление страницы
     */
    public function update(UpdateSitePageRequest $request, Site $site, SitePage $page): RedirectResponse
    {
        $validated = $request->validated();

        // Генерируем slug если не указан
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            // Проверяем уникальность сгенерированного slug
            $counter = 1;
            $originalSlug = $validated['slug'];
            while ($site->pages()->where('slug', $validated['slug'])->where('id', '!=', $page->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Если это главная страница, убираем главную страницу у других страниц
        if ($validated['is_homepage'] ?? false) {
            $site->pages()->where('id', '!=', $page->id)->update(['is_homepage' => false]);
        }

        $oldSlug = $page->slug;
        $page->update($validated);

        // Сбрасываем кеш страницы (старый и новый slug, если изменился)
        $this->clearPageCache($site->id, $oldSlug);
        if ($oldSlug !== $page->slug) {
            $this->clearPageCache($site->id, $page->slug);
        }

        return redirect()
            ->route('sites.pages.show', ['site' => $site, 'page' => $page])
            ->with('success', 'Страница успешно обновлена');
    }

    /**
     * Удаление страницы
     */
    public function destroy(Site $site, SitePage $page): RedirectResponse
    {
        // Если удаляется главная страница, создаем новую
        if ($page->is_homepage) {
            $firstPage = $site->pages()->where('id', '!=', $page->id)->first();
            if ($firstPage) {
                $firstPage->update(['is_homepage' => true]);
            }
        }

        $pageSlug = $page->slug;
        $page->delete();

        // Сбрасываем кеш удаленной страницы
        $this->clearPageCache($site->id, $pageSlug);

        return redirect()
            ->route('sites.pages.index', $site)
            ->with('success', 'Страница успешно удалена');
    }

    /**
     * Сброс кеша страницы
     */
    private function clearPageCache(int $siteId, string $slug): void
    {
        Cache::forget("site_page_{$siteId}_{$slug}");
    }
}
