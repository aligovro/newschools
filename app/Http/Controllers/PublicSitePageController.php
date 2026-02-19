<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GetsSiteWidgetsData;
use App\Models\Site;
use App\Models\SitePage;
use App\Http\Resources\SitePageResource;
use App\Services\OrganizationSiteByDomainService;
use App\Services\Seo\SeoPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;



class PublicSitePageController extends Controller
{
    use GetsSiteWidgetsData;

    public function __construct(
        private readonly SeoPresenter $seoPresenter,
        private readonly OrganizationSiteByDomainService $domainService,
    ) {}

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
     * Единая точка входа для / и /{slug}.
     * Для кастомного домена — сайт организации, иначе — главный сайт.
     */
    public function showHomeOrPage(?string $slug = null): Response
    {
        $host = request()->getHost();

        if (!$this->domainService->isMainDomain($host)) {
            $site = $this->domainService->getSiteByDomain($host);
            if ($site) {
                return $this->showOrganizationSitePage($slug);
            }
        }

        if (empty($slug)) {
            return app(MainSiteController::class)->index(request());
        }

        return $this->showMainSitePage($slug);
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
        $siteData = $this->getSiteWidgetsAndPositionsFor($site);

        // Формируем SEO данные для страницы (единый формат seo)
        $seo = $this->seoPresenter->forSitePage($site, $page, request()->fullUrl());

        return Inertia::render('site/PageShow', array_merge($siteData, [
            'page' => (new SitePageResource($page))->toArray(request()),
            'seo' => $seo,
        ]));
    }

    /**
     * Просмотр страницы сайта организации
     * URL: / или /{slug} (определяется по домену)
     *
     * @param  string|null  $slug  Slug страницы; null или пусто — главная
     */
    public function showOrganizationSitePage(?string $slug = null, ?string $siteSlug = null): Response
    {
        $site = $siteSlug
            ? Site::where('slug', $siteSlug)->where('site_type', 'organization')->published()->first()
            : $this->domainService->getSiteByDomain(request()->getHost());

        if (!$site) {
            abort(404, 'Сайт не найден');
        }

        $page = empty($slug) || $slug === '/'
            ? $site->pages()->homepage()->published()->first()
                ?? $site->pages()->where('status', 'published')->where('is_public', true)->orderBy('sort_order')->first()
            : SitePage::where('site_id', $site->id)
                ->where('slug', $slug)
                ->where(function ($query) {
                    $query->where('status', 'published')->orWhere('is_public', true);
                })
                ->where(function ($query) {
                    $query->whereNull('published_at')->orWhere('published_at', '<=', now());
                })
                ->first();

        if (!$page) {
            abort(404, 'Страница не найдена');
        }

        // Загружаем связи
        $page->load(['parent', 'children', 'site']);

        // Получаем данные сайта для виджетов
        $siteData = $this->getSiteWidgetsAndPositionsFor($site);

        return Inertia::render('site/PageShow', array_merge($siteData, [
            'page' => (new SitePageResource($page))->toArray(request()),
            'seo' => $this->seoPresenter->forSitePage($site, $page, request()->fullUrl()),
        ]));
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
