<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CitySupportersService
{
    /**
     * Получить топ городов для организации
     */
    public function getTopCitiesForOrganization(
        Organization $organization,
        int $perPage = 6,
        string $search = '',
        string $sortBy = 'amount',
        string $sortOrder = 'desc'
    ): array {
        // Получаем версию кеша для организации
        $cacheVersion = Cache::get("city_supporters_org_{$organization->id}_version", 1);

        $cacheKey = "city_supporters_org_{$organization->id}_v{$cacheVersion}_" . md5(
            json_encode([
                'per_page' => $perPage,
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ])
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($organization, $perPage, $search, $sortBy, $sortOrder) {
            return $this->fetchTopCitiesForOrganization($organization, $perPage, $search, $sortBy, $sortOrder);
        });
    }

    /**
     * Получить топ городов публично (без привязки к организации)
     */
    public function getTopCitiesPublic(
        int $perPage = 6,
        string $search = '',
        string $sortBy = 'amount',
        string $sortOrder = 'desc'
    ): array {
        // Получаем версию публичного кеша
        $cacheVersion = Cache::get('city_supporters_public_version', 1);

        $cacheKey = "city_supporters_public_v{$cacheVersion}_" . md5(
            json_encode([
                'per_page' => $perPage,
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ])
        );

        return Cache::remember($cacheKey, now()->addMinutes(5), function () use ($perPage, $search, $sortBy, $sortOrder) {
            return $this->fetchTopCitiesPublic($perPage, $search, $sortBy, $sortOrder);
        });
    }

    /**
     * Получить данные топ городов для организации (без кеширования)
     */
    private function fetchTopCitiesForOrganization(
        Organization $organization,
        int $perPage,
        string $search,
        string $sortBy,
        string $sortOrder
    ): array {
        // Простой запрос: группируем донаты по locality_id
        $query = DB::table('donations')
            ->join('localities', 'localities.id', '=', 'donations.locality_id')
            ->leftJoin('regions', 'regions.id', '=', 'localities.region_id')
            ->where('donations.organization_id', $organization->id)
            ->where('donations.status', 'completed')
            ->whereNotNull('donations.locality_id')
            ->select([
                'localities.id as id',
                'localities.name as name',
                'regions.name as region_name',
                DB::raw('COUNT(DISTINCT donations.donor_id) as supporters_count'),
                DB::raw('COUNT(donations.id) as donation_count'),
                DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
            ])
            ->groupBy('localities.id', 'localities.name', 'regions.name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('localities.name', 'like', "%{$search}%")
                    ->orWhere('regions.name', 'like', "%{$search}%");
            });
        }

        // Сортировка
        switch ($sortBy) {
            case 'supporters':
                $query->orderBy('supporters_count', $sortOrder);
                break;
            case 'name':
                $query->orderBy('localities.name', $sortOrder);
                break;
            case 'amount':
            default:
                $query->orderBy('total_amount', $sortOrder);
                break;
        }

        $query->orderBy('localities.name', 'asc');

        $results = $query->paginate($perPage);
        $cityIds = $results->pluck('id')->toArray();

        // Подсчитываем дополнительные метрики
        $schoolsCounts = $this->calculateSchoolsCount($organization->id, $cityIds);
        $alumniCounts = $this->calculateAlumniCount($organization->id, $cityIds);
        $subscriptionsCounts = $this->calculateSubscriptionsCount($cityIds);

        // Применяем сортировку по schools_count, если нужно
        if ($sortBy === 'schools') {
            $results->getCollection()->transform(function ($row) use ($schoolsCounts) {
                $row->schools_count = $schoolsCounts[$row->id] ?? 0;
                return $row;
            });

            $sorted = $results->getCollection()->sortBy(function ($row) use ($sortOrder) {
                return $row->schools_count;
            }, SORT_REGULAR, $sortOrder === 'desc');

            $results->setCollection($sorted->values());
        }

        $data = $results->map(function ($row) use ($alumniCounts, $subscriptionsCounts, $schoolsCounts) {
            return [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'region_name' => (string) ($row->region_name ?? ''),
                'schools_count' => isset($schoolsCounts[$row->id]) ? (int) $schoolsCounts[$row->id] : 0,
                'supporters_count' => (int) ($row->supporters_count ?? 0),
                'donation_count' => (int) ($row->donation_count ?? 0),
                'total_amount' => (int) ($row->total_amount ?? 0),
                'alumni_count' => $alumniCounts[$row->id] ?? null,
                'subscriptions_count' => isset($subscriptionsCounts[$row->id]) ? (int) $subscriptionsCounts[$row->id] : 0,
            ];
        });

        // Не показываем города без школ (schools_count = 0),
        // чтобы не выводить записи вида "0 школ" при наличии только исторических донатов.
        $data = $data->filter(function (array $row) {
            return ($row['schools_count'] ?? 0) > 0;
        })->values();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ];
    }

    /**
     * Получить данные топ городов публично (без кеширования)
     */
    private function fetchTopCitiesPublic(
        int $perPage,
        string $search,
        string $sortBy,
        string $sortOrder
    ): array {
        $query = DB::table('donations')
            ->join('localities', 'localities.id', '=', 'donations.locality_id')
            ->leftJoin('regions', 'regions.id', '=', 'localities.region_id')
            ->where('donations.status', 'completed')
            ->whereNotNull('donations.locality_id')
            ->select([
                'localities.id as id',
                'localities.name as name',
                'regions.name as region_name',
                DB::raw('COUNT(DISTINCT donations.donor_id) as supporters_count'),
                DB::raw('COUNT(donations.id) as donation_count'),
                DB::raw('COALESCE(SUM(donations.amount), 0) as total_amount'),
            ])
            ->groupBy('localities.id', 'localities.name', 'regions.name');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('localities.name', 'like', "%{$search}%")
                    ->orWhere('regions.name', 'like', "%{$search}%");
            });
        }

        switch ($sortBy) {
            case 'supporters':
                $query->orderBy('supporters_count', $sortOrder);
                break;
            case 'name':
                $query->orderBy('localities.name', $sortOrder);
                break;
            case 'amount':
            default:
                $query->orderBy('total_amount', $sortOrder);
                break;
        }

        $query->orderBy('localities.name', 'asc');

        $results = $query->paginate($perPage);
        $cityIds = $results->pluck('id')->toArray();

        $schoolsCounts = $this->calculateSchoolsCountPublic($cityIds);
        $alumniCounts = $this->calculateAlumniCountPublic($cityIds);
        $subscriptionsCounts = $this->calculateSubscriptionsCount($cityIds);

        if ($sortBy === 'schools') {
            $results->getCollection()->transform(function ($row) use ($schoolsCounts) {
                $row->schools_count = $schoolsCounts[$row->id] ?? 0;
                return $row;
            });

            $sorted = $results->getCollection()->sortBy(function ($row) use ($sortOrder) {
                return $row->schools_count;
            }, SORT_REGULAR, $sortOrder === 'desc');

            $results->setCollection($sorted->values());
        }

        $data = $results->map(function ($row) use ($alumniCounts, $subscriptionsCounts, $schoolsCounts) {
            return [
                'id' => (int) $row->id,
                'name' => (string) $row->name,
                'region_name' => (string) ($row->region_name ?? ''),
                'schools_count' => isset($schoolsCounts[$row->id]) ? (int) $schoolsCounts[$row->id] : 0,
                'supporters_count' => (int) ($row->supporters_count ?? 0),
                'donation_count' => (int) ($row->donation_count ?? 0),
                'total_amount' => (int) ($row->total_amount ?? 0),
                'alumni_count' => $alumniCounts[$row->id] ?? null,
                'subscriptions_count' => isset($subscriptionsCounts[$row->id]) ? (int) $subscriptionsCounts[$row->id] : 0,
            ];
        });

        // Для публичного топа тоже скрываем города без школ.
        $data = $data->filter(function (array $row) {
            return ($row['schools_count'] ?? 0) > 0;
        })->values();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ];
    }

    /**
     * Подсчитать количество школ в городах (для организации)
     * Школы = уникальные организации в городе:
     * 1. Организации доноров (через organization_users)
     * 2. Сама организация-получатель доната (если она в этом городе)
     */
    private function calculateSchoolsCount(int $organizationId, array $cityIds): array
    {
        if (empty($cityIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($cityIds), '?'));
        $params = array_merge([$organizationId], $cityIds);

        // Организации доноров (через organization_users)
        $schoolsFromDonors = DB::select("
            SELECT donor_orgs.locality_id, COUNT(DISTINCT donor_orgs.id) as schools_count
            FROM donations
            JOIN organization_users ON organization_users.user_id = donations.donor_id
            JOIN organizations as donor_orgs ON donor_orgs.id = organization_users.organization_id
            WHERE donations.organization_id = ?
                AND donations.status = 'completed'
                AND donor_orgs.locality_id IN ($placeholders)
            GROUP BY donor_orgs.locality_id
        ", $params);

        // Объединяем результаты
        $result = [];
        foreach ($schoolsFromDonors as $stat) {
            $result[$stat->locality_id] = (int) $stat->schools_count;
        }

        // Добавляем саму организацию-получатель (если она в городе из списка)
        $organization = Organization::find($organizationId);
        if ($organization && $organization->locality_id && in_array($organization->locality_id, $cityIds)) {
            $hasDonations = DB::table('donations')
                ->where('organization_id', $organizationId)
                ->where('status', 'completed')
                ->where('locality_id', $organization->locality_id)
                ->exists();

            if ($hasDonations) {
                if (!isset($result[$organization->locality_id])) {
                    $result[$organization->locality_id] = 1;
                } else {
                    $result[$organization->locality_id] = max($result[$organization->locality_id], 1);
                }
            }
        }

        return $result;
    }

    /**
     * Подсчитать количество школ в городах (публично)
     * Школы = уникальные организации в городе:
     * 1. Организации доноров (через organization_users)
     * 2. Организации-получатели донатов (если они в этом городе)
     */
    private function calculateSchoolsCountPublic(array $cityIds): array
    {
        if (empty($cityIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($cityIds), '?'));
        $params = array_merge($cityIds, $cityIds, $cityIds);

        // Считаем уникальные организации из обоих источников одним запросом
        $schoolsStats = DB::select("
            SELECT locality_id, COUNT(DISTINCT org_id) as schools_count
            FROM (
                SELECT DISTINCT donor_orgs.locality_id, donor_orgs.id as org_id
                FROM donations
                JOIN organization_users ON organization_users.user_id = donations.donor_id
                JOIN organizations as donor_orgs ON donor_orgs.id = organization_users.organization_id
                WHERE donations.status = 'completed'
                    AND donor_orgs.locality_id IN ($placeholders)

                UNION

                SELECT DISTINCT organizations.locality_id, organizations.id as org_id
                FROM donations
                JOIN organizations ON organizations.id = donations.organization_id
                WHERE donations.status = 'completed'
                    AND donations.locality_id IN ($placeholders)
                    AND organizations.locality_id IN ($placeholders)
            ) as combined_orgs
            GROUP BY locality_id
        ", $params);

        $result = [];
        foreach ($schoolsStats as $stat) {
            $result[$stat->locality_id] = (int) $stat->schools_count;
        }

        return $result;
    }

    /**
     * Подсчитать количество выпускников в городах (для организации)
     */
    private function calculateAlumniCount(int $organizationId, array $cityIds): array
    {
        if (empty($cityIds)) {
            return [];
        }

        $alumniStats = DB::table('donations')
            ->join('organization_users', 'organization_users.user_id', '=', 'donations.donor_id')
            ->join('organizations as donor_orgs', 'donor_orgs.id', '=', 'organization_users.organization_id')
            ->where('donations.organization_id', $organizationId)
            ->where('donations.status', 'completed')
            ->whereNotNull('donations.donor_id')
            ->whereIn('donor_orgs.locality_id', $cityIds)
            ->groupBy('donor_orgs.locality_id')
            ->select('donor_orgs.locality_id', DB::raw('COUNT(DISTINCT donations.donor_id) as alumni_count'))
            ->pluck('alumni_count', 'locality_id')
            ->toArray();

        $result = [];
        foreach ($alumniStats as $localityId => $count) {
            $result[$localityId] = (int) $count;
        }

        return $result;
    }

    /**
     * Подсчитать количество выпускников в городах (публично)
     */
    private function calculateAlumniCountPublic(array $cityIds): array
    {
        if (empty($cityIds)) {
            return [];
        }

        $alumniStats = DB::table('donations')
            ->join('organization_users', 'organization_users.user_id', '=', 'donations.donor_id')
            ->join('organizations as donor_orgs', 'donor_orgs.id', '=', 'organization_users.organization_id')
            ->where('donations.status', 'completed')
            ->whereNotNull('donations.donor_id')
            ->whereIn('donor_orgs.locality_id', $cityIds)
            ->groupBy('donor_orgs.locality_id')
            ->select('donor_orgs.locality_id', DB::raw('COUNT(DISTINCT donations.donor_id) as alumni_count'))
            ->pluck('alumni_count', 'locality_id')
            ->toArray();

        $result = [];
        foreach ($alumniStats as $localityId => $count) {
            $result[$localityId] = (int) $count;
        }

        return $result;
    }

    /**
     * Подсчитать количество подписчиков (спонсоров) в городах
     */
    private function calculateSubscriptionsCount(array $cityIds): array
    {
        if (empty($cityIds)) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($cityIds), '?'));

        $subscriptionsStats = DB::select("
            SELECT organizations.locality_id, COUNT(DISTINCT organization_users.user_id) as subscriptions_count
            FROM organization_users
            JOIN organizations ON organizations.id = organization_users.organization_id
            WHERE organization_users.role = 'sponsor'
                AND organization_users.status = 'active'
                AND organizations.locality_id IN ($placeholders)
            GROUP BY organizations.locality_id
        ", $cityIds);

        $result = [];
        foreach ($subscriptionsStats as $stat) {
            $result[$stat->locality_id] = (int) $stat->subscriptions_count;
        }

        return $result;
    }

    /**
     * Очистить кеш для организации
     * Использует версионирование кеша для эффективной очистки всех вариантов
     */
    public static function clearCacheForOrganization(int $organizationId): void
    {
        // Инкрементируем версию кеша, что автоматически инвалидирует все старые ключи
        $currentVersion = Cache::get("city_supporters_org_{$organizationId}_version", 1);
        Cache::forever("city_supporters_org_{$organizationId}_version", $currentVersion + 1);
    }

    /**
     * Очистить публичный кеш
     * Использует версионирование кеша для эффективной очистки всех вариантов
     */
    public static function clearPublicCache(): void
    {
        // Инкрементируем версию кеша, что автоматически инвалидирует все старые ключи
        $currentVersion = Cache::get('city_supporters_public_version', 1);
        Cache::forever('city_supporters_public_version', $currentVersion + 1);
    }
}
