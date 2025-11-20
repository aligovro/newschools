<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\WidgetPosition;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SitePreviewController extends Controller
{
    /**
     * Показать превью сайта (только опубликованные для публичного доступа)
     */
    public function preview(Request $request, $slug)
    {
        try {
            $site = Cache::remember("site_by_slug_{$slug}", 300, function () use ($slug) {
                return Site::where('slug', $slug)
                    ->where('status', 'published')
                    ->firstOrFail();
            });

            // Получаем конфигурацию виджетов из нормализованных таблиц (с кешем)
            $widgetsConfig = Cache::remember("site_widgets_config_{$site->id}", 300, function () use ($site) {
                $widgetDataService = app(\App\Services\WidgetDataService::class);
                return $widgetDataService->getSiteWidgetsWithData($site->id);
            });

            // Позиции для шаблона (с кешем)
            $positions = Cache::remember("site_positions_{$site->template}", 600, function () use ($site) {
                $template = SiteTemplate::where('slug', $site->template)->first();
                $query = WidgetPosition::active()->ordered();
                if ($template) {
                    $query->where(function ($q) use ($template) {
                        $q->where('template_id', $template->id)->orWhereNull('template_id');
                    });
                }
                return $query->get();
            });

            $positionSettings = Cache::remember("site_position_settings_{$site->id}", 300, function () use ($site) {
                return \App\Models\SitePositionSetting::where('site_id', $site->id)->get();
            });

            Log::info('SitePreviewController::preview - widgets config:', [
                'site_id' => $site->id,
                'widgets_count' => count($widgetsConfig),
                'first_widget' => $widgetsConfig[0] ?? null,
            ]);

            return Inertia::render('SitePreview', [
                'site' => [
                    'id' => $site->id,
                    'name' => $site->name,
                    'slug' => $site->slug,
                    'description' => $site->description,
                    'template' => $site->template,
                    'widgets_config' => $widgetsConfig,
                    'seo_config' => $site->formatted_seo_config ?? [],
                ],
                'positions' => $positions,
                'position_settings' => $positionSettings,
            ]);
        } catch (\Exception $e) {
            abort(404, 'Сайт не найден');
        }
    }

    /**
     * Показать сайт для администратора (включая неопубликованные)
     * Доступен только авторизованным пользователям с правами на просмотр сайта
     */
    public function adminView(Request $request, $id)
    {
        // Проверяем авторизацию
        if (!auth()->check()) {
            abort(403, 'Доступ запрещен');
        }

        $user = auth()->user();

        // Ищем сайт по ID (не по slug, чтобы избежать конфликтов)
        $site = Site::findOrFail($id);

        // Проверяем права: супер-админ или владелец организации
        $canView = false;
        if ($user->isSuperAdmin()) {
            $canView = true;
        } elseif ($site->organization_id && $user->organizations->contains('id', $site->organization_id)) {
            // Пользователь должен быть связан с организацией сайта
            $canView = true;
        }

        if (!$canView) {
            abort(403, 'У вас нет прав для просмотра этого сайта');
        }

        // Получаем конфигурацию виджетов (без кеша для админа, чтобы видеть актуальные изменения)
        $widgetDataService = app(\App\Services\WidgetDataService::class);
        $widgetsConfig = $widgetDataService->getSiteWidgetsWithData($site->id);

        // Позиции для шаблона
        $positions = Cache::remember("site_positions_{$site->template}", 600, function () use ($site) {
            $template = SiteTemplate::where('slug', $site->template)->first();
            $query = WidgetPosition::active()->ordered();
            if ($template) {
                $query->where(function ($q) use ($template) {
                    $q->where('template_id', $template->id)->orWhereNull('template_id');
                });
            }
            return $query->get();
        });

        $positionSettings = \App\Models\SitePositionSetting::where('site_id', $site->id)->get();

        return Inertia::render('SitePreview', [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'description' => $site->description,
                'template' => $site->template,
                'widgets_config' => $widgetsConfig,
                'seo_config' => $site->formatted_seo_config ?? [],
            ],
            'positions' => $positions,
            'position_settings' => $positionSettings,
            'isAdminView' => true, // Флаг для фронтенда
        ]);
    }
}
