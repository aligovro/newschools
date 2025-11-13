<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AlumniStatsController extends Controller
{
    /**
     * Получить статистику выпускников
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->integer('organization_id');
        if ($organizationId !== null && $organizationId <= 0) {
            $organizationId = null;
        }

        $cacheKey = $organizationId
            ? "alumni_stats_org_{$organizationId}"
            : 'alumni_stats_all';

        $stats = Cache::remember(
            $cacheKey,
            now()->addMinutes(5),
            function () use ($organizationId) {
                $donationsQuery = Donation::query()
                    ->completed();

                if ($organizationId) {
                    $donationsQuery->where('organization_id', $organizationId);
                }

                $donationsAggregate = (clone $donationsQuery)
                    ->selectRaw('COALESCE(SUM(amount), 0) as total_donated')
                    ->first();

                $totalDonated = (int) ($donationsAggregate->total_donated ?? 0);

                $supportersCount = (int) (clone $donationsQuery)
                    ->whereNotNull('donor_id')
                    ->distinct()
                    ->count('donor_id');

                $projectsQuery = Project::query()
                    ->where('status', 'completed');

                if ($organizationId) {
                    $projectsQuery->where('organization_id', $organizationId);
                }

                return [
                    'supporters_count' => $supportersCount,
                    'total_donated' => $totalDonated,
                    'projects_count' => (int) $projectsQuery->count(),
                ];
            }
        );

        return response()->json($stats);
    }
}
