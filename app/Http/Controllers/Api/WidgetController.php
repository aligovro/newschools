<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Models\SiteTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use App\Models\Site;

class WidgetController extends Controller
{
    /**
     * Получить все виджеты
     */
    public function index(Request $request): JsonResponse
    {
        $query = Widget::active()->ordered();

        // Фильтрация по категории
        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        // Убрали фильтрацию по типу (бесплатные/премиум) - все виджеты бесплатные

        // Поиск
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $widgets = $query->get();

        return response()->json([
            'success' => true,
            'data' => $widgets,
        ]);
    }

    /**
     * Получить виджеты для конкретного шаблона
     */
    public function forTemplate(Request $request, $templateId): JsonResponse
    {
        $template = SiteTemplate::findOrFail($templateId);

        $widgets = Widget::active()->ordered()->get();
        $positions = WidgetPosition::active()
            ->where(function ($q) use ($templateId) {
                $q->where('template_id', $templateId)
                    ->orWhereNull('template_id');
            })
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'widgets' => $widgets,
                'positions' => $positions,
                'template' => $template,
            ],
        ]);
    }

    /**
     * Получить виджет по ID
     */
    public function show($id): JsonResponse
    {
        $widget = Widget::active()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $widget,
        ]);
    }

    /**
     * Получить позиции виджетов
     */
    public function positions(Request $request): JsonResponse
    {
        $query = WidgetPosition::active();

        // Фильтрация по шаблону
        if ($request->filled('template_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('template_id', $request->template_id)
                    ->orWhereNull('template_id');
            });
        }

        // Фильтрация по области
        if ($request->filled('area')) {
            $query->byArea($request->area);
        }

        $positions = $query->ordered()->get();

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    /**
     * Обновить layout_config позиции (ширина/выравнивание и т.п.)
     */
    public function updatePositionLayout(Request $request, $positionId): JsonResponse
    {
        $request->validate([
            'layout_config' => 'required|array',
        ]);

        $position = WidgetPosition::findOrFail($positionId);
        $layout = $position->layout_config ?? [];
        $layout = array_merge($layout, $request->input('layout_config', []));
        $position->layout_config = $layout;
        $position->save();

        // Сбрасываем кеш позиций по соответствующим шаблонам
        $templateSlugs = [];
        if ($position->template_id) {
            $template = SiteTemplate::find($position->template_id);
            if ($template && $template->slug) {
                $templateSlugs[] = $template->slug;
            }
        } else {
            // Глобальная позиция: инвалидируем кеш для всех используемых шаблонов
            $templateSlugs = Site::query()->distinct()->pluck('template')->filter()->values()->all();
        }
        foreach ($templateSlugs as $slug) {
            Cache::forget("site_positions_{$slug}");
        }

        return response()->json([
            'success' => true,
            'data' => $position,
        ]);
    }

    /**
     * Получить доступные виджеты для позиции
     */
    public function forPosition(Request $request, $positionId): JsonResponse
    {
        $position = WidgetPosition::findOrFail($positionId);
        $siteType = $request->get('site_type');
        $widgets = $position->getAvailableWidgets($siteType);

        return response()->json([
            'success' => true,
            'data' => [
                'position' => $position,
                'widgets' => $widgets,
            ],
        ]);
    }

    /**
     * Получить категории виджетов
     */
    public function categories(): JsonResponse
    {
        $categories = Widget::active()
            ->select('category')
            ->distinct()
            ->pluck('category')
            ->filter()
            ->values();

        $categoryNames = [
            'layout' => 'Макет',
            'content' => 'Контент',
            'media' => 'Медиа',
            'forms' => 'Формы',
            'navigation' => 'Навигация',
        ];

        $categoriesWithNames = $categories->map(function ($category) use ($categoryNames) {
            return [
                'slug' => $category,
                'name' => $categoryNames[$category] ?? ucfirst($category),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $categoriesWithNames,
        ]);
    }

    /**
     * Получить конфигурацию виджета
     */
    public function config($id): JsonResponse
    {
        $widget = Widget::active()->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'fields_config' => $widget->fields_config,
                'settings_config' => $widget->settings_config,
                'component_name' => $widget->component_name,
            ],
        ]);
    }

    /**
     * Получить превью виджета
     */
    public function preview(Request $request, $id): JsonResponse
    {
        $widget = Widget::active()->findOrFail($id);
        $config = $request->input('config', []);
        $settings = $request->input('settings', []);

        // Здесь можно добавить логику генерации превью
        // Пока возвращаем базовую информацию

        return response()->json([
            'success' => true,
            'data' => [
                'widget' => $widget,
                'preview_html' => $this->generatePreviewHtml($widget, $config, $settings),
            ],
        ]);
    }

    /**
     * Генерация HTML превью для виджета
     */
    private function generatePreviewHtml(Widget $widget, array $config, array $settings): string
    {
        // Базовая генерация превью на основе типа виджета
        switch ($widget->widget_slug) {
            case 'hero':
                return $this->generateHeroPreview($config);
            case 'text':
                return $this->generateTextPreview($config);
            case 'image':
                return $this->generateImagePreview($config);
            case 'gallery':
                return $this->generateGalleryPreview($config);
            case 'projects':
                return $this->generateProjectsPreview($config);
            case 'contact':
                return $this->generateContactPreview($config);
            case 'stats':
                return $this->generateStatsPreview($config);
            default:
                return '<div class="p-4 border rounded">Превью виджета</div>';
        }
    }

    private function generateHeroPreview(array $config): string
    {
        $title = $config['title'] ?? 'Заголовок';
        $subtitle = $config['subtitle'] ?? '';
        $description = $config['description'] ?? '';
        $buttonText = $config['button_text'] ?? '';

        return "
            <div class='hero-preview bg-gray-100 p-8 text-center rounded'>
                " . ($subtitle ? "<p class='text-sm text-gray-600 mb-2'>{$subtitle}</p>" : '') . "
                <h1 class='text-2xl font-bold mb-4'>{$title}</h1>
                " . ($description ? "<p class='text-gray-600 mb-4'>{$description}</p>" : '') . "
                " . ($buttonText ? "<button class='bg-blue-500 text-white px-4 py-2 rounded'>{$buttonText}</button>" : '') . "
            </div>
        ";
    }

    private function generateTextPreview(array $config): string
    {
        $content = $config['content'] ?? 'Текстовый контент';
        return "<div class='text-preview p-4 border rounded'>{$content}</div>";
    }

    private function generateImagePreview(array $config): string
    {
        $image = $config['image'] ?? '/placeholder.jpg';
        $caption = $config['caption'] ?? '';

        return "
            <div class='image-preview p-4 border rounded text-center'>
                <img src='{$image}' alt='Preview' class='max-w-full h-32 object-cover rounded'>
                " . ($caption ? "<p class='text-sm text-gray-600 mt-2'>{$caption}</p>" : '') . "
            </div>
        ";
    }

    private function generateGalleryPreview(array $config): string
    {
        $images = $config['images'] ?? [];
        $columns = $config['columns'] ?? 3;

        return "
            <div class='gallery-preview p-4 border rounded'>
                <div class='grid grid-cols-{$columns} gap-2'>
                    " . implode('', array_map(function ($img) {
            return "<div class='bg-gray-200 h-16 rounded'></div>";
        }, array_slice($images, 0, 6))) . "
                </div>
            </div>
        ";
    }

    private function generateProjectsPreview(array $config): string
    {
        $title = $config['title'] ?? 'Проекты';
        $limit = $config['limit'] ?? 3;

        return "
            <div class='projects-preview p-4 border rounded'>
                <h3 class='font-bold mb-4'>{$title}</h3>
                <div class='grid grid-cols-3 gap-4'>
                    " . implode('', array_map(function ($i) {
            return "<div class='bg-gray-100 p-4 rounded'><div class='h-20 bg-gray-200 rounded mb-2'></div><div class='h-4 bg-gray-200 rounded'></div></div>";
        }, range(1, $limit))) . "
                </div>
            </div>
        ";
    }

    private function generateContactPreview(array $config): string
    {
        $title = $config['title'] ?? 'Контакты';

        return "
            <div class='contact-preview p-4 border rounded'>
                <h3 class='font-bold mb-4'>{$title}</h3>
                <div class='space-y-2'>
                    <div class='h-4 bg-gray-200 rounded'></div>
                    <div class='h-4 bg-gray-200 rounded w-3/4'></div>
                    <div class='h-4 bg-gray-200 rounded w-1/2'></div>
                </div>
            </div>
        ";
    }

    private function generateStatsPreview(array $config): string
    {
        $title = $config['title'] ?? 'Статистика';
        $columns = $config['columns'] ?? 3;

        return "
            <div class='stats-preview p-4 border rounded'>
                <h3 class='font-bold mb-4'>{$title}</h3>
                <div class='grid grid-cols-{$columns} gap-4'>
                    " . implode('', array_map(function ($i) {
            return "<div class='text-center'><div class='text-2xl font-bold'>100+</div><div class='text-sm text-gray-600'>Показатель</div></div>";
        }, range(1, $columns))) . "
                </div>
            </div>
        ";
    }
}
