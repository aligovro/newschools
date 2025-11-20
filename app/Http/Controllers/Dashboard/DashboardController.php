<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Enums\SiteStatus;
use App\Http\Resources\UserBriefResource;
use App\Http\Resources\OrganizationResource;
use App\Models\User;
use App\Models\Organization;
use App\Models\Domain;
use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\Widget;
use App\Models\Donation;
use App\Services\GlobalSettingsService;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(GlobalSettingsService $globalSettings)
    {
        // Получаем статистику для dashboard
        $stats = [
            'totalUsers' => User::count(),
            'totalOrganizations' => Organization::count(),
            'totalSites' => Site::count(),
            'totalTemplates' => SiteTemplate::count(),
            'totalWidgets' => Widget::count(),
            'totalDonations' => Donation::count(),
            'userGrowth' => 0, // Пока нет API для роста
            'donationGrowth' => 0,
            'siteGrowth' => 0,
            'organizationGrowth' => 0,
            'recentUsers' => InertiaResource::list(
                User::with(['roles', 'permissions'])
                    ->latest()
                    ->limit(5)
                    ->get(),
                UserBriefResource::class
            ),
            'recentOrganizations' => InertiaResource::list(
                Organization::latest()
                    ->limit(5)
                    ->get(),
                OrganizationResource::class
            ),
        ];

        // Получаем базовую терминологию
        $baseTerminology = $globalSettings->getTerminology();

        // Добавляем специфичные для dashboard поля
        $terminology = array_merge($baseTerminology, [
            'dashboard_title' => $globalSettings->getText('dashboard_title'),
            'total_organizations' => $globalSettings->getText('total_organizations'),
            'total_members' => $globalSettings->getText('total_members'),
            'recent_organizations' => $globalSettings->getText('recent_organizations'),
            'recent_members' => $globalSettings->getText('recent_members'),
            'create_organization' => $globalSettings->getText('create_organization'),
            'manage_organizations' => $globalSettings->getText('organizations_page_title'),
            'global_settings' => 'Глобальные настройки',
            'global_settings_description' => 'Управление терминологией и настройками системы',
        ]);

        // Получаем фавиконку главного сайта
        $mainSite = Site::where('site_type', 'main')
            ->where('status', SiteStatus::Published)
            ->where('is_public', true)
            ->first();

        $favicon = $mainSite ? $mainSite->getFaviconUrlAttribute() : null;

        // Получаем ID главного сайта для ссылок
        $mainSiteId = $mainSite ? $mainSite->id : null;

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'terminology' => $terminology,
            'favicon' => $favicon,
            'mainSiteId' => $mainSiteId,
        ]);
    }

    /**
     * Страница статистики
     */
    public function statistics()
    {
        return Inertia::render('dashboard/statistics/StatisticsPage');
    }

    /**
     * Страница настроек
     */
    public function settings(GlobalSettingsService $globalSettings)
    {
        $mainSite = Site::where('site_type', 'main')->first();

        return Inertia::render('dashboard/settings/SettingsPage', [
            'globalSettings' => $globalSettings->getSettings(),
            'userSettings' => Auth::user(),
            'mainSiteId' => $mainSite?->id,
        ]);
    }
}
