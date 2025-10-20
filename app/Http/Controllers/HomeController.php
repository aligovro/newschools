<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use App\Models\Donation;
use App\Models\OrganizationProject;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationProjectResource;
use App\Http\Resources\RegionStatResource;
use App\Support\InertiaResource;
use App\Services\SliderService;
use App\Services\MainSiteSettingsService;
use App\Services\GlobalSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
  public function index(MainSiteSettingsService $mainSiteSettings, GlobalSettingsService $globalSettings)
  {
    // Получаем статистику для главной страницы
    $stats = [
      'totalUsers' => User::count(),
      'totalOrganizations' => Organization::where('status', 'active')->count(),
      'totalDonations' => Donation::where('status', 'completed')->sum('amount') ?? 0,
      'totalProjects' => OrganizationProject::where('status', 'active')->count(),
    ];

    // Получаем настройки главного сайта
    $mainSiteSettings = $mainSiteSettings->getSettings();

    // Получаем глобальные настройки для терминологии
    $globalSettings = $globalSettings->getSettings();

    // SEO мета-данные с использованием новых настроек
    $seoData = [
      'title' => $mainSiteSettings->meta_title ?: $mainSiteSettings->site_name . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
      'description' => $mainSiteSettings->meta_description ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
      'keywords' => $mainSiteSettings->meta_keywords ?: implode(', ', [
        mb_strtolower($globalSettings->org_plural_nominative),
        mb_strtolower($globalSettings->org_plural_genitive),
        'поддержка',
        'пожертвования',
        'проекты',
        'организации'
      ]),
      'og_title' => $mainSiteSettings->og_title ?: $mainSiteSettings->site_name . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
      'og_description' => $mainSiteSettings->og_description ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее',
      'og_type' => $mainSiteSettings->og_type,
      'og_image' => $mainSiteSettings->og_image ?: asset('images/og-image.jpg'),
      'twitter_card' => $mainSiteSettings->twitter_card,
      'twitter_title' => $mainSiteSettings->twitter_title ?: $mainSiteSettings->site_name . ' - Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative),
      'twitter_description' => $mainSiteSettings->twitter_description ?: 'Поддерживай ' . mb_strtolower($globalSettings->org_plural_nominative) . ' города — укрепляй будущее',
      'twitter_image' => $mainSiteSettings->twitter_image ?: asset('images/twitter-image.jpg'),
    ];

    // Получаем популярные организации
    $popularOrganizations = Organization::with(['domains', 'projects'])
      ->where('status', 'active')
      ->limit(8)
      ->get();

    // Получаем топ регионов по пожертвованиям
    $topRegions = Organization::selectRaw('regions.name as region_name, SUM(organization_projects.target_amount) as total_amount, COUNT(DISTINCT organizations.id) as organizations_count')
      ->join('organization_projects', 'organizations.id', '=', 'organization_projects.organization_id')
      ->join('regions', 'organizations.region_id', '=', 'regions.id')
      ->where('organizations.status', 'active')
      ->groupBy('regions.id', 'regions.name')
      ->orderBy('total_amount', 'desc')
      ->limit(10)
      ->get();

    // Получаем активные проекты
    $activeProjects = OrganizationProject::with('organization')
      ->where('status', 'active')
      ->limit(6)
      ->get();

    // Получаем слайдеры для главной страницы
    $sliderService = new SliderService();
    $heroSliders = $sliderService->getSlidersByPosition(Organization::first(), 'hero');
    $contentSliders = $sliderService->getSlidersByPosition(Organization::first(), 'content');

    return Inertia::render('Home', [
      'stats' => $stats,
      'popularOrganizations' => InertiaResource::list($popularOrganizations, OrganizationResource::class),
      'topRegions' => InertiaResource::list($topRegions, RegionStatResource::class),
      'activeProjects' => InertiaResource::list($activeProjects, OrganizationProjectResource::class),
      'seo' => $seoData,
      'mainSiteSettings' => $mainSiteSettings,
      'globalSettings' => $globalSettings,
      'terminology' => [
        'site_name' => $mainSiteSettings->site_name,
        'site_description' => $mainSiteSettings->site_description,
        'org_plural' => $globalSettings->org_plural_nominative,
        'org_genitive' => $globalSettings->org_plural_genitive,
        'support_action' => $globalSettings->action_support,
      ],
      'heroSliders' => $heroSliders,
      'contentSliders' => $contentSliders,
    ]);
  }
}
