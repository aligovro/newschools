<?php

namespace App\Http\Controllers;

use App\Models\OrganizationSite;
use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SiteController extends Controller
{
    public function index(Request $request)
    {
        $query = OrganizationSite::with(['organization'])
            ->withCount(['pages', 'widgets']);

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('organization', function ($orgQuery) use ($search) {
                        $orgQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Фильтрация по статусу
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Фильтрация по шаблону
        if ($request->filled('template')) {
            $query->where('template', $request->template);
        }

        // Фильтрация по организации
        if ($request->filled('organization_id')) {
            $query->where('organization_id', $request->organization_id);
        }

        // Сортировка
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');

        // Разрешенные поля для сортировки
        $allowedSortFields = ['name', 'created_at', 'updated_at', 'status', 'template'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // Пагинация
        $perPage = min($request->get('per_page', 15), 100);
        $sites = $query->paginate($perPage);

        // Получаем организации для фильтра
        $organizations = Organization::select('id', 'name')
            ->orderBy('name')
            ->get();

        // Получаем доступные шаблоны
        $templates = \App\Models\SiteTemplate::select('slug', 'name')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('sites/SiteManagementPage', [
            'sites' => $sites,
            'organizations' => $organizations,
            'templates' => $templates,
            'filters' => $request->only(['search', 'status', 'template', 'organization_id', 'sort_by', 'sort_direction', 'per_page']),
        ]);
    }

    public function show(OrganizationSite $site)
    {
        $site->load(['organization', 'pages', 'widgets.widget', 'widgets.position']);

        return Inertia::render('sites/SiteShowPage', [
            'site' => $site,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'organization_id' => 'required|exists:organizations,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:organization_sites,slug',
            'description' => 'nullable|string|max:1000',
            'template' => 'required|string|exists:site_templates,slug',
        ]);

        $template = \App\Models\SiteTemplate::where('slug', $request->template)->first();

        $site = OrganizationSite::create([
            'organization_id' => $request->organization_id,
            'name' => $request->name,
            'slug' => $request->slug,
            'description' => $request->description,
            'template' => $request->template,
            'layout_config' => $template->layout_config ?? [],
            'theme_config' => $template->theme_config ?? [],
            'content_blocks' => [],
            'navigation_config' => [],
            'seo_config' => [
                'title' => $request->name,
                'description' => $request->description,
                'keywords' => [],
            ],
            'status' => 'draft',
            'is_public' => false,
            'is_maintenance_mode' => false,
        ]);

        return redirect()->back()->with('success', 'Сайт успешно создан');
    }

    public function update(Request $request, OrganizationSite $site)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:organization_sites,slug,' . $site->id,
            'description' => 'nullable|string|max:1000',
            'template' => 'required|string|exists:site_templates,slug',
            'status' => 'required|string|in:draft,published,archived',
            'is_public' => 'boolean',
            'is_maintenance_mode' => 'boolean',
        ]);

        $site->update($request->all());

        return redirect()->back()->with('success', 'Сайт успешно обновлен');
    }

    public function destroy(OrganizationSite $site)
    {
        $site->delete();
        return redirect()->back()->with('success', 'Сайт успешно удален');
    }
}
