<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Widget;
use App\Models\SiteTemplate;
use App\Models\Site;
use App\Models\SiteWidget;
use App\Models\WidgetPosition;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class WidgetController extends Controller
{
    /**
     * Получить все доступные виджеты
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->get('category');
        $premium = $request->get('premium');

        $query = Widget::active()->ordered();

        if ($category) {
            $query->byCategory($category);
        }

        if ($premium !== null) {
            if ($premium) {
                $query->premium();
            } else {
                $query->free();
            }
        }

        $widgets = $query->get();

        return response()->json([
            'success' => true,
            'data' => $widgets,
            'categories' => Widget::active()->distinct('category')->pluck('category'),
        ]);
    }

    /**
     * Получить виджеты для конкретного шаблона
     */
    public function getForTemplate(SiteTemplate $template): JsonResponse
    {
        $availableBlocks = $template->available_blocks ?? [];

        $widgets = Widget::active()
            ->whereIn('widget_slug', $availableBlocks)
            ->ordered()
            ->get();

        $positions = $template->activePositions()->ordered()->get();

        return response()->json([
            'widgets' => $widgets,
            'positions' => $positions,
            'template' => $template,
        ]);
    }

    /**
     * Получить виджеты сайта
     */
    public function getForSite(Site $site): JsonResponse
    {
        $widgets = $site->activeWidgets()
            ->with(['widget', 'position'])
            ->ordered()
            ->get()
            ->groupBy('position_name');

        return response()->json([
            'widgets' => $widgets,
            'site' => $site,
        ]);
    }

    /**
     * Добавить виджет на сайт
     */
    public function addToSite(Request $request, Site $site): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'widget_id' => 'required|exists:widgets,id',
            'position_name' => 'required|string',
            'name' => 'required|string|max:255',
            'config' => 'nullable|array',
            'settings' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $widget = Widget::findOrFail($request->widget_id);

            // Проверяем, разрешен ли виджет в данной позиции
            $position = WidgetPosition::where('template_id', $site->template)
                ->where('slug', $request->position_name)
                ->first();

            if ($position && !$position->isWidgetAllowed($widget->slug)) {
                return response()->json([
                    'message' => 'Данный виджет не разрешен в этой позиции'
                ], 403);
            }

            $siteWidget = $site->widgets()->create([
                'widget_id' => $widget->id,
                'position_id' => $position?->id,
                'name' => $request->name,
                'position_name' => $request->position_name,
                'config' => $request->config ?? [],
                'settings' => $request->settings ?? [],
                'order' => $request->order ?? 0,
            ]);

            return response()->json([
                'message' => 'Виджет добавлен',
                'widget' => $siteWidget->load('widget'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка добавления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обновить виджет сайта
     */
    public function updateSiteWidget(Request $request, Site $site, SiteWidget $siteWidget): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'config' => 'nullable|array',
            'settings' => 'nullable|array',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_visible' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Проверяем, что виджет принадлежит сайту
            if ($siteWidget->site_id !== $site->id) {
                return response()->json([
                    'message' => 'Виджет не принадлежит данному сайту'
                ], 403);
            }

            $updateData = array_filter($request->only([
                'name',
                'config',
                'settings',
                'order',
                'is_active',
                'is_visible'
            ]), fn($value) => $value !== null);

            $siteWidget->update($updateData);

            return response()->json([
                'message' => 'Виджет обновлен',
                'widget' => $siteWidget->load('widget'),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка обновления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить виджет с сайта
     */
    public function removeFromSite(Site $site, SiteWidget $siteWidget): JsonResponse
    {
        try {
            // Проверяем, что виджет принадлежит сайту
            if ($siteWidget->site_id !== $site->id) {
                return response()->json([
                    'message' => 'Виджет не принадлежит данному сайту'
                ], 403);
            }

            $siteWidget->delete();

            return response()->json([
                'message' => 'Виджет удален'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка удаления виджета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Изменить порядок виджетов
     */
    public function reorderWidgets(Request $request, Site $site): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'widgets' => 'required|array',
            'widgets.*.id' => 'required|exists:site_widgets,id',
            'widgets.*.order' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->widgets as $widgetData) {
                $siteWidget = $site->widgets()->find($widgetData['id']);
                if ($siteWidget) {
                    $siteWidget->update(['order' => $widgetData['order']]);
                }
            }

            return response()->json([
                'message' => 'Порядок виджетов обновлен'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка изменения порядка: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить конфигурацию виджета
     */
    public function getConfig(Widget $widget): JsonResponse
    {
        return response()->json([
            'widget' => $widget,
            'fields_config' => $widget->fields_config,
            'settings_config' => $widget->settings_config,
        ]);
    }

    /**
     * Получить позиции шаблона
     */
    public function getTemplatePositions(SiteTemplate $template): JsonResponse
    {
        $positions = $template->activePositions()
            ->ordered()
            ->get()
            ->groupBy('area');

        return response()->json([
            'positions' => $positions,
            'template' => $template,
        ]);
    }

    /**
     * Получить виджеты для позиции
     */
    public function getWidgetsForPosition(Request $request, WidgetPosition $position): JsonResponse
    {
        $siteType = $request->get('site_type');
        $widgets = $position->getAvailableWidgets($siteType);

        return response()->json([
            'widgets' => $widgets,
            'position' => $position,
        ]);
    }

    /**
     * Загрузить изображение для виджета
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
            'widget_slug' => 'required|string',
            'image_type' => 'required|string|in:background,avatar,gallery',
            'slide_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()->all(),
            ], 422);
        }

        try {
            $image = $request->file('image');
            $widgetSlug = $request->input('widget_slug');
            $imageType = $request->input('image_type');
            $slideId = $request->input('slide_id');

            // Создаем уникальное имя файла
            $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();

            // Путь для сохранения
            $path = "widgets/{$widgetSlug}/{$imageType}";

            // Сохраняем файл
            $fullPath = $image->storeAs($path, $filename, 'public');

            // Создаем правильный URL без дублирующихся слешей
            $baseUrl = rtrim(config('app.url'), '/');
            $storageUrl = $baseUrl . '/storage/' . ltrim($fullPath, '/');

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $storageUrl,
                    'filename' => $filename,
                    'original_name' => $image->getClientOriginalName(),
                    'size' => $image->getSize(),
                    'thumbnails' => [
                        'small' => $storageUrl,
                        'medium' => $storageUrl,
                        'large' => $storageUrl,
                    ],
                    'dimensions' => [
                        'width' => 0, // Можно добавить получение размеров
                        'height' => 0,
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Удалить изображение виджета
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image_url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()->all(),
            ], 422);
        }

        try {
            $imageUrl = $request->input('image_url');

            // Извлекаем путь к файлу из URL
            $parsedUrl = parse_url($imageUrl);
            $path = str_replace('/storage/', '', $parsedUrl['path']);

            // Удаляем файл из хранилища
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }

            return response()->json([
                'success' => true,
                'message' => 'Изображение успешно удалено',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении изображения: ' . $e->getMessage(),
            ], 500);
        }
    }
}
