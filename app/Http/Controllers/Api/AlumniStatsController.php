<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AlumniStatsController extends Controller
{
  /**
   * Получить статистику выпускников
   *
   * @param Request $request
   * @return JsonResponse
   */
  public function index(Request $request): JsonResponse
  {
    $organizationId = $request->query('organization_id');

    // Получаем базовый запрос для пожертвований
    $donationsQuery = DB::table('donations')
      ->where('status', 'completed')
      ->whereNotNull('donor_id');

    // Если указан organization_id, фильтруем по организации
    if ($organizationId) {
      $donationsQuery->where('organization_id', $organizationId);
    }

    // Количество уникальных поддерживающих людей (используем подзапрос для корректного подсчета)
    $supportersCount = (int) DB::table('donations')
      ->where('status', 'completed')
      ->whereNotNull('donor_id')
      ->when($organizationId, function ($query) use ($organizationId) {
        return $query->where('organization_id', $organizationId);
      })
      ->distinct()
      ->count('donor_id');

    // Сумма всех пожертвований в копейках, конвертируем в рубли
    $totalDonated = $donationsQuery->sum('amount') ?? 0;

    // Получаем запрос для проектов
    $projectsQuery = DB::table('projects');

    if ($organizationId) {
      $projectsQuery->where('organization_id', $organizationId);
    }

    // Количество реализованных проектов (статус completed)
    $projectsCount = $projectsQuery
      ->where('status', 'completed')
      ->count();

    return response()->json([
      'supporters_count' => $supportersCount,
      'total_donated' => $totalDonated,
      'projects_count' => $projectsCount,
    ]);
  }
}
