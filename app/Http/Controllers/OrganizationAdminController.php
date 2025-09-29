<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationAdminController extends Controller
{
  public function __construct()
  {
    $this->middleware('auth');
  }

  /**
   * Главная страница админки организации
   */
  public function index(Organization $organization)
  {
    // Получаем статистику организации
    $stats = [
      'totalPages' => $organization->pages()->count(),
      'totalUsers' => $organization->users()->count(),
      'totalMenus' => $organization->menus()->count(),
      'totalSliders' => $organization->sliders()->count(),
      'totalDonations' => $organization->donations()->count(),
      'monthlyVisitors' => $organization->statistics()
        ->whereMonth('created_at', now()->month)
        ->sum('visitors'),
      'monthlyRevenue' => $organization->donations()
        ->whereMonth('created_at', now()->month)
        ->sum('amount'),
    ];

    return Inertia::render('organization/admin/OrganizationAdminDashboard', [
      'organization' => $organization,
      'stats' => $stats,
    ]);
  }

  /**
   * Управление меню организации
   */
  public function menus(Organization $organization)
  {
    $menus = $organization->menus()
      ->with(['items' => function ($query) {
        $query->whereNull('parent_id')
          ->with('children')
          ->orderBy('sort_order');
      }])
      ->get();

    $pages = $organization->publishedPages()
      ->select('id', 'title', 'slug')
      ->get();

    return Inertia::render('OrganizationMenuPage', [
      'organization' => $organization,
      'menus' => $menus,
      'locations' => \App\Models\OrganizationMenu::getAvailableLocations(),
      'pages' => $pages,
      'types' => \App\Models\OrganizationMenuItem::getAvailableTypes(),
    ]);
  }

  /**
   * Управление страницами организации
   */
  public function pages(Organization $organization)
  {
    $pages = $organization->pages()
      ->with('seo')
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return Inertia::render('OrganizationPagesPage', [
      'organization' => $organization,
      'pages' => $pages,
    ]);
  }

  /**
   * Создание новой страницы
   */
  public function createPage(Organization $organization)
  {
    return Inertia::render('OrganizationPageCreate', [
      'organization' => $organization,
    ]);
  }

  /**
   * Управление пользователями организации
   */
  public function users(Organization $organization)
  {
    $users = $organization->users()
      ->with('user')
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return Inertia::render('OrganizationUsersPage', [
      'organization' => $organization,
      'users' => $users,
    ]);
  }

  /**
   * Настройки организации
   */
  public function settings(Organization $organization)
  {
    $organization->load(['settings', 'seo', 'domains']);

    return Inertia::render('OrganizationSettingsPage', [
      'organization' => $organization,
    ]);
  }

  /**
   * Галерея организации
   */
  public function gallery(Organization $organization)
  {
    $media = $organization->media()
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return Inertia::render('OrganizationGalleryPage', [
      'organization' => $organization,
      'media' => $media,
    ]);
  }

  /**
   * Платежи и пожертвования
   */
  public function payments(Organization $organization)
  {
    $donations = $organization->donations()
      ->with(['member', 'paymentTransaction'])
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    $stats = [
      'totalAmount' => $organization->donations()->sum('amount'),
      'monthlyAmount' => $organization->donations()
        ->whereMonth('created_at', now()->month)
        ->sum('amount'),
      'totalCount' => $organization->donations()->count(),
    ];

    return Inertia::render('OrganizationPaymentsPage', [
      'organization' => $organization,
      'donations' => $donations,
      'stats' => $stats,
    ]);
  }

  /**
   * Аналитика организации
   */
  public function analytics(Organization $organization)
  {
    $statistics = $organization->statistics()
      ->orderBy('created_at', 'desc')
      ->limit(30)
      ->get();

    return Inertia::render('OrganizationAnalyticsPage', [
      'organization' => $organization,
      'statistics' => $statistics,
    ]);
  }
}
