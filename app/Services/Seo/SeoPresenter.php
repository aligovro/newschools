<?php

namespace App\Services\Seo;

use App\Models\News;
use App\Models\Organization;
use App\Models\Site;
use App\Models\SitePage;

/**
 * Единый сервис для вычисления SEO-данных, которые:
 * 1) Отдаются во фронт как props['seo']
 * 2) Используются Blade-шаблоном app.blade.php для серверного рендера OG/SEO тегов.
 *
 * Важно: здесь только объединение уже имеющихся конфигов/полей,
 * без дополнительных запросов к БД.
 */
class SeoPresenter
{
    /**
     * Базовый метод: собирает ComputedSeo из site.seo_config (+ pageOverrides).
     *
     * @param  Site       $site
     * @param  array      $pageOverrides  pageTitle, pageDescription, seo_overrides и т.п.
     * @param  string|null $currentUrl    Полный URL текущей страницы
     * @return array
     */
    public function forSite(Site $site, array $pageOverrides = [], ?string $currentUrl = null): array
    {
        $rawSeo = $site->formatted_seo_config ?? [];

        // Переопределения на уровне страницы (например, seoOverrides из новости/организации)
        $rawSeo = array_merge($rawSeo, $pageOverrides['seo_overrides'] ?? []);

        $siteName = (string) ($site->name ?? config('app.name'));
        $siteDescription = (string) ($site->description ?? '');

        $pageTitleOverride = $pageOverrides['pageTitle'] ?? null;
        $pageDescriptionOverride = $pageOverrides['pageDescription'] ?? null;

        $seoTitle = $this->getString($rawSeo['seo_title'] ?? null)
            ?? $this->getString($rawSeo['meta_title'] ?? null)
            ?? $this->getString($rawSeo['title'] ?? null);

        $seoDescription = $this->getString($rawSeo['seo_description'] ?? null)
            ?? $this->getString($rawSeo['meta_description'] ?? null)
            ?? $this->getString($rawSeo['description'] ?? null);

        $seoKeywords = $this->getString($rawSeo['seo_keywords'] ?? null)
            ?? $this->getString($rawSeo['meta_keywords'] ?? null)
            ?? $this->getString($rawSeo['keywords'] ?? null);

        $metaTitle = $pageTitleOverride
            ?? $seoTitle
            ?? $siteName;

        $metaDescription = $pageDescriptionOverride
            ?? $seoDescription
            ?? $siteDescription;

        $canonicalUrl = $this->getString($rawSeo['canonical_url'] ?? null)
            ?? $this->getString($rawSeo['slug_url'] ?? null)
            ?? $currentUrl;

        $ogTitle = $this->getString($rawSeo['og_title'] ?? null)
            ?? $seoTitle
            ?? $metaTitle;

        $ogDescription = $this->getString($rawSeo['og_description'] ?? null)
            ?? $seoDescription
            ?? $metaDescription;

        $ogType = $this->getString($rawSeo['og_type'] ?? null) ?? 'website';

        $ogImage = $this->getString($rawSeo['og_image'] ?? null)
            ?? $this->getString($rawSeo['image'] ?? null);

        $twitterCard = $this->getString($rawSeo['twitter_card'] ?? null)
            ?? 'summary_large_image';

        $twitterTitle = $this->getString($rawSeo['twitter_title'] ?? null)
            ?? $ogTitle
            ?? $metaTitle;

        $twitterDescription = $this->getString($rawSeo['twitter_description'] ?? null)
            ?? $ogDescription
            ?? $metaDescription;

        $twitterImage = $this->getString($rawSeo['twitter_image'] ?? null)
            ?? $ogImage;

        return [
            'title' => $metaTitle,
            'description' => $metaDescription,
            'keywords' => $seoKeywords,
            'canonical_url' => $canonicalUrl,
            'og_title' => $ogTitle,
            'og_description' => $ogDescription,
            'og_type' => $ogType,
            'og_image' => $ogImage,
            'twitter_card' => $twitterCard,
            'twitter_title' => $twitterTitle,
            'twitter_description' => $twitterDescription,
            'twitter_image' => $twitterImage,
        ];
    }

    /**
     * SEO для главной страницы основного сайта (main site).
     *
     * Использует seo_config сайта + pageTitle/pageDescription из настроек/глобальной конфигурации.
     */
    public function forMainSite(Site $site, array $pageSeoOverrides = [], ?string $currentUrl = null): array
    {
        return $this->forSite($site, [
            'pageTitle' => $pageSeoOverrides['title'] ?? null,
            'pageDescription' => $pageSeoOverrides['description'] ?? null,
            'seo_overrides' => $pageSeoOverrides,
        ], $currentUrl);
    }

    /**
     * SEO для страницы SitePage (конструктор страниц).
     */
    public function forSitePage(Site $site, SitePage $page, ?string $currentUrl = null): array
    {
        $siteSeo = $site->formatted_seo_config ?? [];
        $pageSeo = $page->seo_config ?? [];

        $title = $pageSeo['seo_title'] ?? $pageSeo['meta_title'] ?? $page->title;
        $description = $pageSeo['seo_description']
            ?? $pageSeo['meta_description']
            ?? $page->excerpt
            ?? $siteSeo['seo_description']
            ?? $site->description
            ?? '';
        $keywords = $pageSeo['seo_keywords']
            ?? $pageSeo['meta_keywords']
            ?? $siteSeo['seo_keywords']
            ?? '';
        $image = $pageSeo['seo_image']
            ?? $pageSeo['image']
            ?? $page->image
            ?? $siteSeo['og_image']
            ?? null;

        $overrides = [
            'seo_title' => $title,
            'seo_description' => $description,
            'seo_keywords' => $keywords,
            'og_image' => $image,
        ];

        return $this->forSite($site, [
            'pageTitle' => $title,
            'pageDescription' => $description,
            'seo_overrides' => $overrides,
        ], $currentUrl);
    }

    /**
     * SEO для конкретной новости главного сайта.
     */
    public function forNews(Site $site, News $news, ?string $currentUrl = null): array
    {
        $overrides = $news->seo_settings ?? [];

        // Если не задан og_image в seo_settings — пытаемся взять картинку новости
        if (empty($overrides['og_image']) && $news->image) {
            $overrides['og_image'] = $news->image;
        }

        return $this->forSite($site, [
            'pageTitle' => $news->title,
            'pageDescription' => $news->excerpt ?? $news->subtitle ?? null,
            'seo_overrides' => $overrides,
        ], $currentUrl);
    }

    /**
     * SEO для страницы организации.
     */
    public function forOrganization(Site $site, Organization $organization, ?string $currentUrl = null): array
    {
        $ogImage = null;

        if ($organization->logo) {
            $ogImage = '/storage/' . ltrim($organization->logo, '/');
        } elseif (!empty($organization->images) && is_array($organization->images)) {
            $first = $organization->images[0] ?? null;
            if ($first) {
                $ogImage = '/storage/' . ltrim($first, '/');
            }
        }

        $overrides = [
            'seo_title' => $organization->name,
            'seo_description' => $organization->description,
            'og_title' => $organization->name,
            'og_description' => $organization->description,
        ];

        if ($ogImage) {
            $overrides['og_image'] = $ogImage;
        }

        return $this->forSite($site, [
            'pageTitle' => $organization->name,
            'pageDescription' => $organization->description,
            'seo_overrides' => $overrides,
        ], $currentUrl);
    }

    private function getString(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}


