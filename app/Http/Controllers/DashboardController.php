<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Organization;
use App\Models\OrganizationDomain;
use App\Http\Resources\UserBriefResource;
use App\Http\Resources\OrganizationResource;
use App\Support\InertiaResource;
use App\Services\GlobalSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
  public function index(GlobalSettingsService $globalSettings)
  {
    // Получаем статистику для dashboard
    $stats = [
      'totalUsers' => User::count(),
      'totalOrganizations' => Organization::count(),
      'totalSites' => \App\Models\OrganizationSite::count(),
      'totalTemplates' => \App\Models\SiteTemplate::count(),
      'totalWidgets' => \App\Models\Widget::count(),
      'totalDonations' => \App\Models\Donation::count(),
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

    // Получаем терминологию через сервис
    $terminology = [
      'dashboard_title' => $globalSettings->getText('dashboard_title'),
      'total_organizations' => $globalSettings->getText('total_organizations'),
      'total_members' => $globalSettings->getText('total_members'),
      'recent_organizations' => $globalSettings->getText('recent_organizations'),
      'recent_members' => $globalSettings->getText('recent_members'),
      'create_organization' => $globalSettings->getText('create_organization'),
      'manage_organizations' => $globalSettings->getText('organizations_page_title'),
      'global_settings' => 'Глобальные настройки',
      'global_settings_description' => 'Управление терминологией и настройками системы',
    ];

    return Inertia::render('Dashboard', [
      'stats' => $stats,
      'terminology' => $terminology,
    ]);
  }
}
