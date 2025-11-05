<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Models\Site;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Http\Resources\SiteWidgetResource;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationSiteResource;
use App\Support\InertiaResource;

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
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'sites' => InertiaResource::paginate($sites, OrganizationSiteResource::class),
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

        // Для создания сайта используем тот же конструктор, передавая пустой site и список шаблонов
        return Inertia::render('organization/admin/sites/organization-site-builder/OrganizationSiteBuilder', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'site' => [
                'id' => null,
                'name' => '',
                'slug' => '',
                'description' => '',
                'status' => 'draft',
                'created_at' => null,
                'updated_at' => null,
                'widgets' => [],
                'template' => '',
                'layout_config' => new \stdClass(),
                'seo_config' => new \stdClass(),
            ],
            'templates' => $templates,
            'mode' => 'create',
        ]);
    }

    /**
     * Сохранение нового сайта
     */
    public function store(Request $request, Organization $organization)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:organization_sites,slug',
            'description' => 'nullable|string|max:1000',
            'template' => 'required|string|exists:site_templates,slug',
        ]);

        $template = \App\Models\SiteTemplate::where('slug', $request->template)->first();

        // Получаем или создаем домен по умолчанию для организации
        $domain = $this->getOrCreateDefaultDomain($organization);

        $site = $organization->sites()->create([
            'domain_id' => $domain->id,
            'name' => $request->name,
            'slug' => $request->slug, // Если пустой, трейт HasSlug автоматически сгенерирует
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

        // Создаем дефолтные виджеты
        $this->createDefaultWidgets($site);

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
    public function edit(Organization $organization, Site $site)
    {
        $templates = \App\Models\SiteTemplate::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $site->load(['pages', 'widgets']);

        return Inertia::render('organization/admin/sites/Edit', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'site' => (new OrganizationSiteResource($site->load('pages')))->toArray(request()),
            'templates' => $templates,
        ]);
    }

    /**
     * Обновление сайта
     */
    public function update(Request $request, Organization $organization, Site $site)
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
    public function destroy(Organization $organization, Site $site)
    {
        $site->delete();

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Сайт успешно удален!');
    }

    /**
     * Открытие конструктора сайта
     */
    public function editWithBuilder(Organization $organization, Site $site)
    {
        $site->load(['pages']);

        // Загружаем виджеты с нормализованными данными
        $site->load([
            'widgets.configs',
            'widgets.heroSlides',
            'widgets.sliderSlides',
            'widgets.formFields',
            'widgets.menuItems',
            'widgets.galleryImages',
            'widgets.donationSettings',
            'widgets.regionRatingSettings',
            'widgets.donationsListSettings',
            'widgets.referralLeaderboardSettings',
            'widgets.imageSettings',
            'widgets.widget',
            'widgets.position'
        ]);


        // Преобразуем виджеты для фронтенда используя ресурс
        $widgets = SiteWidgetResource::collection($site->widgets)->toArray(request());

        // Логируем данные виджетов для отладки
        Log::info('OrganizationSiteController::editWithBuilder - Widgets data:', [
            'site_id' => $site->id,
            'widgets_count' => count($widgets),
            'widgets_data' => array_map(function ($widget) {
                return [
                    'id' => $widget['id'],
                    'widget_slug' => $widget['widget_slug'],
                    'name' => $widget['name'],
                    'has_hero_slides' => isset($widget['hero_slides']),
                    'has_slider_slides' => isset($widget['slider_slides']),
                    'hero_slides_count' => isset($widget['hero_slides']) ? count($widget['hero_slides']) : 0,
                    'slider_slides_count' => isset($widget['slider_slides']) ? count($widget['slider_slides']) : 0,
                ];
            }, $widgets),
        ]);

        // Исправляем hero_slides и slider_slides для правильного отображения картинок
        foreach ($widgets as &$widget) {
            // Обрабатываем hero_slides
            if (isset($widget['hero_slides']) && is_array($widget['hero_slides'])) {
                foreach ($widget['hero_slides'] as &$slide) {
                    // Если есть background_image, но нет backgroundImage, создаем backgroundImage
                    if (isset($slide['background_image']) && !isset($slide['backgroundImage'])) {
                        $slide['backgroundImage'] = $slide['background_image'] ?: '';
                    }
                    // Убираем background_image, оставляем только backgroundImage
                    unset($slide['background_image']);
                }
            }

            // Обрабатываем slider_slides
            if (isset($widget['slider_slides']) && is_array($widget['slider_slides'])) {
                foreach ($widget['slider_slides'] as &$slide) {
                    // Если есть background_image, но нет backgroundImage, создаем backgroundImage
                    if (isset($slide['background_image']) && !isset($slide['backgroundImage'])) {
                        $slide['backgroundImage'] = $slide['background_image'] ?: '';
                    }
                    // Убираем background_image, оставляем только backgroundImage
                    unset($slide['background_image']);
                }
            }
        }

        return Inertia::render('organization/admin/sites/organization-site-builder/OrganizationSiteBuilder', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'description' => $site->description,
                'favicon' => $site->getFaviconUrlAttribute(),
                'template' => $site->template,
                'status' => $site->status,
                'is_public' => (bool) $site->is_public,
                'is_maintenance_mode' => (bool) $site->is_maintenance_mode,
                'layout_config' => $site->layout_config ?? [],
                'theme_config' => $site->theme_config ?? [],
                'seo_config' => $site->seo_config ?? [],
                'payment_settings' => $site->payment_settings ?? [],
                'custom_settings' => $site->custom_settings ?? [],
                'created_at' => $site->created_at,
                'updated_at' => $site->updated_at,
                'widgets' => $widgets,
            ],
        ]);
    }

    /**
     * Публикация сайта
     */
    public function publish(Organization $organization, Site $site)
    {
        $site->update(['status' => 'published']);

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Сайт успешно опубликован!');
    }

    /**
     * Снятие с публикации
     */
    public function unpublish(Organization $organization, Site $site)
    {
        $site->update(['status' => 'draft']);

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Сайт снят с публикации!');
    }

    /**
     * Архивирование сайта
     */
    public function archive(Organization $organization, Site $site)
    {
        $site->update(['status' => 'archived']);

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Сайт перемещен в архив!');
    }

    /**
     * Включение режима технических работ
     */
    public function enableMaintenanceMode(Organization $organization, Site $site)
    {
        $site->update(['is_maintenance_mode' => true]);

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Режим технических работ включен!');
    }

    /**
     * Отключение режима технических работ
     */
    public function disableMaintenanceMode(Organization $organization, Site $site)
    {
        $site->update(['is_maintenance_mode' => false]);

        return redirect()
            ->route('organization.admin.sites.index', ['organization' => $organization])
            ->with('success', 'Режим технических работ отключен!');
    }

    /**
     * Создание страницы для сайта
     */
    public function storePage(Request $request, Organization $organization, Site $site)
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
    public function updatePage(Request $request, Organization $organization, Site $site, $pageId)
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
    public function destroyPage(Organization $organization, Site $site, $pageId)
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
    public function publishPage(Organization $organization, Site $site, $pageId)
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
    public function unpublishPage(Organization $organization, Site $site, $pageId)
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
    private function createAutoPages(Site $site)
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

    /**
     * Создание дефолтных виджетов для сайта
     */
    private function createDefaultWidgets(Site $site)
    {
        $template = \App\Models\SiteTemplate::where('slug', $site->template)->first();
        if (!$template) {
            return;
        }

        $positions = \App\Models\WidgetPosition::where('template_id', $template->id)->get();
        $defaultWidgets = [];

        foreach ($positions as $position) {
            $widget = $this->getDefaultWidgetForPosition($position->slug);
            if ($widget) {
                $defaultWidgets[] = [
                    'id' => time() . rand(1000, 9999),
                    'widget_id' => $widget->id,
                    'name' => $widget->name,
                    'widget_slug' => $widget->widget_slug,
                    'position_name' => $position->name,
                    'position_slug' => $position->slug,
                    'order' => 1,
                    'config' => $this->getDefaultConfigForWidget($widget->widget_slug),
                    'settings' => [],
                    'is_active' => true,
                    'is_visible' => true,
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        // Создаем дефолтные виджеты в нормализованных таблицах
        $this->createDefaultWidgetsInTables($site, $defaultWidgets);
    }

    /**
     * Создать дефолтные виджеты в нормализованных таблицах
     */
    private function createDefaultWidgetsInTables(Site $site, array $defaultWidgets): void
    {
        $widgetDataService = app(\App\Services\WidgetDataService::class);

        foreach ($defaultWidgets as $widgetData) {
            // Находим widget и position
            $widget = \App\Models\Widget::where('widget_slug', $widgetData['widget_slug'])->first();
            $position = \App\Models\WidgetPosition::where('slug', $widgetData['position_slug'])->first();

            if (!$widget || !$position) {
                continue;
            }

            // Создаем SiteWidget
            $siteWidget = \App\Models\SiteWidget::create([
                'site_id' => $site->id,
                'widget_id' => $widget->id,
                'position_id' => $position->id,
                'name' => $widgetData['name'],
                'position_name' => $widgetData['position_name'],
                'position_slug' => $widgetData['position_slug'],
                'widget_slug' => $widgetData['slug'],
                'config' => $widgetData['config'] ?? [],
                'settings' => $widgetData['settings'] ?? [],
                'order' => $widgetData['order'] ?? 0,
                'sort_order' => $widgetData['order'] ?? 0,
                'is_active' => $widgetData['is_active'] ?? true,
                'is_visible' => $widgetData['is_visible'] ?? true,
            ]);

            // Мигрируем данные в нормализованные таблицы
            $widgetDataService->migrateWidgetData($siteWidget);
        }
    }

    /**
     * Получить дефолтный виджет для позиции
     */
    private function getDefaultWidgetForPosition(string $positionSlug): ?\App\Models\Widget
    {
        $defaultWidgets = [
            'header' => 'header-menu',
            'hero' => 'hero-slider',
            'footer' => 'footer-contacts',
        ];

        $widgetSlug = $defaultWidgets[$positionSlug] ?? null;
        return $widgetSlug ? \App\Models\Widget::where('widget_slug', $widgetSlug)->first() : null;
    }

    /**
     * Получить дефолтную конфигурацию для виджета
     */
    private function getDefaultConfigForWidget(string $widgetSlug): array
    {
        $defaultConfigs = [
            'header-menu' => [
                'logo' => '',
                'menu_items' => [
                    ['title' => 'Главная', 'url' => '/'],
                    ['title' => 'О нас', 'url' => '/about'],
                    ['title' => 'Контакты', 'url' => '/contacts'],
                ],
            ],
            'hero-slider' => [
                'type' => 'slider',
                'slides' => [
                    [
                        'title' => 'Добро пожаловать',
                        'description' => 'Мы рады приветствовать вас на нашем сайте',
                        'button_text' => 'Узнать больше',
                        'button_url' => '/about',
                        'background_image' => '',
                    ],
                    [
                        'title' => 'Наши услуги',
                        'description' => 'Мы предлагаем широкий спектр качественных услуг',
                        'button_text' => 'Смотреть услуги',
                        'button_url' => '/services',
                        'background_image' => '',
                    ],
                    [
                        'title' => 'Свяжитесь с нами',
                        'description' => 'Мы всегда готовы ответить на ваши вопросы',
                        'button_text' => 'Связаться',
                        'button_url' => '/contacts',
                        'background_image' => '',
                    ],
                ],
                'autoplay' => true,
                'autoplay_delay' => 5000,
            ],
            'footer-contacts' => [
                'phone' => '+7 (XXX) XXX-XX-XX',
                'email' => 'info@example.com',
                'address' => 'Ваш адрес',
                'social_links' => [
                    ['platform' => 'facebook', 'url' => '#'],
                    ['platform' => 'instagram', 'url' => '#'],
                    ['platform' => 'telegram', 'url' => '#'],
                ],
            ],
        ];

        return $defaultConfigs[$widgetSlug] ?? [];
    }

    /**
     * Получить или создать домен по умолчанию для организации
     */
    private function getOrCreateDefaultDomain(Organization $organization): \App\Models\Domain
    {
        // Ищем существующий основной домен
        $domain = $organization->domains()->where('is_primary', true)->first();

        if ($domain) {
            return $domain;
        }

        // Создаем домен по умолчанию
        return $organization->domains()->create([
            'domain' => $organization->slug . '.' . config('app.domain', 'localhost'),
            'is_primary' => true,
            'is_ssl_enabled' => false,
            'status' => 'active',
        ]);
    }
}
