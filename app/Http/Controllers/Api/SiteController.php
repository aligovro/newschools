<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OrganizationSite;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Services\WidgetService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SiteController extends Controller
{
    private WidgetService $widgetService;

    public function __construct(WidgetService $widgetService)
    {
        $this->widgetService = $widgetService;
    }
    // Основные настройки сайта
    public function saveBasicSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        try {
            $site = $this->getSite($id);

            $site->update([
                'name' => $request->name,
                'description' => $request->description,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Основные настройки сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Настройки дизайна
    public function saveDesignSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'color_scheme' => 'nullable|string|in:blue,green,red,purple,orange',
            'font_family' => 'nullable|string|in:inter,roboto,open-sans,lato',
            'font_size' => 'nullable|string|in:small,medium,large',
            'layout' => 'nullable|string|in:wide,boxed,full-width',
            'header_style' => 'nullable|string|in:minimal,classic,modern',
            'footer_style' => 'nullable|string|in:minimal,classic,modern',
        ]);

        try {
            $site = $this->getSite($id);

            $themeConfig = $site->theme_config ?? [];
            $themeConfig = array_merge($themeConfig, $request->only([
                'color_scheme',
                'font_family',
                'font_size',
                'layout',
                'header_style',
                'footer_style'
            ]));

            $site->update(['theme_config' => $themeConfig]);

            return response()->json([
                'success' => true,
                'message' => 'Настройки дизайна сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // SEO настройки
    public function saveSeoSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'seo_title' => 'nullable|string|max:60',
            'seo_description' => 'nullable|string|max:160',
            'seo_keywords' => 'nullable|string|max:255',
        ]);

        try {
            $site = $this->getSite($id);

            $seoConfig = $site->seo_config ?? [];
            $seoConfig = array_merge($seoConfig, $request->only([
                'seo_title',
                'seo_description',
                'seo_keywords'
            ]));

            $site->update(['seo_config' => $seoConfig]);

            return response()->json([
                'success' => true,
                'message' => 'SEO настройки сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Добавление виджета
    public function addWidget(Request $request, $site): JsonResponse
    {
        $request->validate([
            'widget_slug' => 'required|string|exists:widgets,slug',
            'position_slug' => 'required|string|exists:widget_positions,slug',
            'config' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        try {
            $site = $this->getSite($site);
            $widget = Widget::where('slug', $request->widget_slug)->firstOrFail();
            $position = WidgetPosition::where('slug', $request->position_slug)->firstOrFail();

            // Валидируем конфигурацию виджета
            $validationErrors = $this->widgetService->validateWidgetConfig(
                $request->config ?? [],
                $request->widget_slug
            );

            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибки валидации конфигурации',
                    'errors' => $validationErrors,
                ], 422);
            }

            // Обрабатываем изображения в конфигурации
            $processedConfig = $this->widgetService->processWidgetImages(
                $request->config ?? [],
                $request->widget_slug
            );

            // Получаем текущие виджеты
            $widgets = $site->widgets_config ?? [];

            // Создаем новый виджет
            $newWidget = [
                'id' => time() . rand(1000, 9999), // Временный ID
                'widget_id' => $widget->id,
                'name' => $widget->name,
                'slug' => $widget->slug,
                'position_name' => $position->name,
                'position_slug' => $position->slug,
                'order' => count(array_filter($widgets, fn($w) => $w['position_slug'] === $position->slug)) + 1,
                'config' => $processedConfig,
                'settings' => $request->settings ?? [],
                'is_active' => true,
                'is_visible' => true,
                'created_at' => now()->toISOString(),
            ];

            $widgets[] = $newWidget;
            $site->update(['widgets_config' => $widgets]);

            return response()->json([
                'success' => true,
                'widget' => $newWidget,
                'message' => 'Виджет успешно добавлен',
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding widget', [
                'site_id' => $site,
                'widget_slug' => $request->widget_slug,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при добавлении виджета: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Обновление виджета
    public function updateWidget(Request $request, $site, $widgetId): JsonResponse
    {
        $request->validate([
            'config' => 'nullable|array',
            'settings' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
        ]);

        try {
            $site = $this->getSite($site);
            $widgets = $site->widgets_config ?? [];

            $widgetIndex = array_search($widgetId, array_column($widgets, 'id'));
            if ($widgetIndex === false) {
                return response()->json([
                    'success' => false,
                    'message' => 'Виджет не найден',
                ], 404);
            }

            $widget = $widgets[$widgetIndex];
            $oldConfig = $widget['config'] ?? [];

            // Валидируем конфигурацию виджета
            if ($request->has('config')) {
                $validationErrors = $this->widgetService->validateWidgetConfig(
                    $request->config,
                    $widget['slug']
                );

                if (!empty($validationErrors)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Ошибки валидации конфигурации',
                        'errors' => $validationErrors,
                    ], 422);
                }

                // Обрабатываем изображения в конфигурации
                $processedConfig = $this->widgetService->processWidgetImages(
                    $request->config,
                    $widget['slug']
                );

                // Очищаем старые изображения
                $this->widgetService->cleanupOldImages($oldConfig, $processedConfig, $widget['slug']);

                $request->merge(['config' => $processedConfig]);
            }

            // Обновляем виджет
            $updateData = [];
            if ($request->has('config')) {
                $updateData['config'] = $request->config;
            }
            if ($request->has('settings')) {
                $updateData['settings'] = $request->settings;
            }
            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }
            if ($request->has('is_visible')) {
                $updateData['is_visible'] = $request->is_visible;
            }

            $widgets[$widgetIndex] = array_merge($widgets[$widgetIndex], $updateData);
            $widgets[$widgetIndex]['updated_at'] = now()->toISOString();

            $site->update(['widgets_config' => $widgets]);

            return response()->json([
                'success' => true,
                'widget' => $widgets[$widgetIndex],
                'message' => 'Виджет успешно обновлен',
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating widget', [
                'site_id' => $site,
                'widget_id' => $widgetId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении виджета: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Удаление виджета
    public function deleteWidget(Request $request, $site, $widgetId)
    {
        try {
            $site = $this->getSite($site);
            $widgets = $site->widgets_config ?? [];

            $widgets = array_filter($widgets, fn($w) => $w['id'] != $widgetId);
            $site->update(['widgets_config' => array_values($widgets)]);

            return back();
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при удалении виджета: ' . $e->getMessage()]);
        }
    }

    // Перемещение виджета
    public function moveWidget(Request $request, $site, $widgetId)
    {
        $request->validate([
            'position_slug' => 'required|string|exists:widget_positions,slug',
            'order' => 'required|integer|min:1',
        ]);

        try {
            $site = $this->getSite($site);
            $widgets = $site->widgets_config ?? [];

            $widgetIndex = array_search($widgetId, array_column($widgets, 'id'));
            if ($widgetIndex === false) {
                return back()->withErrors(['error' => 'Виджет не найден']);
            }

            $position = WidgetPosition::where('slug', $request->position_slug)->firstOrFail();

            // Обновляем позицию и порядок
            $widgets[$widgetIndex]['position_slug'] = $position->slug;
            $widgets[$widgetIndex]['position_name'] = $position->name;
            $widgets[$widgetIndex]['order'] = $request->order;
            $widgets[$widgetIndex]['updated_at'] = now()->toISOString();

            $site->update(['widgets_config' => $widgets]);

            return back()->with('widget', $widgets[$widgetIndex]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при перемещении виджета: ' . $e->getMessage()]);
        }
    }

    // Превью сайта
    public function preview($id): JsonResponse
    {
        try {
            $site = $this->getSite($id);
            $previewUrl = route('sites.preview', ['slug' => $site->slug]);

            return response()->json([
                'success' => true,
                'data' => ['preview_url' => $previewUrl],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении превью: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Получение конфигурации сайта
    public function getConfig($site)
    {
        try {
            $site = $this->getSite($site);

            return back()->with('data', $site->widgets_config ?? []);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Ошибка при получении конфигурации: ' . $e->getMessage()]);
        }
    }

    // Создание дефолтных виджетов при создании сайта
    public function createDefaultWidgets($siteId): void
    {
        $site = OrganizationSite::findOrFail($siteId);
        $positions = WidgetPosition::where('template_id', $site->template_id)->get();

        $defaultWidgets = [];

        foreach ($positions as $position) {
            $widget = $this->getDefaultWidgetForPosition($position->slug);
            if ($widget) {
                $defaultWidgets[] = [
                    'id' => time() . rand(1000, 9999),
                    'widget_id' => $widget->id,
                    'name' => $widget->name,
                    'slug' => $widget->slug,
                    'position_name' => $position->name,
                    'position_slug' => $position->slug,
                    'order' => 1,
                    'config' => $this->getDefaultConfigForWidget($widget->slug),
                    'settings' => [],
                    'is_active' => true,
                    'is_visible' => true,
                    'created_at' => now()->toISOString(),
                ];
            }
        }

        $site->update(['widgets_config' => $defaultWidgets]);
    }

    // Получение дефолтного виджета для позиции
    private function getDefaultWidgetForPosition(string $positionSlug): ?Widget
    {
        $defaultWidgets = [
            'header' => 'header-menu',
            'hero' => 'hero-slider',
            'footer' => 'footer-contacts',
        ];

        $widgetSlug = $defaultWidgets[$positionSlug] ?? null;
        return $widgetSlug ? Widget::where('slug', $widgetSlug)->first() : null;
    }

    // Получение дефолтной конфигурации для виджета
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

    // Получение сайта с проверкой прав
    private function getSite($id): OrganizationSite
    {
        $user = Auth::user();

        if (!$user) {
            throw new \Exception('Пользователь не авторизован');
        }

        // Проверяем, является ли пользователь супер-админом
        // Используем методы из трейта HasRoles (Spatie Permission)
        $isSuperAdmin = method_exists($user, 'hasRole') ? $user->hasRole('super_admin') : false;

        if ($isSuperAdmin) {
            // Супер-админ может работать с любыми сайтами
            return OrganizationSite::findOrFail($id);
        }

        // Обычные пользователи могут работать только с сайтами своей организации
        if (!$user->organization_id) {
            throw new \Exception('Пользователь не привязан к организации');
        }

        return OrganizationSite::where('id', $id)
            ->where('organization_id', $user->organization_id)
            ->firstOrFail();
    }
}
