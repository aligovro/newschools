<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\User;
use App\Models\Donation;
use App\Models\OrganizationProject;
use App\Services\SliderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HomeController extends Controller
{
  public function index()
  {
    // Получаем статистику для главной страницы
    $stats = [
      'totalUsers' => User::count(),
      'totalOrganizations' => Organization::where('status', 'active')->count(),
      'totalDonations' => Donation::where('status', 'completed')->sum('amount') ?? 0,
      'totalProjects' => OrganizationProject::where('status', 'active')->count(),
    ];

    // Получаем конфигурацию типов организаций
    $organizationTypes = config('organizations.types', []);
    $defaultType = config('organizations.default_type', 'school');
    $currentTypeConfig = $organizationTypes[$defaultType] ?? $organizationTypes['school'];

    // SEO мета-данные
    $seoData = [
      'title' => config('app.name', 'Платформа поддержки') . ' - Поддерживай ' . mb_strtolower($currentTypeConfig['plural']),
      'description' => 'Поддерживай ' . mb_strtolower($currentTypeConfig['plural']) . ' города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
      'keywords' => implode(', ', array_merge(
        array_map(function ($type) {
          return mb_strtolower($type['plural'] ?? $type['name'] ?? '');
        }, array_values($organizationTypes)),
        ['поддержка', 'пожертвования', 'проекты', 'организации']
      )),
      'og_title' => config('app.name', 'Платформа поддержки') . ' - Поддерживай ' . mb_strtolower($currentTypeConfig['plural']),
      'og_description' => 'Поддерживай ' . mb_strtolower($currentTypeConfig['plural']) . ' города — укрепляй будущее',
      'og_type' => 'website',
      'og_image' => asset('images/og-image.jpg'),
      'twitter_card' => 'summary_large_image',
      'twitter_title' => config('app.name', 'Платформа поддержки') . ' - Поддерживай ' . mb_strtolower($currentTypeConfig['plural']),
      'twitter_description' => 'Поддерживай ' . mb_strtolower($currentTypeConfig['plural']) . ' города — укрепляй будущее',
      'twitter_image' => asset('images/twitter-image.jpg'),
    ];

    // Получаем популярные организации
    $popularOrganizations = Organization::with(['domains', 'projects'])
      ->where('status', 'active')
      ->limit(8)
      ->get()
      ->map(function ($org) {
        return [
          'id' => $org->id,
          'name' => $org->name,
          'description' => $org->description,
          'address' => $org->address,
          'image' => $org->image_url,
          'projects_count' => $org->projects->count(),
          'donations_total' => $org->projects->sum('target_amount') ?? 0,
          'donations_collected' => $org->projects->sum('collected_amount') ?? 0,
        ];
      });

    // Получаем топ регионов по пожертвованиям
    $topRegions = Organization::selectRaw('regions.name as region_name, SUM(organization_projects.target_amount) as total_amount, COUNT(DISTINCT organizations.id) as organizations_count')
      ->join('organization_projects', 'organizations.id', '=', 'organization_projects.organization_id')
      ->join('regions', 'organizations.region_id', '=', 'regions.id')
      ->where('organizations.status', 'active')
      ->groupBy('regions.id', 'regions.name')
      ->orderBy('total_amount', 'desc')
      ->limit(10)
      ->get()
      ->map(function ($region) {
        return [
          'name' => $region->region_name,
          'total_amount' => $region->total_amount ?? 0,
          'organizations_count' => $region->organizations_count,
        ];
      });

    // Получаем активные проекты
    $activeProjects = OrganizationProject::with('organization')
      ->where('status', 'active')
      ->limit(6)
      ->get()
      ->map(function ($project) {
        return [
          'id' => $project->id,
          'title' => $project->title,
          'description' => $project->description,
          'target_amount' => $project->target_amount,
          'collected_amount' => $project->collected_amount,
          'progress_percentage' => $project->target_amount > 0
            ? round(($project->collected_amount / $project->target_amount) * 100, 1)
            : 0,
          'organization_name' => $project->organization->name,
          'organization_address' => $project->organization->address,
          'image' => $project->image_url,
        ];
      });

    // Получаем слайдеры для главной страницы
    $sliderService = new SliderService();
    $heroSliders = $sliderService->getSlidersByPosition(Organization::first(), 'hero');
    $contentSliders = $sliderService->getSlidersByPosition(Organization::first(), 'content');

    return Inertia::render('Home', [
      'stats' => $stats,
      'popularOrganizations' => $popularOrganizations,
      'topRegions' => $topRegions,
      'activeProjects' => $activeProjects,
      'seo' => $seoData,
      'organizationTypes' => $organizationTypes,
      'currentTypeConfig' => $currentTypeConfig,
      'heroSliders' => $heroSliders,
      'contentSliders' => $contentSliders,
    ]);
  }
}
