<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationSite;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteConstructorController extends Controller
{
    /**
     * Показать конструктор сайта
     */
    public function builder(Organization $organization, OrganizationSite $site)
    {
        // Проверяем права доступа
        if (!$this->canAccessSite($organization, $site)) {
            abort(403, 'У вас нет прав для редактирования этого сайта');
        }

        $site->load(['pages', 'menus', 'media', 'sliders']);

        return Inertia::render('organizations/SiteConstructor', [
            'organization' => $organization->only(['id', 'name', 'slug']),
            'site' => $site,
            'templates' => $this->getAvailableTemplates(),
            'widgets' => $this->getAvailableWidgets(),
            'colorSchemes' => $this->getColorSchemes(),
        ]);
    }

    /**
     * Сохранить изменения сайта
     */
    public function save(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'layout_config' => 'nullable|array',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'template' => 'nullable|string|in:default,modern,classic',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $site->update($request->only(['title', 'layout_config', 'custom_css', 'custom_js', 'template']));

            return response()->json([
                'message' => 'Изменения сохранены',
                'site' => $site->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка сохранения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Добавить виджет на сайт
     */
    public function addWidget(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'widget_type' => 'required|string',
            'position' => 'required|string',
            'settings' => 'nullable|array',
            'sort_order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $layoutConfig = $site->layout_config ?? [];
            $widgets = $layoutConfig['widgets'] ?? [];

            $widget = [
                'id' => uniqid(),
                'type' => $request->widget_type,
                'position' => $request->position,
                'settings' => $request->settings ?? [],
                'sort_order' => $request->sort_order ?? count($widgets),
                'created_at' => now()->toISOString(),
            ];

            $widgets[] = $widget;
            $layoutConfig['widgets'] = $widgets;

            $site->update(['layout_config' => $layoutConfig]);

            return response()->json([
                'message' => 'Виджет добавлен',
                'widget' => $widget,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка добавления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновить виджет
     */
    public function updateWidget(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|string',
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $layoutConfig = $site->layout_config ?? [];
            $widgets = $layoutConfig['widgets'] ?? [];

            foreach ($widgets as &$widget) {
                if ($widget['id'] === $request->widget_id) {
                    $widget['settings'] = $request->settings;
                    $widget['updated_at'] = now()->toISOString();
                    break;
                }
            }

            $layoutConfig['widgets'] = $widgets;
            $site->update(['layout_config' => $layoutConfig]);

            return response()->json([
                'message' => 'Виджет обновлен',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка обновления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить виджет
     */
    public function removeWidget(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $layoutConfig = $site->layout_config ?? [];
            $widgets = $layoutConfig['widgets'] ?? [];

            $widgets = array_filter($widgets, function ($widget) use ($request) {
                return $widget['id'] !== $request->widget_id;
            });

            $layoutConfig['widgets'] = array_values($widgets);
            $site->update(['layout_config' => $layoutConfig]);

            return response()->json([
                'message' => 'Виджет удален',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка удаления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Переупорядочить виджеты
     */
    public function reorderWidgets(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'widgets' => 'required|array',
            'widgets.*.id' => 'required|string',
            'widgets.*.sort_order' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $layoutConfig = $site->layout_config ?? [];
            $widgets = $layoutConfig['widgets'] ?? [];

            foreach ($request->widgets as $widgetData) {
                foreach ($widgets as &$widget) {
                    if ($widget['id'] === $widgetData['id']) {
                        $widget['sort_order'] = $widgetData['sort_order'];
                        break;
                    }
                }
            }

            // Сортируем по sort_order
            usort($widgets, function ($a, $b) {
                return $a['sort_order'] <=> $b['sort_order'];
            });

            $layoutConfig['widgets'] = $widgets;
            $site->update(['layout_config' => $layoutConfig]);

            return response()->json([
                'message' => 'Порядок виджетов обновлен',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка изменения порядка: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Применить цветовую схему
     */
    public function applyColorScheme(Request $request, Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        $validator = Validator::make($request->all(), [
            'color_scheme' => 'required|array',
            'color_scheme.primary' => 'required|string',
            'color_scheme.secondary' => 'required|string',
            'color_scheme.accent' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $layoutConfig = $site->layout_config ?? [];
            $layoutConfig['color_scheme'] = $request->color_scheme;

            $site->update(['layout_config' => $layoutConfig]);

            return response()->json([
                'message' => 'Цветовая схема применена',
                'color_scheme' => $request->color_scheme,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка применения цветовой схемы: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Предварительный просмотр сайта
     */
    public function preview(Organization $organization, OrganizationSite $site)
    {
        if (!$this->canAccessSite($organization, $site)) {
            abort(403, 'У вас нет прав для просмотра этого сайта');
        }

        return Inertia::render('organizations/SitePreview', [
            'organization' => $organization,
            'site' => $site->load(['pages', 'menus', 'media', 'sliders']),
            'preview' => true,
        ]);
    }

    /**
     * Опубликовать сайт
     */
    public function publish(Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        try {
            $site->update(['is_published' => true]);

            return response()->json([
                'message' => 'Сайт опубликован',
                'site_url' => $this->getSiteUrl($organization, $site),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка публикации: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Снять сайт с публикации
     */
    public function unpublish(Organization $organization, OrganizationSite $site): JsonResponse
    {
        if (!$this->canAccessSite($organization, $site)) {
            return response()->json(['message' => 'Нет прав доступа'], 403);
        }

        try {
            $site->update(['is_published' => false]);

            return response()->json([
                'message' => 'Сайт снят с публикации',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка снятия с публикации: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Проверить права доступа к сайту
     */
    private function canAccessSite(Organization $organization, OrganizationSite $site): bool
    {
        // Проверяем, что сайт принадлежит организации
        if ($site->organization_id !== $organization->id) {
            return false;
        }

        // Здесь можно добавить дополнительные проверки прав доступа
        // Например, проверка роли пользователя в организации

        return true;
    }

    /**
     * Получить доступные шаблоны
     */
    private function getAvailableTemplates(): array
    {
        return [
            'default' => [
                'name' => 'Стандартный',
                'description' => 'Классический макет с баннером и статистикой',
                'preview' => '/images/templates/default.jpg',
                'features' => ['hero_banner', 'stats', 'projects', 'news'],
            ],
            'modern' => [
                'name' => 'Современный',
                'description' => 'Современный дизайн с акцентом на визуал',
                'preview' => '/images/templates/modern.jpg',
                'features' => ['hero_video', 'testimonials', 'gallery', 'contact_form'],
            ],
            'classic' => [
                'name' => 'Классический',
                'description' => 'Традиционный макет с четкой структурой',
                'preview' => '/images/templates/classic.jpg',
                'features' => ['header_image', 'content_blocks', 'sidebar', 'footer'],
            ],
        ];
    }

    /**
     * Получить доступные виджеты
     */
    private function getAvailableWidgets(): array
    {
        return [
            'hero_banner' => [
                'name' => 'Главный баннер',
                'description' => 'Большой заголовочный блок с изображением',
                'icon' => 'image',
                'category' => 'layout',
                'settings' => [
                    'title' => 'string',
                    'subtitle' => 'string',
                    'background_image' => 'image',
                    'button_text' => 'string',
                    'button_url' => 'url',
                ],
            ],
            'stats' => [
                'name' => 'Статистика',
                'description' => 'Блок с ключевыми показателями',
                'icon' => 'bar-chart',
                'category' => 'content',
                'settings' => [
                    'show_donations' => 'boolean',
                    'show_members' => 'boolean',
                    'show_projects' => 'boolean',
                ],
            ],
            'projects' => [
                'name' => 'Проекты',
                'description' => 'Список активных проектов',
                'icon' => 'folder',
                'category' => 'content',
                'settings' => [
                    'limit' => 'number',
                    'show_progress' => 'boolean',
                    'layout' => 'select:grid,list',
                ],
            ],
            'news' => [
                'name' => 'Новости',
                'description' => 'Последние новости организации',
                'icon' => 'newspaper',
                'category' => 'content',
                'settings' => [
                    'limit' => 'number',
                    'show_excerpt' => 'boolean',
                ],
            ],
            'gallery' => [
                'name' => 'Галерея',
                'description' => 'Галерея изображений',
                'icon' => 'images',
                'category' => 'media',
                'settings' => [
                    'layout' => 'select:grid,masonry,carousel',
                    'show_captions' => 'boolean',
                    'autoplay' => 'boolean',
                ],
            ],
            'contact_form' => [
                'name' => 'Форма обратной связи',
                'description' => 'Форма для связи с организацией',
                'icon' => 'mail',
                'category' => 'forms',
                'settings' => [
                    'fields' => 'array',
                    'submit_text' => 'string',
                ],
            ],
        ];
    }

    /**
     * Получить цветовые схемы
     */
    private function getColorSchemes(): array
    {
        return [
            'blue' => [
                'name' => 'Синяя',
                'primary' => '#3B82F6',
                'secondary' => '#6B7280',
                'accent' => '#10B981',
            ],
            'green' => [
                'name' => 'Зеленая',
                'primary' => '#10B981',
                'secondary' => '#6B7280',
                'accent' => '#3B82F6',
            ],
            'purple' => [
                'name' => 'Фиолетовая',
                'primary' => '#8B5CF6',
                'secondary' => '#6B7280',
                'accent' => '#F59E0B',
            ],
            'red' => [
                'name' => 'Красная',
                'primary' => '#EF4444',
                'secondary' => '#6B7280',
                'accent' => '#10B981',
            ],
        ];
    }

    /**
     * Получить URL сайта
     */
    private function getSiteUrl(Organization $organization, OrganizationSite $site): string
    {
        if ($site->domain) {
            return 'https://' . $site->domain;
        }

        return route('organization.site', [
            'organization' => $organization->slug,
            'site' => $site->slug
        ]);
    }
}
