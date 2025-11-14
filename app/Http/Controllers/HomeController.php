<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use App\Models\Donation;
use App\Models\Project;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationProjectResource;
use App\Http\Resources\RegionStatResource;
use App\Support\InertiaResource;
use App\Services\GlobalSettingsService;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index(GlobalSettingsService $globalSettings)
    {
        // Получаем статистику для главной страницы
        $stats = [
            'totalUsers' => User::count(),
            'totalOrganizations' => Organization::where('status', 'active')->count(),
            'totalDonations' => Donation::where('status', 'completed')->sum('amount') ?? 0,
            'totalProjects' => Project::where('status', 'active')->count(),
        ];

        // Получаем настройки главного сайта
        $mainSite = Site::where('site_type', 'main')->first();
        $seoConfig = $mainSite ? ($mainSite->formatted_seo_config ?? []) : [];
        $mainSiteSettings = $mainSite ? [
            'site_name' => $mainSite->name,
            'site_description' => $mainSite->description,
            // Поддержка разных вариантов ключей для обратной совместимости
            'meta_title' => $seoConfig['seo_title'] ?? $seoConfig['meta_title'] ?? null,
            'meta_description' => $seoConfig['seo_description'] ?? $seoConfig['meta_description'] ?? null,
            'meta_keywords' => $seoConfig['seo_keywords'] ?? $seoConfig['meta_keywords'] ?? null,
            'og_title' => $seoConfig['og_title'] ?? null,
            'og_description' => $seoConfig['og_description'] ?? null,
            'og_type' => $seoConfig['og_type'] ?? null,
            'og_image' => $seoConfig['og_image'] ?? null,
            'twitter_card' => $seoConfig['twitter_card'] ?? null,
            'twitter_title' => $seoConfig['twitter_title'] ?? null,
            'twitter_description' => $seoConfig['twitter_description'] ?? null,
            'twitter_image' => $seoConfig['twitter_image'] ?? null,
        ] : [
            'site_name' => 'Платформа поддержки школ',
            'site_description' => 'Поддерживай школы города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
            'meta_title' => null,
            'meta_description' => null,
            'meta_keywords' => null,
            'og_title' => null,
            'og_description' => null,
            'og_type' => null,
            'og_image' => null,
            'twitter_card' => null,
            'twitter_title' => null,
            'twitter_description' => null,
            'twitter_image' => null,
        ];

        // Получаем глобальные настройки для терминологии
        $globalSettings = $globalSettings->getSettings();

        // SEO мета-данные с использованием новых настроек
        $seoData = [
            'title' => $mainSiteSettings['meta_title'] ?: $mainSiteSettings['site_name'] . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
            'description' => $mainSiteSettings['meta_description'] ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
            'keywords' => $mainSiteSettings['meta_keywords'] ?: implode(', ', [
                mb_strtolower($globalSettings->org_plural_nominative),
                mb_strtolower($globalSettings->org_plural_genitive),
                'поддержка',
                'пожертвования',
                'проекты',
                'организации'
            ]),
            'og_title' => $mainSiteSettings['og_title'] ?: $mainSiteSettings['site_name'] . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
            'og_description' => $mainSiteSettings['og_description'] ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее',
            'og_type' => $mainSiteSettings['og_type'],
            'og_image' => $mainSiteSettings['og_image'] ?: asset('images/og-image.jpg'),
            'twitter_card' => $mainSiteSettings['twitter_card'],
            'twitter_title' => $mainSiteSettings['twitter_title'] ?: $mainSiteSettings['site_name'] . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
            'twitter_description' => $mainSiteSettings['twitter_description'] ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее',
            'twitter_image' => $mainSiteSettings['twitter_image'] ?: asset('images/twitter-image.jpg'),
        ];

        // Получаем популярные организации
        $popularOrganizations = Organization::with(['domains', 'projects'])
            ->where('status', 'active')
            ->limit(8)
            ->get();

        // Получаем топ регионов по пожертвованиям
        $topRegions = Organization::selectRaw('regions.name as region_name, SUM(projects.target_amount) as total_amount, COUNT(DISTINCT organizations.id) as organizations_count')
            ->join('projects', 'organizations.id', '=', 'projects.organization_id')
            ->join('regions', 'organizations.region_id', '=', 'regions.id')
            ->where('organizations.status', 'active')
            ->groupBy('regions.id', 'regions.name')
            ->orderBy('total_amount', 'desc')
            ->limit(10)
            ->get();

        // Получаем активные проекты
        $activeProjects = Project::with('organization')
            ->where('status', 'active')
            ->limit(6)
            ->get();

        // Получаем слайдеры для главной страницы (заглушка)
        $heroSliders = [];
        $contentSliders = [];

        return Inertia::render('Home', [
            'stats' => $stats,
            'popularOrganizations' => InertiaResource::list($popularOrganizations, OrganizationResource::class),
            'topRegions' => InertiaResource::list($topRegions, RegionStatResource::class),
            'activeProjects' => InertiaResource::list($activeProjects, OrganizationProjectResource::class),
            'seo' => $seoData,
            'mainSiteSettings' => $mainSiteSettings,
            'globalSettings' => $globalSettings,
            'terminology' => [
                'site_name' => $mainSiteSettings['site_name'],
                'site_description' => $mainSiteSettings['site_description'],
                'org_plural' => $globalSettings->org_plural_nominative,
                'org_genitive' => $globalSettings->org_plural_genitive,
                'support_action' => $globalSettings->action_support,
            ],
            'heroSliders' => $heroSliders,
            'contentSliders' => $contentSliders,
        ]);
    }
}
