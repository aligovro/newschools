<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\Donation;
use App\Models\Organization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CitySupportersController extends Controller
{
    /**
     * Получить топ поддерживающих городов для организации
     */
    public function getTopCities(Request $request, Organization $organization): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = trim((string) $request->get('search', ''));
        $sortBy = $request->get('sort_by', 'amount'); // amount | supporters | schools | name
        $sortOrder = $request->get('sort_order', 'desc');

        // Собираем агрегаты по городам на основе пожертвований организации
        $base = DB::table('donations')
            ->select([
                'organizations.city_id as city_id',
                DB::raw('COUNT(DISTINCT donations.donor_id) as supporters_count'),
                DB::raw('COUNT(donations.id) as donation_count'),
                DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
                DB::raw('COUNT(DISTINCT organizations.id) as schools_count'),
            ])
            ->join('organizations', 'organizations.id', '=', 'donations.organization_id')
            ->where('donations.organization_id', $organization->id)
            ->where('donations.status', 'completed')
            ->whereNotNull('organizations.city_id')
            ->groupBy('organizations.city_id');

        // Присоединяем города
        $query = DB::query()
            ->fromSub($base, 'city_stats')
            ->join('cities', 'cities.id', '=', 'city_stats.city_id')
            ->leftJoin('regions', 'regions.id', '=', 'cities.region_id')
            ->select([
                'cities.id as id',
                'cities.name as name',
                'regions.name as region_name',
                'city_stats.supporters_count',
                'city_stats.donation_count',
                'city_stats.total_amount',
                'city_stats.schools_count',
            ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('cities.name', 'like', "%{$search}%")
                    ->orWhere('regions.name', 'like', "%{$search}%");
            });
        }

        // Сортировка
        switch ($sortBy) {
            case 'supporters':
                $query->orderBy('city_stats.supporters_count', $sortOrder);
                break;
            case 'schools':
                $query->orderBy('city_stats.schools_count', $sortOrder);
                break;
            case 'name':
                $query->orderBy('cities.name', $sortOrder);
                break;
            case 'amount':
            default:
                $query->orderBy('city_stats.total_amount', $sortOrder);
                break;
        }

        // Дополнительная сортировка
        $query->orderBy('cities.name', 'asc');

        $results = $query->paginate($perPage);

        $data = $results->map(function ($row) {
            return [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'region_name' => (string) ($row->region_name ?? ''),
                'schools_count' => (int) ($row->schools_count ?? 0),
                'supporters_count' => (int) ($row->supporters_count ?? 0),
                'donation_count' => (int) ($row->donation_count ?? 0),
                'total_amount' => (int) ($row->total_amount ?? 0),
                // Поля-заглушки под будущие метрики
                'alumni_count' => null,
                'subscriptions_count' => null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ]);
    }

    /**
     * Публичный топ поддерживающих городов без привязки к организации (для главного сайта)
     */
    public function getTopCitiesPublic(Request $request): JsonResponse
    {
        $perPage = (int) $request->get('per_page', 10);
        $search = trim((string) $request->get('search', ''));
        $sortBy = $request->get('sort_by', 'amount'); // amount | supporters | schools | name
        $sortOrder = $request->get('sort_order', 'desc');

        $base = DB::table('donations')
            ->select([
                'organizations.city_id as city_id',
                DB::raw('COUNT(DISTINCT donations.donor_id) as supporters_count'),
                DB::raw('COUNT(donations.id) as donation_count'),
                DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
                DB::raw('COUNT(DISTINCT organizations.id) as schools_count'),
            ])
            ->join('organizations', 'organizations.id', '=', 'donations.organization_id')
            ->where('donations.status', 'completed')
            ->whereNotNull('organizations.city_id')
            ->groupBy('organizations.city_id');

        $query = DB::query()
            ->fromSub($base, 'city_stats')
            ->join('cities', 'cities.id', '=', 'city_stats.city_id')
            ->leftJoin('regions', 'regions.id', '=', 'cities.region_id')
            ->select([
                'cities.id as id',
                'cities.name as name',
                'regions.name as region_name',
                'city_stats.supporters_count',
                'city_stats.donation_count',
                'city_stats.total_amount',
                'city_stats.schools_count',
            ]);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('cities.name', 'like', "%{$search}%")
                    ->orWhere('regions.name', 'like', "%{$search}%");
            });
        }

        switch ($sortBy) {
            case 'supporters':
                $query->orderBy('city_stats.supporters_count', $sortOrder);
                break;
            case 'schools':
                $query->orderBy('city_stats.schools_count', $sortOrder);
                break;
            case 'name':
                $query->orderBy('cities.name', $sortOrder);
                break;
            case 'amount':
            default:
                $query->orderBy('city_stats.total_amount', $sortOrder);
                break;
        }

        $query->orderBy('cities.name', 'asc');

        $results = $query->paginate($perPage);

        $data = $results->map(function ($row) {
            return [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'region_name' => (string) ($row->region_name ?? ''),
                'schools_count' => (int) ($row->schools_count ?? 0),
                'supporters_count' => (int) ($row->supporters_count ?? 0),
                'donation_count' => (int) ($row->donation_count ?? 0),
                'total_amount' => (int) ($row->total_amount ?? 0),
                'alumni_count' => null,
                'subscriptions_count' => null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ]);
    }
}
