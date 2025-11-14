<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SitePage;
use App\Http\Resources\SitePageResource;
use App\Services\WidgetDataService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class PublicSitePageController extends Controller
{
    /**
     * Получить главный сайт (с кешированием)
     */
    private function getMainSite(): ?Site
    {
        return Cache::remember('main_site', 600, function () {
            return Site::where('site_type', 'main')
                ->published()
                ->first();
        });
    }

    /**
     * Получить сайт организации по домену
     */
    private function getSiteByDomain(?string $domain = null): ?Site
    {
        // TODO: Реализовать определение сайта по домену
        // Пока возвращаем null, так как это будет реализовано позже
        return null;
    }

    /**
     * Просмотр страницы главного сайта
     * URL: /{slug}
     */
    public function showMainSitePage(string $slug): Response
    {
        $site = $this->getMainSite();

        if (!$site) {
            abort(404, 'Главный сайт не найден');
        }

        // Кешируем страницу на 5 минут, но проверяем доступность
        $page = Cache::remember(
            "site_page_{$site->id}_{$slug}",
            300,
            function () use ($site, $slug) {
                return SitePage::where('site_id', $site->id)
                    ->where('slug', $slug)
                    ->where(function ($query) {
                        // Показываем опубликованные страницы или публичные (не черновики)
                        $query->where('status', 'published')
                            ->orWhere(function ($q) {
                                $q->where('is_public', true)
                                    ->where('status', '!=', 'draft');
                            });
                    })
                    ->where(function ($query) {
                        $query->whereNull('published_at')
                            ->orWhere('published_at', '<=', now());
                    })
                    ->with(['parent:id,title,slug', 'children:id,title,slug,sort_order', 'site:id,name,slug'])
                    ->first();
            }
        );

        if (!$page) {
            abort(404, 'Страница не найдена');
        }

        // Получаем данные сайта для виджетов (уже кешируется внутри)
        $siteData = $this->getSiteWidgetsAndPositions($site);

        // Формируем SEO данные для страницы
        $pageSeo = $this->getPageSeoData($page, $site);

        return Inertia::render('site/PageShow', array_merge($siteData, [
            'page' => (new SitePageResource($page))->toArray(request()),
            'pageSeo' => $pageSeo,
        ]));
    }

    /**
     * Просмотр страницы сайта организации
     * URL: /{slug} (определяется по домену)
     */
    public function showOrganizationSitePage(string $slug, ?string $siteSlug = null): Response
    {
        // Определяем сайт
        $site = null;

        // Если передан siteSlug, используем его
        if ($siteSlug) {
            $site = Site::where('slug', $siteSlug)
                ->where('site_type', 'organization')
                ->published()
                ->first();
        } else {
            // Пытаемся определить по домену
            $site = $this->getSiteByDomain(request()->getHost());
        }

        if (!$site) {
            abort(404, 'Сайт не найден');
        }

        $page = SitePage::where('site_id', $site->id)
            ->where('slug', $slug)
            ->where(function ($query) {
                $query->where('status', 'published')
                    ->orWhere('is_public', true);
            })
            ->where(function ($query) {
                $query->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            })
            ->first();

        if (!$page) {
            abort(404, 'Страница не найдена');
        }

        // Загружаем связи
        $page->load(['parent', 'children', 'site']);

        // Получаем данные сайта для виджетов
        $siteData = $this->getSiteWidgetsAndPositions($site);

        return Inertia::render('site/PageShow', array_merge($siteData, [
            'page' => (new SitePageResource($page))->toArray(request()),
        ]));
    }

    /**
     * Получить виджеты и позиции для сайта (оптимизировано с кешированием)
     */
    private function getSiteWidgetsAndPositions(Site $site): array
    {
        /** @var WidgetDataService $widgetDataService */
        $widgetDataService = app(WidgetDataService::class);

        // Кешируем конфигурацию виджетов на 5 минут
        $widgetsConfig = Cache::remember(
            "site_widgets_config_{$site->id}",
            300,
            function () use ($widgetDataService, $site) {
                return $widgetDataService->getSiteWidgetsWithData($site->id);
            }
        );

        // Кешируем позиции на 10 минут (меняются редко)
        $positions = Cache::remember(
            "site_positions_{$site->template}",
            600,
            function () use ($site) {
                $template = \App\Models\SiteTemplate::where('slug', $site->template)->first();
                $query = \App\Models\WidgetPosition::active()->ordered();
                if ($template) {
                    $query->where(function ($q) use ($template) {
                        $q->where('template_id', $template->id)->orWhereNull('template_id');
                    });
                }
                return $query->get()->map(function ($position) {
                    return [
                        'id' => $position->id,
                        'template_id' => $position->template_id,
                        'name' => $position->name,
                        'slug' => $position->slug,
                        'description' => $position->description,
                        'area' => $position->area,
                        'order' => $position->order ?? $position->sort_order ?? 0,
                        'allowed_widgets' => $position->allowed_widgets ?? [],
                        'layout_config' => $position->layout_config ?? [],
                        'is_required' => $position->is_required ?? false,
                        'is_active' => $position->is_active ?? true,
                        'created_at' => $position->created_at?->toISOString(),
                        'updated_at' => $position->updated_at?->toISOString(),
                    ];
                });
            }
        );

        // Кешируем настройки позиций на 5 минут
        $positionSettings = Cache::remember(
            "site_position_settings_{$site->id}",
            300,
            function () use ($site) {
                return \App\Models\SitePositionSetting::where('site_id', $site->id)
                    ->get()
                    ->map(function ($setting) {
                        return [
                            'position_slug' => $setting->position_slug,
                            'visibility_rules' => $setting->visibility_rules ?? [],
                            'layout_overrides' => $setting->layout_overrides ?? [],
                        ];
                    });
            }
        );

        return [
            'site' => [
                'id' => $site->id,
                'name' => $site->name,
                'slug' => $site->slug,
                'description' => $site->description,
                'favicon' => $site->getFaviconUrlAttribute(),
                'template' => $site->template,
                'site_type' => $site->site_type,
                'widgets_config' => $widgetsConfig,
                'seo_config' => $site->formatted_seo_config ?? [],
                'layout_config' => $site->layout_config ?? [],
            ],
            'positions' => $positions,
            'position_settings' => $positionSettings,
        ];
    }

    /**
     * Получить SEO данные для страницы
     */
    private function getPageSeoData(SitePage $page, Site $site): array
    {
        $seoConfig = $site->formatted_seo_config ?? [];
        $pageSeo = $page->seo_config ?? [];

        return [
            'title' => $pageSeo['seo_title'] ?? $pageSeo['meta_title'] ?? $page->title,
            'description' => $pageSeo['seo_description'] ?? $pageSeo['meta_description'] ?? $page->excerpt ?? $seoConfig['seo_description'] ?? $site->description ?? '',
            'keywords' => $pageSeo['seo_keywords'] ?? $pageSeo['meta_keywords'] ?? $seoConfig['seo_keywords'] ?? '',
            'image' => $pageSeo['seo_image'] ?? $pageSeo['image'] ?? $page->image ?? $seoConfig['og_image'] ?? '',
        ];
    }
}
