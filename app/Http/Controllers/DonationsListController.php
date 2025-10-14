<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DonationsListController extends Controller
{
  /**
   * Получить список пожертвований для организации
   */
  public function getDonationsList(Request $request, Organization $organization): JsonResponse
  {
    $perPage = $request->get('per_page', 10);
    $search = $request->get('search');
    $sortBy = $request->get('sort_by', 'date');
    $sortOrder = $request->get('sort_order', 'desc');

    // Получаем пожертвования с данными о регионах
    $query = Donation::query()
      ->select([
        'donations.*',
        'regions.name as region_name'
      ])
      ->leftJoin('regions', 'donations.region_id', '=', 'regions.id')
      ->where('donations.organization_id', $organization->id)
      ->where('donations.status', 'completed');

    // Поиск
    if ($search) {
      $query->where(function ($q) use ($search) {
        $q->where('donations.donor_name', 'like', "%{$search}%")
          ->orWhere('donations.donor_email', 'like', "%{$search}%")
          ->orWhere('donations.donor_phone', 'like', "%{$search}%")
          ->orWhere('regions.name', 'like', "%{$search}%");
      });
    }

    // Сортировка
    switch ($sortBy) {
      case 'amount':
        $query->orderBy('donations.amount', $sortOrder);
        break;
      case 'donor_name':
        $query->orderBy('donations.donor_name', $sortOrder);
        break;
      case 'date':
      default:
        $query->orderBy('donations.created_at', $sortOrder);
        break;
    }

    $donations = $query->paginate($perPage);

    // Форматируем данные для фронтенда
    $formattedDonations = $donations->map(function ($donation) {
      return [
        'id' => $donation->id,
        'amount' => $donation->amount,
        'donor_name' => $donation->donor_name,
        'donor_email' => $donation->donor_email,
        'donor_phone' => $donation->donor_phone,
        'is_anonymous' => $donation->is_anonymous,
        'payment_method' => $donation->payment_method,
        'status' => $donation->status,
        'created_at' => $donation->created_at->toISOString(),
        'region_name' => $donation->region_name,
        'message' => $donation->message,
      ];
    });

    return response()->json([
      'success' => true,
      'data' => $formattedDonations,
      'pagination' => [
        'current_page' => $donations->currentPage(),
        'last_page' => $donations->lastPage(),
        'per_page' => $donations->perPage(),
        'total' => $donations->total(),
      ],
    ]);
  }

  /**
   * Получить статистику пожертвований
   */
  public function getDonationsStats(Request $request, Organization $organization): JsonResponse
  {
    $totalDonations = Donation::where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->count();

    $totalAmount = Donation::where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->sum('amount');

    $recentDonations = Donation::where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->where('created_at', '>=', now()->subDays(30))
      ->count();

    $recentAmount = Donation::where('organization_id', $organization->id)
      ->where('status', 'completed')
      ->where('created_at', '>=', now()->subDays(30))
      ->sum('amount');

    return response()->json([
      'success' => true,
      'stats' => [
        'total_donations' => $totalDonations,
        'total_amount' => $totalAmount,
        'recent_donations' => $recentDonations,
        'recent_amount' => $recentAmount,
      ],
    ]);
  }
}
