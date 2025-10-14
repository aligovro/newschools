<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class RegionRatingController extends Controller
{
  /**
   * Получить рейтинг регионов по пожертвованиям для организации
   */
  public function getRegionRating(Request $request, Organization $organization): JsonResponse
  {
    $perPage = $request->get('per_page', 10);
    $search = $request->get('search');
    $sortBy = $request->get('sort_by', 'amount');
    $sortOrder = $request->get('sort_order', 'desc');

    // Получаем регионы с данными о пожертвованиях
    $query = Region::query()
      ->select([
        'regions.*',
        'donation_stats.total_amount',
        'donation_stats.donation_count',
        'donation_stats.change_amount',
        'donation_stats.change_count'
      ])
      ->leftJoinSub(
        $this->getDonationStatsSubquery($organization->id),
        'donation_stats',
        'regions.id',
        '=',
        'donation_stats.region_id'
      )
      ->where('regions.is_active', true);

    // Поиск по названию региона
    if ($search) {
      $query->where('regions.name', 'like', "%{$search}%");
    }

    // Сортировка
    switch ($sortBy) {
      case 'count':
        $query->orderBy('donation_stats.donation_count', $sortOrder);
        break;
      case 'name':
        $query->orderBy('regions.name', $sortOrder);
        break;
      case 'amount':
      default:
        $query->orderBy('donation_stats.total_amount', $sortOrder);
        break;
    }

    // Дополнительная сортировка для одинаковых значений
    $query->orderBy('regions.name', 'asc');

    $regions = $query->paginate($perPage);

    // Форматируем данные для фронтенда
    $formattedRegions = $regions->map(function ($region) {
      return [
        'id' => $region->id,
        'name' => $region->name,
        'code' => $region->code,
        'flag_image' => null, // Пока нет поля flag_image в существующей таблице
        'total_amount' => (int) ($region->total_amount ?? 0),
        'donation_count' => (int) ($region->donation_count ?? 0),
        'change_amount' => $region->change_amount ? (int) $region->change_amount : null,
        'change_count' => $region->change_count ? (int) $region->change_count : null,
        'region_url' => null, // Пока нет поля region_url в существующей таблице
      ];
    });

    return response()->json([
      'success' => true,
      'data' => $formattedRegions,
      'pagination' => [
        'current_page' => $regions->currentPage(),
        'last_page' => $regions->lastPage(),
        'per_page' => $regions->perPage(),
        'total' => $regions->total(),
      ],
    ]);
  }

  /**
   * Получить статистику пожертвований по регионам
   */
  private function getDonationStatsSubquery(int $organizationId): \Illuminate\Database\Query\Builder
  {
    return DB::table('donations')
      ->select([
        'donations.region_id',
        DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
        DB::raw('COUNT(*) as donation_count'),
        DB::raw('COALESCE(SUM(CASE WHEN donations.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN donations.amount ELSE 0 END), 0) as change_amount'),
        DB::raw('COUNT(CASE WHEN donations.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as change_count')
      ])
      ->where('donations.organization_id', $organizationId)
      ->where('donations.status', 'completed')
      ->whereNotNull('donations.region_id')
      ->groupBy('donations.region_id');
  }

  /**
   * Получить общую статистику по регионам
   */
  public function getRegionStats(Request $request, Organization $organization): JsonResponse
  {
    $totalRegions = Region::count();
    $activeRegions = DB::table('donations')
      ->where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->whereNotNull('region_id')
      ->distinct('region_id')
      ->count('region_id');

    $totalAmount = DB::table('donations')
      ->where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->sum('amount');

    $totalDonations = DB::table('donations')
      ->where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->count();

    return response()->json([
      'success' => true,
      'data' => [
        'total_regions' => $totalRegions,
        'active_regions' => $activeRegions,
        'total_amount' => (int) $totalAmount,
        'total_donations' => $totalDonations,
        'average_per_region' => $activeRegions > 0 ? (int) ($totalAmount / $activeRegions) : 0,
      ],
    ]);
  }
}
