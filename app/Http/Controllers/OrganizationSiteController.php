<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationSite;
use App\Models\OrganizationDomain;
use App\Models\OrganizationSitePage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OrganizationSiteController extends Controller
{
    use AuthorizesRequests;

    public function index(Organization $organization)
    {
        $this->authorize('view', $organization);

        $sites = $organization->sites()
            ->with(['domain', 'pages'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('organization/admin/sites/Index', [
            'organization' => $organization,
            'sites' => $sites,
            'templates' => config('sites.templates'),
        ]);
    }

    public function create(Organization $organization)
    {
        $this->authorize('update', $organization);

        $domains = $organization->domains()
            ->where('status', 'active')
            ->get();

        return Inertia::render('organization/admin/sites/Create', [
            'organization' => $organization,
            'domains' => $domains,
            'templates' => config('sites.templates'),
        ]);
    }

    public function store(Request $request, Organization $organization)
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'domain_id' => 'required|exists:organization_domains,id',
            'description' => 'nullable|string',
            'template' => ['required', Rule::in(array_keys(config('sites.templates')))],
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:512',
        ]);

        // Проверяем, что домен принадлежит организации
        $domain = OrganizationDomain::where('id', $validated['domain_id'])
            ->where('organization_id', $organization->id)
            ->firstOrFail();

        // Обработка загрузки файлов
        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')->store('sites/logos', 'public');
        }

        if ($request->hasFile('favicon')) {
            $validated['favicon'] = $request->file('favicon')->store('sites/favicons', 'public');
        }

        // Получаем настройки шаблона
        $templateConfig = config('sites.templates.' . $validated['template']);
        $validated['layout_config'] = $templateConfig['default_layout'] ?? [];
        $validated['theme_config'] = $templateConfig['default_theme'] ?? [];

        $site = $organization->sites()->create($validated);

        // Создаем главную страницу
        $site->pages()->create([
            'title' => 'Главная',
            'slug' => '',
            'content' => '<h1>Добро пожаловать на наш сайт!</h1><p>Это главная страница вашего сайта. Вы можете отредактировать её в админ-панели.</p>',
            'template' => 'default',
            'is_homepage' => true,
            'is_public' => true,
            'status' => 'published',
            'published_at' => now(),
        ]);

        return redirect()
            ->route('organization.admin.sites.edit', [$organization, $site])
            ->with('success', 'Сайт создан успешно');
    }

    public function edit(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->load(['domain', 'pages', 'sliders']);

        return Inertia::render('organization/admin/sites/Edit', [
            'organization' => $organization,
            'site' => $site,
            'templates' => config('sites.templates'),
            'pageTemplates' => config('sites.page_templates'),
            'blocks' => config('sites.blocks'),
        ]);
    }

    public function editWithBuilder(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->load(['domain', 'pages']);

        $domains = $organization->domains()
            ->where('status', 'active')
            ->get();

        return Inertia::render('organization/admin/sites/EditWithBuilder', [
            'organization' => $organization,
            'site' => $site,
            'domains' => $domains,
            'siteTemplates' => config('sites.templates'),
            'contentBlocks' => config('sites.content_blocks'),
        ]);
    }

    public function update(Request $request, Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template' => ['required', Rule::in(array_keys(config('sites.templates')))],
            'layout_config' => 'nullable|array',
            'theme_config' => 'nullable|array',
            'content_blocks' => 'nullable|array',
            'navigation_config' => 'nullable|array',
            'seo_config' => 'nullable|array',
            'custom_settings' => 'nullable|array',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'favicon' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:512',
            'status' => 'required|in:draft,published,archived',
            'is_public' => 'boolean',
            'is_maintenance_mode' => 'boolean',
            'maintenance_message' => 'nullable|string',
        ]);

        // Обработка загрузки файлов
        if ($request->hasFile('logo')) {
            // Удаляем старое изображение
            if ($site->logo) {
                Storage::disk('public')->delete($site->logo);
            }
            $validated['logo'] = $request->file('logo')->store('sites/logos', 'public');
        }

        if ($request->hasFile('favicon')) {
            // Удаляем старое изображение
            if ($site->favicon) {
                Storage::disk('public')->delete($site->favicon);
            }
            $validated['favicon'] = $request->file('favicon')->store('sites/favicons', 'public');
        }

        // Обновляем время последнего изменения
        $validated['last_updated_at'] = now();

        $site->update($validated);

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Сайт обновлен успешно');
    }

    public function destroy(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        // Удаляем файлы
        if ($site->logo) {
            Storage::disk('public')->delete($site->logo);
        }
        if ($site->favicon) {
            Storage::disk('public')->delete($site->favicon);
        }

        $site->delete();

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Сайт удален успешно');
    }

    public function publish(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->publish();

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Сайт опубликован');
    }

    public function unpublish(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->unpublish();

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Сайт снят с публикации');
    }

    public function archive(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->archive();

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Сайт архивирован');
    }

    public function enableMaintenanceMode(Request $request, Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'message' => 'nullable|string|max:500',
        ]);

        $site->enableMaintenanceMode($validated['message']);

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Режим обслуживания включен');
    }

    public function disableMaintenanceMode(Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $site->disableMaintenanceMode();

        return redirect()
            ->route('organization.admin.sites.index', $organization)
            ->with('success', 'Режим обслуживания отключен');
    }

    // Методы для страниц сайта
    public function storePage(Request $request, Organization $organization, OrganizationSite $site)
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'template' => ['required', Rule::in(array_keys(config('sites.page_templates')))],
            'parent_id' => 'nullable|exists:organization_site_pages,id',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_homepage' => 'boolean',
            'is_public' => 'boolean',
            'show_in_navigation' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Обработка загрузки изображения
        if ($request->hasFile('featured_image')) {
            $validated['featured_image'] = $request->file('featured_image')->store('sites/pages', 'public');
        }

        // Если это главная страница, убираем статус у других страниц
        if ($validated['is_homepage'] ?? false) {
            $site->pages()->update(['is_homepage' => false]);
        }

        $page = $site->pages()->create($validated);

        return response()->json([
            'success' => true,
            'page' => $page->load('parent')
        ]);
    }

    public function updatePage(Request $request, Organization $organization, OrganizationSite $site, OrganizationSitePage $page)
    {
        $this->authorize('update', $organization);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'nullable|string',
            'template' => ['required', Rule::in(array_keys(config('sites.page_templates')))],
            'parent_id' => 'nullable|exists:organization_site_pages,id',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'is_homepage' => 'boolean',
            'is_public' => 'boolean',
            'show_in_navigation' => 'boolean',
            'sort_order' => 'integer|min:0',
        ]);

        // Обработка загрузки изображения
        if ($request->hasFile('featured_image')) {
            // Удаляем старое изображение
            if ($page->featured_image) {
                Storage::disk('public')->delete($page->featured_image);
            }
            $validated['featured_image'] = $request->file('featured_image')->store('sites/pages', 'public');
        }

        // Если это главная страница, убираем статус у других страниц
        if ($validated['is_homepage'] ?? false) {
            $site->pages()->where('id', '!=', $page->id)->update(['is_homepage' => false]);
        }

        $page->update($validated);

        return response()->json([
            'success' => true,
            'page' => $page->load('parent')
        ]);
    }

    public function destroyPage(Organization $organization, OrganizationSite $site, OrganizationSitePage $page)
    {
        $this->authorize('update', $organization);

        // Удаляем изображение
        if ($page->featured_image) {
            Storage::disk('public')->delete($page->featured_image);
        }

        $page->delete();

        return response()->json(['success' => true]);
    }

    public function publishPage(Organization $organization, OrganizationSite $site, OrganizationSitePage $page)
    {
        $this->authorize('update', $organization);

        $page->publish();

        return response()->json(['success' => true]);
    }

    public function unpublishPage(Organization $organization, OrganizationSite $site, OrganizationSitePage $page)
    {
        $this->authorize('update', $organization);

        $page->unpublish();

        return response()->json(['success' => true]);
    }
}
