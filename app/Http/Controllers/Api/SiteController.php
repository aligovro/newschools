<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteWidgetResource;
use App\Models\Site;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Services\WidgetService;
use App\Services\SiteSeoService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SiteController extends Controller
{
    private WidgetService $widgetService;
    private SiteSeoService $siteSeoService;

    public function __construct(WidgetService $widgetService, SiteSeoService $siteSeoService)
    {
        $this->widgetService = $widgetService;
        $this->siteSeoService = $siteSeoService;
    }
    // Основные настройки сайта
    public function saveBasicSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'favicon' => 'nullable|string|max:500',
        ]);

        try {
            $site = $this->getSite($id);

            $updateData = [
                'name' => $request->name,
                'description' => $request->description,
            ];

            // Добавляем favicon если он был передан
            if ($request->has('favicon')) {
                $updateData['favicon'] = $request->favicon;
            }

            $site->update($updateData);

            // Автогенерация SEO, если ранее не заполнено — через сервис
            $this->siteSeoService->ensureSeoDefaults($site);

            // Сбрасываем кеш виджетов после изменения настроек
            Cache::forget("site_widgets_config_{$site->id}");

            // Если это главный сайт и была изменена фавиконка, очищаем кеш фавиконки
            if ($request->has('favicon') && $site->site_type === 'main') {
                Cache::forget('main_site_favicon');
            }

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
            'header_style' => 'nullable|string|in:default,classic,modern',
            'footer_style' => 'nullable|string|in:default,classic,modern',
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
            'og_title' => 'nullable|string|max:100',
            'og_description' => 'nullable|string|max:200',
            'og_type' => 'nullable|string|max:50',
            'og_image' => 'nullable|string|max:500',
            'twitter_card' => 'nullable|string|max:50',
            'twitter_title' => 'nullable|string|max:100',
            'twitter_description' => 'nullable|string|max:200',
            'twitter_image' => 'nullable|string|max:500',
        ]);

        try {
            $site = $this->getSite($id);

            $incoming = $request->only([
                'seo_title',
                'seo_description',
                'seo_keywords',
                'og_title',
                'og_description',
                'og_type',
                'og_image',
                'twitter_card',
                'twitter_title',
                'twitter_description',
                'twitter_image',
            ]);

            $seoConfig = $this->siteSeoService->applyDefaultsToIncoming($site, $incoming);

            $site->update(['seo_config' => $seoConfig]);

            return response()->json([
                'success' => true,
                'message' => 'SEO настройки сохранены',
                'data' => $seoConfig,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Layout настройки (позиция сайдбара и др.)
    public function saveLayoutSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'sidebar_position' => 'nullable|in:left,right',
        ]);

        try {
            $site = $this->getSite($id);

            $layout = $site->layout_config ?? [];
            $layout = array_merge($layout, $request->only(['sidebar_position']));

            $site->update(['layout_config' => $layout]);

            return response()->json([
                'success' => true,
                'message' => 'Настройки макета сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Telegram настройки сайта
    public function saveTelegramSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'enabled' => 'nullable|boolean',
            'bot_token' => 'nullable|string|max:255',
            'chat_id' => 'nullable|string|max:255',
            'notifications' => 'nullable|array',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $site = $this->getSite($id);

            $custom = $site->custom_settings ?? [];
            $custom['telegram'] = array_merge($custom['telegram'] ?? [], $request->only([
                'enabled',
                'bot_token',
                'chat_id',
                'notifications',
                'note',
            ]));

            $site->update(['custom_settings' => $custom]);

            return response()->json([
                'success' => true,
                'message' => 'Настройки Telegram сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Платежные настройки сайта
    public function savePaymentSettings(Request $request, $id): JsonResponse
    {
        $request->validate([
            'gateway' => 'nullable|string|in:sbp,yookassa,tinkoff',
            'enabled_gateways' => 'nullable|array',
            'enabled_gateways.*' => 'in:sbp,yookassa,tinkoff',
            'credentials' => 'nullable|array',
            'options' => 'nullable|array',
            'donation_min_amount' => 'nullable|integer|min:0',
            'donation_max_amount' => 'nullable|integer|min:0',
            'currency' => 'nullable|string|size:3',
            'test_mode' => 'nullable|boolean',
        ]);

        try {
            $site = $this->getSite($id);

            // Собираем входящие данные и нормализуем к новому формату
            $incoming = $request->only([
                'gateway',
                'enabled_gateways',
                'credentials',
                'options',
                'donation_min_amount',
                'donation_max_amount',
                'currency',
                'test_mode',
            ]);

            // Если enabled_gateways не передан, но есть одиночный gateway — приводим к массиву
            if (empty($incoming['enabled_gateways']) && !empty($incoming['gateway'])) {
                $incoming['enabled_gateways'] = [$incoming['gateway']];
            }

            // Сохраняем напрямую в колонку payment_settings, не в custom_settings
            $current = is_array($site->payment_settings) ? $site->payment_settings : [];
            $next = array_merge($current, $incoming);
            $site->update(['payment_settings' => $next]);

            return response()->json([
                'success' => true,
                'message' => 'Платежные настройки сохранены',
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
            'widget_slug' => 'required|string|exists:widgets,widget_slug',
            'position_slug' => 'required|string|exists:widget_positions,slug',
            'config' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        try {
            $site = $this->getSite($site);
            $widget = Widget::where('widget_slug', $request->widget_slug)->firstOrFail();
            
            // Проверяем доступность виджета для типа сайта
            if (!$widget->isAvailableForSiteType($site->site_type)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Виджет недоступен для данного типа сайта',
                ], 403);
            }
            
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

            // Создаем новый виджет в нормализованных таблицах
            $order = \App\Models\SiteWidget::where('site_id', $site->id)
                ->where('position_slug', $position->slug)
                ->count() + 1;

            $siteWidget = \App\Models\SiteWidget::create([
                'site_id' => $site->id,
                'widget_id' => $widget->id,
                'position_id' => $position->id,
                'name' => $widget->name,
                'position_name' => $position->name,
                'position_slug' => $position->slug,
                'widget_slug' => $widget->widget_slug,
                'order' => $order,
                'sort_order' => $order,
                'is_active' => true,
                'is_visible' => true,
            ]);

            // Сохраняем конфигурацию в отдельной таблице
            if (!empty($processedConfig)) {
                $siteWidget->syncConfig($processedConfig);
            }

            // Данные уже мигрированы в syncConfig выше

            // Сбрасываем кеш виджетов после добавления
            Cache::forget("site_widgets_config_{$site->id}");

            // Загружаем связанные данные для корректного ответа
            $siteWidget->load([
                'configs',
                'heroSlides',
                'formFields',
                'menuItems',
                'galleryImages',
                'donationSettings',
                'regionRatingSettings',
                'donationsListSettings',
                'referralLeaderboardSettings',
                'imageSettings',
            ]);

            return response()->json([
                'success' => true,
                'widget' => new SiteWidgetResource($siteWidget),
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

            // Находим виджет в нормализованных таблицах
            $siteWidget = \App\Models\SiteWidget::where('site_id', $site->id)
                ->where('id', $widgetId)
                ->first();

            if (!$siteWidget) {
                return response()->json([
                    'success' => false,
                    'message' => 'Виджет не найден',
                ], 404);
            }

            $oldConfig = $siteWidget->getNormalizedConfig();

            // Валидируем конфигурацию виджета
            if ($request->has('config')) {
                $validationErrors = $this->widgetService->validateWidgetConfig(
                    $request->config,
                    $siteWidget->widget_slug
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
                    $siteWidget->widget_slug
                );

                // Очищаем старые изображения
                $this->widgetService->cleanupOldImages($oldConfig, $processedConfig, $siteWidget->widget_slug);

                // Синхронизируем конфигурацию с нормализованными данными
                $siteWidget->syncConfig($processedConfig);
            }

            // Обновляем виджет в нормализованных таблицах
            $updateData = [];
            if ($request->has('is_active')) {
                $updateData['is_active'] = $request->is_active;
            }
            if ($request->has('is_visible')) {
                $updateData['is_visible'] = $request->is_visible;
            }

            if (!empty($updateData)) {
                $siteWidget->update($updateData);
            }

            // Данные уже мигрированы в syncConfig выше

            // Загружаем связанные данные для корректного ответа
            $siteWidget->load([
                'configs',
                'heroSlides',
                'formFields',
                'menuItems',
                'galleryImages',
                'donationSettings',
                'regionRatingSettings',
                'donationsListSettings',
                'referralLeaderboardSettings',
                'imageSettings',
            ]);

            return response()->json([
                'success' => true,
                'widget' => new SiteWidgetResource($siteWidget),
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

            // Находим виджет в нормализованных таблицах
            $siteWidget = \App\Models\SiteWidget::where('site_id', $site->id)
                ->where('id', $widgetId)
                ->first();

            if (!$siteWidget) {
                return back()->withErrors(['error' => 'Виджет не найден']);
            }

            // Удаляем все связанные данные
            $this->deleteWidgetRelatedData($siteWidget);

            // Удаляем сам виджет
            $siteWidget->delete();

            // Сбрасываем кеш виджетов после удаления
            Cache::forget("site_widgets_config_{$site->id}");

            return back()->with('success', 'Виджет успешно удален');
        } catch (\Exception $e) {
            Log::error('Error deleting widget', [
                'site_id' => $site,
                'widget_id' => $widgetId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Ошибка при удалении виджета: ' . $e->getMessage()]);
        }
    }

    // Перемещение виджета (с пересортировкой соседей)
    public function moveWidget(Request $request, $site, $widgetId)
    {
        $request->validate([
            'position_slug' => 'required|string|exists:widget_positions,slug',
            'order' => 'required|integer|min:1',
        ]);

        try {
            $site = $this->getSite($site);

            // Находим виджет
            $siteWidget = \App\Models\SiteWidget::where('site_id', $site->id)
                ->where('id', $widgetId)
                ->first();

            if (!$siteWidget) {
                return response()->json([
                    'success' => false,
                    'message' => 'Виджет не найден',
                ], 404);
            }

            $targetPosition = WidgetPosition::where('slug', $request->position_slug)->firstOrFail();

            $oldPositionSlug = $siteWidget->position_slug;
            $oldOrder = (int) $siteWidget->order;
            $newPositionSlug = $targetPosition->slug;
            $requestedOrder = (int) $request->order;

            DB::transaction(function () use (
                $site,
                $siteWidget,
                $targetPosition,
                $oldPositionSlug,
                $oldOrder,
                $newPositionSlug,
                $requestedOrder
            ) {
                // Закрываем "дыру" в старой позиции, если позиция меняется
                if ($oldPositionSlug !== $newPositionSlug) {
                    \App\Models\SiteWidget::where('site_id', $site->id)
                        ->where('position_slug', $oldPositionSlug)
                        ->where('order', '>', $oldOrder)
                        ->decrement('order');
                }

                // Подсчитываем количество виджетов в целевой позиции
                $siblingsCount = \App\Models\SiteWidget::where('site_id', $site->id)
                    ->where('position_slug', $newPositionSlug)
                    ->when($oldPositionSlug === $newPositionSlug, function ($q) use ($siteWidget) {
                        // При перемещении внутри той же позиции исключаем сам виджет из подсчета
                        $q->where('id', '!=', $siteWidget->id);
                    })
                    ->count();

                // Нормализуем требуемый порядок
                $newOrder = max(1, min($requestedOrder, $siblingsCount + 1));

                // Сдвигаем соседей в целевой позиции, освобождая место под newOrder
                \App\Models\SiteWidget::where('site_id', $site->id)
                    ->where('position_slug', $newPositionSlug)
                    ->when($oldPositionSlug === $newPositionSlug, function ($q) use ($siteWidget) {
                        $q->where('id', '!=', $siteWidget->id);
                    })
                    ->where('order', '>=', $newOrder)
                    ->increment('order');

                // Обновляем сам виджет
                $siteWidget->update([
                    'position_slug' => $targetPosition->slug,
                    'position_name' => $targetPosition->name,
                    'position_id' => $targetPosition->id,
                    'order' => $newOrder,
                    'sort_order' => $newOrder,
                ]);
            });

            // Сбрасываем кеш виджетов после перемещения
            Cache::forget("site_widgets_config_{$site->id}");

            // Грузим связи и отдаем JSON
            $siteWidget->load([
                'configs',
                'heroSlides',
                'formFields',
                'menuItems',
                'galleryImages',
                'donationSettings',
                'regionRatingSettings',
                'donationsListSettings',
                'referralLeaderboardSettings',
                'imageSettings',
            ]);

            return response()->json([
                'success' => true,
                'widget' => new SiteWidgetResource($siteWidget),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при перемещении виджета: ' . $e->getMessage(),
            ], 500);
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

    /**
     * Получить настройки позиции для сайта
     */
    public function getPositionSettings(Request $request, $site, string $positionSlug): JsonResponse
    {
        try {
            $siteModel = $this->getSite($site);

            $position = \App\Models\WidgetPosition::where('slug', $positionSlug)->first();

            $settings = \App\Models\SitePositionSetting::where('site_id', $siteModel->id)
                ->where('position_slug', $positionSlug)
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'position' => $position,
                    'settings' => $settings,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении настроек позиции: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Сохранить настройки позиции для сайта
     */
    public function savePositionSettings(Request $request, $site, string $positionSlug): JsonResponse
    {
        $request->validate([
            'visibility' => 'nullable|array',
            'layout' => 'nullable|array',
        ]);

        try {
            $siteModel = $this->getSite($site);

            $position = \App\Models\WidgetPosition::where('slug', $positionSlug)->first();

            $settings = \App\Models\SitePositionSetting::updateOrCreate(
                [
                    'site_id' => $siteModel->id,
                    'position_slug' => $positionSlug,
                ],
                [
                    'position_id' => $position?->id,
                    'visibility_rules' => $request->input('visibility', []),
                    'layout_overrides' => $request->input('layout', []),
                ]
            );

            // Сбрасываем кеш вывода для этого сайта/шаблона
            Cache::forget("site_widgets_config_{$siteModel->id}");
            if (!empty($siteModel->template)) {
                Cache::forget("site_positions_{$siteModel->template}");
            }
            Cache::forget("site_position_settings_{$siteModel->id}");

            return response()->json([
                'success' => true,
                'data' => $settings,
                'message' => 'Настройки позиции сохранены',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении настроек позиции: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Доступные публичные маршруты основного сайта (для выбора видимости)
     */
    public function getAvailablePublicRoutes(Request $request, $site): JsonResponse
    {
        try {
            // Можно адаптировать по типу сайта, пока фиксированный список для главного сайта
            $routes = [
                ['key' => 'home', 'label' => 'Главная', 'pattern' => '/'],
                ['key' => 'organizations', 'label' => 'Школы (список)', 'pattern' => '/organizations'],
                ['key' => 'organization_show', 'label' => 'Школа (страница)', 'pattern' => '/organization/*'],
                ['key' => 'projects', 'label' => 'Проекты (список)', 'pattern' => '/projects'],
                ['key' => 'project_show', 'label' => 'Проект (страница)', 'pattern' => '/project/*'],
            ];

            return response()->json([
                'success' => true,
                'data' => $routes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении маршрутов: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Опубликованные страницы сайта
     */
    public function getSitePages(Request $request, $site): JsonResponse
    {
        try {
            $siteModel = $this->getSite($site);
            $pages = $siteModel->publishedPages()
                ->orderBy('sort_order')
                ->get(['id', 'title', 'slug']);

            return response()->json([
                'success' => true,
                'data' => $pages,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении страниц: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Получение конфигурации сайта
    public function getConfig($site)
    {
        try {
            $site = $this->getSite($site);

            // Централизованный вывод через ресурс, чтобы включать специализированные данные
            $widgets = \App\Models\SiteWidget::with([
                'configs',
                'heroSlides',
                'sliderSlides',
                'formFields',
                'menuItems',
                'galleryImages',
                'donationSettings',
                'regionRatingSettings',
                'donationsListSettings',
                'referralLeaderboardSettings',
                'imageSettings',
                'widget',
                'position',
            ])
                ->where('site_id', $site->id)
                ->active()
                ->visible()
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => SiteWidgetResource::collection($widgets)->toArray(request()),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении конфигурации: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Сохранение конфигурации сайта (массовое)
    public function saveConfig(Request $request, $id): JsonResponse
    {
        $request->validate([
            'widgets' => 'required|array',
        ]);

        try {
            $site = $this->getSite($id);
            $widgets = $request->widgets;

            foreach ($widgets as $w) {
                if (empty($w['id'])) {
                    continue;
                }
                $siteWidget = \App\Models\SiteWidget::where('site_id', $site->id)
                    ->where('id', $w['id'])
                    ->first();
                if (!$siteWidget) {
                    continue;
                }

                $update = [];
                if (array_key_exists('is_active', $w)) {
                    $update['is_active'] = (bool) $w['is_active'];
                }
                if (array_key_exists('is_visible', $w)) {
                    $update['is_visible'] = (bool) $w['is_visible'];
                }
                if (array_key_exists('order', $w)) {
                    $update['order'] = (int) $w['order'];
                    $update['sort_order'] = (int) $w['order'];
                }
                if (array_key_exists('position_slug', $w)) {
                    $pos = WidgetPosition::where('slug', $w['position_slug'])->first();
                    if ($pos) {
                        $update['position_slug'] = $pos->slug;
                        $update['position_name'] = $pos->name;
                        $update['position_id'] = $pos->id;
                    }
                }
                if (!empty($update)) {
                    $siteWidget->update($update);
                }

                // Если есть конфиг, синхронизируем его (ожидаем ключ configs или config)
                if (!empty($w['config']) && is_array($w['config'])) {
                    $siteWidget->syncConfig($w['config']);
                } elseif (!empty($w['configs']) && is_array($w['configs'])) {
                    // Если пришли нормализованные configs (ключ/значение/тип) — преобразуем в плоский вид
                    $flat = [];
                    foreach ($w['configs'] as $c) {
                        if (!empty($c['config_key'])) {
                            $flat[$c['config_key']] = $c['config_value'];
                        }
                    }
                    if (!empty($flat)) {
                        $siteWidget->syncConfig($flat);
                    }
                }
            }

            // Очищаем кеш виджетов сайта после сохранения
            Cache::forget("site_widgets_config_{$site->id}");

            return response()->json([
                'success' => true,
                'message' => 'Конфигурация сохранена',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при сохранении конфигурации: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Создание дефолтных виджетов при создании сайта
    public function createDefaultWidgets($siteId): void
    {
        $site = Site::findOrFail($siteId);
        $positions = WidgetPosition::where('template_id', $site->template_id)->get();

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
        $widgetDataService = app(\App\Services\WidgetDataService::class);

        foreach ($defaultWidgets as $widgetData) {
            // Создаем SiteWidget
            $siteWidget = \App\Models\SiteWidget::create([
                'site_id' => $site->id,
                'widget_id' => $widgetData['widget_id'],
                'position_id' => \App\Models\WidgetPosition::where('slug', $widgetData['position_slug'])->first()->id,
                'name' => $widgetData['name'],
                'position_name' => $widgetData['position_name'],
                'position_slug' => $widgetData['position_slug'],
                'widget_slug' => $widgetData['widget_slug'],
                'order' => $widgetData['order'],
                'sort_order' => $widgetData['order'],
                'is_active' => $widgetData['is_active'],
                'is_visible' => $widgetData['is_visible'],
            ]);

            // Сохраняем конфигурацию в отдельной таблице
            if (!empty($widgetData['config'])) {
                $siteWidget->syncConfig($widgetData['config']);
            }

            // Мигрируем данные в нормализованные таблицы
            $widgetDataService->migrateWidgetData($siteWidget);
        }
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
        return $widgetSlug ? Widget::where('widget_slug', $widgetSlug)->first() : null;
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

    // Удаление всех связанных данных виджета
    private function deleteWidgetRelatedData(\App\Models\SiteWidget $siteWidget): void
    {
        // Удаляем конфигурации виджета
        $siteWidget->configs()->delete();

        // Удаляем данные в зависимости от типа виджета
        switch ($siteWidget->widget_slug) {
            case 'hero':
                $siteWidget->heroSlides()->delete();
                break;
            case 'form':
                $siteWidget->formFields()->delete();
                break;
            case 'menu':
                $siteWidget->menuItems()->delete();
                break;
            case 'gallery':
                $siteWidget->galleryImages()->delete();
                break;
            case 'donation':
                $siteWidget->donationSettings()->delete();
                break;
            case 'region-rating':
                $siteWidget->regionRatingSettings()->delete();
                break;
            case 'donations-list':
                $siteWidget->donationsListSettings()->delete();
                break;
            case 'referral-leaderboard':
                $siteWidget->referralLeaderboardSettings()->delete();
                break;
            case 'image':
                $siteWidget->imageSettings()->delete();
                break;
        }
    }

    // Получение сайта с проверкой прав
    private function getSite($id): Site
    {
        $user = Auth::user();

        if (!$user) {
            throw new \Exception('Пользователь не авторизован');
        }

        // Пользователь с ролью super_admin — доступ ко всем сайтам
        $isSuperAdmin = false;
        $hasRoleCallable = [$user, 'hasRole'];
        if (is_callable($hasRoleCallable)) {
            try {
                $isSuperAdmin = (bool) call_user_func($hasRoleCallable, 'super_admin');
            } catch (\Throwable $e) {
                $isSuperAdmin = false;
            }
        }

        if ($isSuperAdmin) {
            return Site::findOrFail($id);
        }

        // Если пользователь привязан к организации — ограничиваем доступ этой организацией
        if (!empty($user->organization_id)) {
            return Site::where('id', $id)
                ->where('organization_id', $user->organization_id)
                ->firstOrFail();
        }

        // Иначе — запрещаем доступ
        throw new \Exception('Пользователь не привязан к организации');
    }
}
