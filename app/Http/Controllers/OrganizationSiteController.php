<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\OrganizationSite;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationSiteController extends Controller
{
  /**
   * Список сайтов организации
   */
  public function index(Organization $organization)
  {
    $sites = $organization->sites()
      ->withCount('pages')
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return Inertia::render('organization/admin/sites/Index', [
      'organization' => $organization,
      'sites' => $sites,
    ]);
  }

  /**
   * Форма создания сайта
   */
  public function create(Organization $organization)
  {
    $templates = \App\Models\SiteTemplate::where('is_active', true)
      ->orderBy('sort_order')
      ->get();

    return Inertia::render('organization/admin/sites/Create', [
      'organization' => $organization,
      'templates' => $templates,
    ]);
  }

  /**
   * Сохранение нового сайта
   */
  public function store(Request $request, Organization $organization)
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:organization_sites,slug',
      'description' => 'nullable|string|max:1000',
      'template' => 'required|string|exists:site_templates,slug',
    ]);

    $template = \App\Models\SiteTemplate::where('slug', $request->template)->first();

    $site = $organization->sites()->create([
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

    // Создаем автоматические страницы
    $this->createAutoPages($site);

    return redirect()
      ->route('organization.admin.sites.builder', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Сайт успешно создан!');
  }

  /**
   * Форма редактирования сайта
   */
  public function edit(Organization $organization, OrganizationSite $site)
  {
    $templates = \App\Models\SiteTemplate::where('is_active', true)
      ->orderBy('sort_order')
      ->get();

    $site->load(['pages', 'widgets']);

    return Inertia::render('organization/admin/sites/Edit', [
      'organization' => $organization,
      'site' => $site,
      'templates' => $templates,
    ]);
  }

  /**
   * Обновление сайта
   */
  public function update(Request $request, Organization $organization, OrganizationSite $site)
  {
    $request->validate([
      'name' => 'required|string|max:255',
      'slug' => 'required|string|max:255|unique:organization_sites,slug,' . $site->id,
      'description' => 'nullable|string|max:1000',
      'template' => 'required|string|exists:site_templates,slug',
      'is_public' => 'boolean',
      'is_maintenance_mode' => 'boolean',
    ]);

    $site->update([
      'name' => $request->name,
      'slug' => $request->slug,
      'description' => $request->description,
      'template' => $request->template,
      'is_public' => $request->boolean('is_public'),
      'is_maintenance_mode' => $request->boolean('is_maintenance_mode'),
    ]);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Сайт успешно обновлен!');
  }

  /**
   * Удаление сайта
   */
  public function destroy(Organization $organization, OrganizationSite $site)
  {
    $site->delete();

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Сайт успешно удален!');
  }

  /**
   * Открытие конструктора сайта
   */
  public function editWithBuilder(Organization $organization, OrganizationSite $site)
  {
    $site->load(['pages', 'widgets.widget', 'widgets.position']);

    return Inertia::render('organization/admin/sites/EditWithBuilder', [
      'organization' => $organization,
      'site' => $site,
    ]);
  }

  /**
   * Публикация сайта
   */
  public function publish(Organization $organization, OrganizationSite $site)
  {
    $site->update(['status' => 'published']);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Сайт успешно опубликован!');
  }

  /**
   * Снятие с публикации
   */
  public function unpublish(Organization $organization, OrganizationSite $site)
  {
    $site->update(['status' => 'draft']);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Сайт снят с публикации!');
  }

  /**
   * Архивирование сайта
   */
  public function archive(Organization $organization, OrganizationSite $site)
  {
    $site->update(['status' => 'archived']);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Сайт перемещен в архив!');
  }

  /**
   * Включение режима технических работ
   */
  public function enableMaintenanceMode(Organization $organization, OrganizationSite $site)
  {
    $site->update(['is_maintenance_mode' => true]);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Режим технических работ включен!');
  }

  /**
   * Отключение режима технических работ
   */
  public function disableMaintenanceMode(Organization $organization, OrganizationSite $site)
  {
    $site->update(['is_maintenance_mode' => false]);

    return redirect()
      ->route('organization.admin.sites.index', ['organization' => $organization])
      ->with('success', 'Режим технических работ отключен!');
  }

  /**
   * Создание страницы для сайта
   */
  public function storePage(Request $request, Organization $organization, OrganizationSite $site)
  {
    $request->validate([
      'title' => 'required|string|max:255',
      'slug' => 'required|string|max:255',
      'content' => 'nullable|string',
      'is_published' => 'boolean',
    ]);

    $site->pages()->create([
      'title' => $request->title,
      'slug' => $request->slug,
      'content' => $request->content,
      'is_published' => $request->boolean('is_published'),
    ]);

    return redirect()
      ->route('organization.admin.sites.edit', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Страница успешно создана!');
  }

  /**
   * Обновление страницы сайта
   */
  public function updatePage(Request $request, Organization $organization, OrganizationSite $site, $pageId)
  {
    $request->validate([
      'title' => 'required|string|max:255',
      'slug' => 'required|string|max:255',
      'content' => 'nullable|string',
      'is_published' => 'boolean',
    ]);

    $page = $site->pages()->findOrFail($pageId);
    $page->update([
      'title' => $request->title,
      'slug' => $request->slug,
      'content' => $request->content,
      'is_published' => $request->boolean('is_published'),
    ]);

    return redirect()
      ->route('organization.admin.sites.edit', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Страница успешно обновлена!');
  }

  /**
   * Удаление страницы сайта
   */
  public function destroyPage(Organization $organization, OrganizationSite $site, $pageId)
  {
    $page = $site->pages()->findOrFail($pageId);
    $page->delete();

    return redirect()
      ->route('organization.admin.sites.edit', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Страница успешно удалена!');
  }

  /**
   * Публикация страницы
   */
  public function publishPage(Organization $organization, OrganizationSite $site, $pageId)
  {
    $page = $site->pages()->findOrFail($pageId);
    $page->update(['is_published' => true]);

    return redirect()
      ->route('organization.admin.sites.edit', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Страница опубликована!');
  }

  /**
   * Снятие страницы с публикации
   */
  public function unpublishPage(Organization $organization, OrganizationSite $site, $pageId)
  {
    $page = $site->pages()->findOrFail($pageId);
    $page->update(['is_published' => false]);

    return redirect()
      ->route('organization.admin.sites.edit', [
        'organization' => $organization,
        'site' => $site,
      ])
      ->with('success', 'Страница снята с публикации!');
  }

  /**
   * Создание автоматических страниц для сайта
   */
  private function createAutoPages(OrganizationSite $site)
  {
    $autoPages = [
      [
        'title' => 'Спасибо',
        'slug' => 'thanks',
        'content' => '<h1>Спасибо за ваше пожертвование!</h1><p>Мы очень ценим вашу поддержку.</p>',
        'is_published' => true,
      ],
      [
        'title' => 'Контакты',
        'slug' => 'contacts',
        'content' => '<h1>Контакты</h1><p>Свяжитесь с нами любым удобным способом.</p>',
        'is_published' => true,
      ],
      [
        'title' => 'О нас',
        'slug' => 'about',
        'content' => '<h1>О нас</h1><p>Узнайте больше о нашей организации.</p>',
        'is_published' => true,
      ],
      [
        'title' => 'Проекты',
        'slug' => 'projects',
        'content' => '<h1>Наши проекты</h1><p>Познакомьтесь с нашими проектами.</p>',
        'is_published' => true,
      ],
    ];

    foreach ($autoPages as $pageData) {
      $site->pages()->create($pageData);
    }
  }
}
