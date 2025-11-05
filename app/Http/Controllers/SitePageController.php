<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\SitePage;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SitePageController extends Controller
{
    /**
     * Список страниц организации
     */
    public function index(Organization $organization): View
    {
        $this->authorize('viewAny', [SitePage::class, $organization]);

        $pages = $organization->pages()
            ->with('parent')
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return view('organization.pages.index', compact('organization', 'pages'));
    }

    /**
     * Форма создания страницы
     */
    public function create(Organization $organization): View
    {
        $this->authorize('create', [SitePage::class, $organization]);

        $parentPages = $organization->pages()
            ->whereNull('parent_id')
            ->orderBy('title')
            ->get();

        return view('organization.pages.create', compact('organization', 'parentPages'));
    }

    /**
     * Создание новой страницы
     */
    public function store(Request $request, Organization $organization): RedirectResponse
    {
        $this->authorize('create', [SitePage::class, $organization]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('organization_pages')->where(function ($query) use ($organization) {
                    return $query->where('organization_id', $organization->id);
                })
            ],
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,private,scheduled',
            'template' => 'required|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string|max:255',
            'seo_image' => 'nullable|string|max:255',
            'parent_id' => 'nullable|exists:organization_pages,id',
            'is_homepage' => 'boolean',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Генерируем slug если не указан
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            // Проверяем уникальность сгенерированного slug
            $counter = 1;
            $originalSlug = $validated['slug'];
            while ($organization->pages()->where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Если это главная страница, убираем главную страницу у других страниц
        if ($validated['is_homepage'] ?? false) {
            $organization->pages()->update(['is_homepage' => false]);
        }

        $page = $organization->pages()->create($validated);

        return redirect()
            ->route('organization.pages.show', ['organization' => $organization, 'page' => $page])
            ->with('success', 'Страница успешно создана');
    }

    /**
     * Просмотр страницы
     */
    public function show(Organization $organization, SitePage $page): View
    {
        $this->authorize('view', [$page, $organization]);

        $page->load(['parent', 'children']);

        return view('organization.pages.show', compact('organization', 'page'));
    }

    /**
     * Форма редактирования страницы
     */
    public function edit(Organization $organization, SitePage $page): View
    {
        $this->authorize('update', [$page, $organization]);

        $parentPages = $organization->pages()
            ->where('id', '!=', $page->id)
            ->where(function ($query) use ($page) {
                $query->whereNull('parent_id')
                    ->orWhere('parent_id', '!=', $page->id);
            })
            ->orderBy('title')
            ->get();

        return view('organization.pages.edit', compact('organization', 'page', 'parentPages'));
    }

    /**
     * Обновление страницы
     */
    public function update(Request $request, Organization $organization, SitePage $page): RedirectResponse
    {
        $this->authorize('update', [$page, $organization]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('organization_pages')->where(function ($query) use ($organization) {
                    return $query->where('organization_id', $organization->id);
                })->ignore($page->id)
            ],
            'content' => 'nullable|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,private,scheduled',
            'template' => 'required|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string|max:500',
            'seo_keywords' => 'nullable|string|max:255',
            'seo_image' => 'nullable|string|max:255',
            'parent_id' => [
                'nullable',
                'exists:organization_pages,id',
                function ($attribute, $value, $fail) use ($page) {
                    if ($value && $value == $page->id) {
                        $fail('Страница не может быть родителем для самой себя.');
                    }
                }
            ],
            'is_homepage' => 'boolean',
            'published_at' => 'nullable|date',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        // Генерируем slug если не указан
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);

            // Проверяем уникальность сгенерированного slug
            $counter = 1;
            $originalSlug = $validated['slug'];
            while ($organization->pages()->where('slug', $validated['slug'])->where('id', '!=', $page->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $counter;
                $counter++;
            }
        }

        // Если это главная страница, убираем главную страницу у других страниц
        if ($validated['is_homepage'] ?? false) {
            $organization->pages()->where('id', '!=', $page->id)->update(['is_homepage' => false]);
        }

        $page->update($validated);

        return redirect()
            ->route('organization.pages.show', ['organization' => $organization, 'page' => $page])
            ->with('success', 'Страница успешно обновлена');
    }

    /**
     * Удаление страницы
     */
    public function destroy(Organization $organization, SitePage $page): RedirectResponse
    {
        $this->authorize('delete', [$page, $organization]);

        // Если удаляется главная страница, создаем новую
        if ($page->is_homepage) {
            $firstPage = $organization->pages()->where('id', '!=', $page->id)->first();
            if ($firstPage) {
                $firstPage->update(['is_homepage' => true]);
            }
        }

        $page->delete();

        return redirect()
            ->route('organization.pages.index', $organization)
            ->with('success', 'Страница успешно удалена');
    }

    /**
     * Дублирование страницы
     */
    public function duplicate(Organization $organization, SitePage $page): RedirectResponse
    {
        $this->authorize('create', [SitePage::class, $organization]);

        $newPage = $page->replicate();
        $newPage->title = $page->title . ' (копия)';
        $newPage->slug = $page->slug . '-copy';
        $newPage->status = 'draft';
        $newPage->is_homepage = false;

        // Проверяем уникальность slug
        $counter = 1;
        $originalSlug = $newPage->slug;
        while ($organization->pages()->where('slug', $newPage->slug)->exists()) {
            $newPage->slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $newPage->save();

        return redirect()
            ->route('organization.pages.edit', ['organization' => $organization, 'page' => $newPage])
            ->with('success', 'Страница успешно скопирована');
    }

    /**
     * Изменение статуса страницы
     */
    public function updateStatus(Request $request, Organization $organization, SitePage $page): RedirectResponse
    {
        $this->authorize('update', [$page, $organization]);

        $validated = $request->validate([
            'status' => 'required|in:draft,published,private,scheduled',
            'published_at' => 'nullable|date',
        ]);

        $page->update($validated);

        return redirect()
            ->route('organization.pages.show', ['organization' => $organization, 'page' => $page])
            ->with('success', 'Статус страницы обновлен');
    }

    /**
     * Получение страниц для API (для меню, навигации и т.д.)
     */
    public function apiPages(Organization $organization)
    {
        $pages = $organization->publishedPages()
            ->whereNull('parent_id')
            ->with('children')
            ->orderBy('sort_order')
            ->get();

        return response()->json($pages);
    }
}
