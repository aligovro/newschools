<?php

namespace App\Services\ProjectDonations;

use App\Migrated\MigratedDonationsService;
use App\Enums\DonationStatus;
use App\Models\Donation;
use App\Models\Organization;
use App\Models\Project;
use App\Models\User;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProjectDonationsService
{
    public const PERIOD_WEEK = 'week';
    public const PERIOD_MONTH = 'month';
    public const PERIOD_ALL = 'all';

    public const DEFAULT_PER_PAGE = 20;
    public const MAX_PER_PAGE = 100;

    /**
     * Канонические подписи для топа «только выпуски» (виджет, снапшот из blagoqr).
     * Один источник правды для отображения.
     */
    public const LABEL_FRIENDS = 'Друзья лицея';
    public const LABEL_PARENTS = 'Родители';

    /**
     * Нормализует donor_label для режима «только выпуски»: «Выпуск X г.» и «Друзья лицея».
     * Возвращает null, если запись не показывать в топе (аноним, произвольное имя).
     */
    public static function normalizeDonorLabelGraduateOnly(?string $label): ?string
    {
        $s = trim($label ?? '');
        if ($s === '' || $s === 'Анонимное пожертвование') {
            return null;
        }
        if (preg_match('/^' . preg_quote(self::LABEL_FRIENDS, '/') . '$/ui', $s)) {
            return self::LABEL_FRIENDS;
        }
        if (preg_match('/^' . preg_quote(self::LABEL_PARENTS, '/') . '$/ui', $s)) {
            return self::LABEL_PARENTS;
        }
        if (preg_match('/^Выпуск\s+(\d{4})\s*г?\.?$/ui', $s, $m)) {
            return 'Выпуск ' . $m[1] . ' г.';
        }
        if (preg_match('/^(\d{4})$/u', $s)) {
            return 'Выпуск ' . $s . ' г.';
        }

        return null;
    }

    /**
     * Нормализует ключ из внешней системы (blagoqr: user_type или edu_year) в каноническую подпись для топа.
     * Используется при импорте, чтобы снапшот совпадал с правилами отображения в приложении.
     */
    public static function normalizeGraduateOnlyKey(?string $key): ?string
    {
        if ($key === null || $key === '') {
            return null;
        }
        $key = trim($key);
        $lower = mb_strtolower($key);
        if (in_array($lower, ['friend', 'friends'], true) || mb_strpos($lower, 'друзья') !== false) {
            return self::LABEL_FRIENDS;
        }
        if (in_array($lower, ['parent', 'parents'], true)) {
            return self::LABEL_PARENTS;
        }
        if (preg_match('/^\d{4}$/', $key)) {
            return 'Выпуск ' . $key . ' г.';
        }
        return self::normalizeDonorLabelGraduateOnly($key);
    }

    /**
     * Фильтрует и склеивает строки топа: только «Выпуск X г.» и «Друзья лицея».
     */
    private function filterAndMergeTopRowsGraduateOnly(array $rows, int $limit): array
    {
        $merged = [];
        foreach ($rows as $row) {
            $normalized = self::normalizeDonorLabelGraduateOnly($row['donor_label'] ?? '');
            if ($normalized === null) {
                continue;
            }
            if (! isset($merged[$normalized])) {
                $merged[$normalized] = [
                    'donor_label' => $normalized,
                    'total_amount' => 0,
                    'donations_count' => 0,
                ];
            }
            $merged[$normalized]['total_amount'] += (int) ($row['total_amount'] ?? 0);
            $merged[$normalized]['donations_count'] += (int) ($row['donations_count'] ?? 0);
        }
        uasort($merged, fn($a, $b) => $b['total_amount'] <=> $a['total_amount']);

        return array_values(array_slice(array_map(function ($r) {
            $r['total_amount_formatted'] = $this->formatRubles($r['total_amount']);

            return $r;
        }, $merged), 0, $limit));
    }

    /**
     * Топ поддержавших (по donor_name / выпуску) — сумма и количество платежей.
     * При $graduateOnly=true только «Выпуск X г.» и «Друзья лицея», без анонимных.
     */
    public function topByDonorName(Project $project, string $period = self::PERIOD_ALL, int $limit = 20, bool $graduateOnly = false): array
    {
        $fetchLimit = $graduateOnly ? min(100, $limit * 5) : $limit;
        $query = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                SUM(amount) as total_amount,
                COUNT(id) as donations_count
            ')
            ->where('project_id', $project->id)
            ->where('status', DonationStatus::Completed->value)
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'))
            ->orderByDesc('total_amount')
            ->limit($fetchLimit);

        $this->applyPeriodFilter($query, $period);

        $rows = $query->get()->map(function ($row) {
            return [
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
                'donations_count' => (int) $row->donations_count,
            ];
        })->toArray();

        if ($graduateOnly) {
            return $this->filterAndMergeTopRowsGraduateOnly($rows, $limit);
        }

        return $rows;
    }

    /**
     * Топ регулярно-поддерживающих (только recurring donations).
     * С пагинацией, duration_label и avatar для donor_id.
     */
    public function topRecurringByDonorName(
        Project $project,
        string $period = self::PERIOD_ALL,
        int $page = 1,
        int $perPage = 6,
        bool $graduateOnly = false,
    ): array {
        $recurringDonationIds = $this->getRecurringDonationIds($project->id, $period);

        if (empty($recurringDonationIds)) {
            return [
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $perPage,
                    'total' => 0,
                ],
            ];
        }

        $perPage = min(max(1, $perPage), 50);
        $page = max(1, $page);

        $subQuery = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                MAX(donor_id) as donor_id,
                SUM(amount) as total_amount,
                COUNT(id) as donations_count,
                MIN(COALESCE(paid_at, created_at)) as first_donation_at
            ')
            ->whereIn('id', $recurringDonationIds)
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'));

        if ($graduateOnly) {
            $allRows = (clone $subQuery)->orderByDesc('total_amount')->get();
            $asArray = $allRows->map(fn($row) => [
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'donations_count' => (int) $row->donations_count,
            ])->toArray();
            $merged = $this->filterAndMergeTopRowsGraduateOnly($asArray, 100);
            $total = count($merged);
            $offset = ($page - 1) * $perPage;
            $data = array_slice($merged, $offset, $perPage);
            $data = array_map(fn($r) => array_merge($r, [
                'id' => 'recurring:' . md5($r['donor_label']),
                'total_amount_formatted' => $this->formatRubles($r['total_amount']),
            ]), $data);

            return [
                'data' => $data,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => (int) max(1, ceil($total / $perPage)),
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        }

        $total = (clone $subQuery)->get()->count();
        $offset = ($page - 1) * $perPage;

        $rows = (clone $subQuery)
            ->orderByDesc('total_amount')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        $donorIds = $rows->pluck('donor_id')->filter()->unique()->values()->all();
        $userPhotos = $this->getUserPhotosByIds($donorIds);

        $data = $rows->map(function ($row) use ($userPhotos) {
            $avatar = isset($row->donor_id) ? ($userPhotos[$row->donor_id] ?? null) : null;

            return [
                'id' => 'recurring:' . md5($row->donor_label . ($row->donor_id ?? '')),
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
                'donations_count' => (int) $row->donations_count,
                'duration_label' => $this->formatDurationLabel($row->first_donation_at),
                'avatar' => $avatar,
            ];
        })->toArray();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'last_page' => (int) max(1, ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    private function formatDurationLabel(?string $firstAt): string
    {
        if (! $firstAt) {
            return 'В сумме';
        }

        $start = \Carbon\Carbon::parse($firstAt);
        $now = now();
        $diff = $start->diff($now);

        $years = $diff->y;
        $months = $diff->m;

        $parts = [];

        if ($years > 0) {
            $parts[] = $this->pluralYears($years);
        }
        if ($months > 0) {
            $parts[] = $this->pluralMonths($months);
        }

        if (empty($parts)) {
            return 'В сумме менее месяца';
        }

        return 'В сумме ' . implode(' ', $parts);
    }

    private function pluralYears(int $n): string
    {
        $mod100 = $n % 100;
        if ($mod100 >= 11 && $mod100 <= 19) {
            return $n . ' лет';
        }
        $mod10 = $n % 10;
        return match ($mod10) {
            1 => $n . ' год',
            2, 3, 4 => $n . ' года',
            default => $n . ' лет',
        };
    }

    private function pluralMonths(int $n): string
    {
        $mod100 = $n % 100;
        if ($mod100 >= 11 && $mod100 <= 19) {
            return $n . ' месяцев';
        }
        $mod10 = $n % 10;
        return match ($mod10) {
            1 => $n . ' месяц',
            2, 3, 4 => $n . ' месяца',
            default => $n . ' месяцев',
        };
    }

    private function getUserPhotosByIds(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        $users = \App\Models\User::query()
            ->whereIn('id', $userIds)
            ->get(['id', 'photo']);

        $result = [];
        foreach ($users as $user) {
            if (! empty($user->photo)) {
                $url = $user->photo;
                if (
                    ! str_starts_with($url, 'http://')
                    && ! str_starts_with($url, 'https://')
                    && ! str_starts_with($url, '/')
                ) {
                    $url = '/storage/' . ltrim($url, '/');
                }
                $result[$user->id] = $url;
            }
        }

        return $result;
    }

    /**
     * Все поступления — список отдельных пожертвований с пагинацией.
     */
    public function allDonations(Project $project, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $perPage = min(max(1, $perPage), self::MAX_PER_PAGE);

        return Donation::query()
            ->where('project_id', $project->id)
            ->where('status', DonationStatus::Completed->value)
            ->orderByRaw('COALESCE(paid_at, created_at) DESC')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Топ поддержавших по организации (все проекты).
     * При $graduateOnly=true только «Выпуск X г.» и «Друзья лицея».
     * Для мигрированных организаций данные берутся из снапшота (отдельная логика).
     */
    public function topByDonorNameForOrganization(Organization $organization, string $period = self::PERIOD_ALL, int $limit = 20, bool $graduateOnly = false): array
    {
        if ($graduateOnly) {
            $migrated = app(MigratedDonationsService::class);
            if ($migrated->isForOrganization($organization) && $period === self::PERIOD_ALL) {
                return $migrated->topOneTimeByGraduation($organization, $limit);
            }
        }

        $fetchLimit = $graduateOnly ? min(100, $limit * 5) : $limit;
        $query = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                SUM(amount) as total_amount,
                COUNT(id) as donations_count
            ')
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'))
            ->orderByDesc('total_amount')
            ->limit($fetchLimit);

        $this->applyPeriodFilter($query, $period);

        $rows = $query->get()->map(function ($row) {
            return [
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
                'donations_count' => (int) $row->donations_count,
            ];
        })->toArray();

        if ($graduateOnly) {
            return $this->filterAndMergeTopRowsGraduateOnly($rows, $limit);
        }

        return $rows;
    }

    /**
     * Топ регулярно-поддерживающих по организации.
     * При $graduateOnly=true только «Выпуск X г.» и «Друзья лицея».
     * Для мигрированных организаций данные берутся из снапшота (модуль Migrated).
     */
    public function topRecurringByDonorNameForOrganization(
        Organization $organization,
        string $period = self::PERIOD_ALL,
        int $page = 1,
        int $perPage = 50,
        bool $graduateOnly = false,
    ): array {
        $perPage = min(max(1, $perPage), 50);
        $page = max(1, $page);

        if ($graduateOnly) {
            $migrated = app(MigratedDonationsService::class);
            if ($migrated->isForOrganization($organization)) {
                return $migrated->topRecurring($organization, $page, $perPage);
            }

            $snapshots = DB::table('organization_top_recurring_snapshots')
                ->where('organization_id', $organization->id)
                ->orderByDesc('total_amount')
                ->get();

            if ($snapshots->isNotEmpty()) {
                $total = $snapshots->count();
                $offset = ($page - 1) * $perPage;
                $items = $snapshots->slice($offset, $perPage)->values();
                $data = $items->map(fn($r) => [
                    'id' => 'recurring:' . md5($r->donor_label),
                    'donor_label' => $r->donor_label,
                    'total_amount' => (int) $r->total_amount,
                    'total_amount_formatted' => $this->formatRubles((int) $r->total_amount),
                    'donations_count' => (int) $r->donations_count,
                ])->all();

                return [
                    'data' => $data,
                    'pagination' => [
                        'current_page' => $page,
                        'last_page' => (int) max(1, ceil($total / $perPage)),
                        'per_page' => $perPage,
                        'total' => $total,
                    ],
                ];
            }

            // Нет снапшота из blagoqr — считаем из донатов (доноры с 2+ платежами)
            $query = Donation::query()
                ->select([
                    DB::raw('COALESCE(NULLIF(TRIM(donations.donor_name), ""), "Анонимное пожертвование") as donor_label'),
                    DB::raw('SUM(donations.amount) as donor_total_amount'),
                    DB::raw('COUNT(donations.id) as donor_donations_count')
                ])
                ->where('donations.organization_id', $organization->id)
                ->where('donations.status', DonationStatus::Completed->value)
                ->whereExists(function ($q) use ($organization) {
                    $q->select(DB::raw(1))
                        ->from('donations as d2')
                        ->where('d2.organization_id', $organization->id)
                        ->where('d2.status', DonationStatus::Completed->value)
                        ->whereRaw(
                            '(donations.donor_id <=> d2.donor_id AND donations.donor_phone <=> d2.donor_phone AND COALESCE(NULLIF(TRIM(donations.donor_name), ""), "Анонимное пожертвование") = COALESCE(NULLIF(TRIM(d2.donor_name), ""), "Анонимное пожертвование"))'
                        )
                        ->groupBy('d2.donor_id', 'd2.donor_phone', DB::raw('COALESCE(NULLIF(TRIM(d2.donor_name), ""), "Анонимное пожертвование")'))
                        ->havingRaw('COUNT(d2.id) >= 2');
                })
                ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donations.donor_name), ""), "Анонимное пожертвование")'));

            $donors = $query->get();

            // Группируем по нормализованным меткам (Выпуск X г., Друзья лицея)
            // Суммируем amount и donations_count — количество платежей, не уникальных людей
            $merged = [];
            foreach ($donors as $donor) {
                $normalized = self::normalizeDonorLabelGraduateOnly($donor->donor_label);
                if ($normalized === null) {
                    continue;
                }

                if (!isset($merged[$normalized])) {
                    $merged[$normalized] = [
                        'donor_label' => $normalized,
                        'total_amount' => 0,
                        'donations_count' => 0,
                    ];
                }

                $merged[$normalized]['total_amount'] += (int) $donor->donor_total_amount;
                $merged[$normalized]['donations_count'] += (int) $donor->donor_donations_count;
            }

            $result = [];
            foreach ($merged as $label => $data) {
                $result[] = [
                    'donor_label' => $label,
                    'total_amount' => $data['total_amount'],
                    'donations_count' => $data['donations_count'],
                ];
            }

            // Сортируем по сумме
            usort($result, fn($a, $b) => $b['total_amount'] <=> $a['total_amount']);

            $total = count($result);
            $offset = ($page - 1) * $perPage;
            $data = array_slice($result, $offset, $perPage);

            $data = array_map(fn($r) => array_merge($r, [
                'id' => 'recurring:' . md5($r['donor_label']),
                'total_amount_formatted' => $this->formatRubles($r['total_amount']),
            ]), $data);

            return [
                'data' => $data,
                'pagination' => [
                    'current_page' => $page,
                    'last_page' => (int) max(1, ceil($total / $perPage)),
                    'per_page' => $perPage,
                    'total' => $total,
                ],
            ];
        }

        // Для обычного режима (без graduate_only)
        $subQuery = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                COUNT(DISTINCT COALESCE(donor_id, donor_phone, CONCAT("anon_", id))) as unique_donors_count,
                SUM(amount) as total_amount,
                COUNT(id) as donations_count
            ')
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'))
            ->having('donations_count', '>=', 2);

        $this->applyPeriodFilter($subQuery, $period);

        $total = (clone $subQuery)->get()->count();
        $offset = ($page - 1) * $perPage;

        $rows = (clone $subQuery)
            ->orderByDesc('total_amount')
            ->offset($offset)
            ->limit($perPage)
            ->get();

        $data = $rows->map(function ($row) {
            return [
                'donor_label' => $row->donor_label,
                'total_amount' => (int) $row->total_amount,
                'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
                'donations_count' => (int) $row->unique_donors_count,
            ];
        })->toArray();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'last_page' => (int) max(1, (int) ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    /**
     * Пожертвования текущего пользователя по организации (Моя помощь).
     * Сопоставление по donor_id или donor_phone (нормализованный).
     */
    public function myDonationsForOrganization(User $user, Organization $organization, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $perPage = min(max(1, $perPage), self::MAX_PER_PAGE);
        $phone = PhoneNumber::normalize($user->phone);

        $baseQuery = Donation::query()
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->where(function ($q) use ($user, $phone) {
                $q->where('donor_id', $user->id);
                if ($phone !== null) {
                    $q->orWhere('donor_phone', $phone);
                }
            });

        $subQuery = (clone $baseQuery)
            ->selectRaw('MIN(id) as id')
            ->groupByRaw('COALESCE(payment_transaction_id, id)');

        return Donation::query()
            ->whereIn('id', $subQuery)
            ->orderByRaw('COALESCE(paid_at, created_at) DESC')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Автоплатежи пользователя по организации (recurring donations).
     */
    public function myRecurringDonationsForOrganization(User $user, Organization $organization, int $page = 1, int $perPage = 20): array
    {
        $perPage = min(max(1, $perPage), self::MAX_PER_PAGE);
        $phone = PhoneNumber::normalize($user->phone);

        $recurringIds = $this->getRecurringDonationIdsForOrganization($organization->id, self::PERIOD_ALL);

        if (empty($recurringIds)) {
            return [
                'data' => [],
                'pagination' => ['current_page' => 1, 'last_page' => 1, 'per_page' => $perPage, 'total' => 0],
            ];
        }

        $query = Donation::query()
            ->selectRaw('
                COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование") as donor_label,
                SUM(amount) as total_amount,
                COUNT(id) as donations_count,
                MIN(COALESCE(paid_at, created_at)) as first_donation_at
            ')
            ->whereIn('id', $recurringIds)
            ->where(function ($q) use ($user, $phone) {
                $q->where('donor_id', $user->id);
                if ($phone !== null) {
                    $q->orWhere('donor_phone', $phone);
                }
            })
            ->groupBy(DB::raw('COALESCE(NULLIF(TRIM(donor_name), ""), "Анонимное пожертвование")'));

        $rows = $query->get();
        if ($rows->isEmpty()) {
            return [
                'data' => [],
                'pagination' => ['current_page' => 1, 'last_page' => 1, 'per_page' => $perPage, 'total' => 0],
            ];
        }

        $total = $rows->count();
        $offset = ($page - 1) * $perPage;
        $slice = $rows->slice($offset, $perPage)->values();

        $data = $slice->map(fn ($row) => [
            'donor_label' => $row->donor_label,
            'total_amount' => (int) $row->total_amount,
            'total_amount_formatted' => $this->formatRubles((int) $row->total_amount),
            'donations_count' => (int) $row->donations_count,
            'duration_label' => $this->formatDurationLabel($row->first_donation_at),
        ])->toArray();

        return [
            'data' => $data,
            'pagination' => [
                'current_page' => $page,
                'last_page' => (int) max(1, ceil($total / $perPage)),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];
    }

    /**
     * Способы оплаты, использованные пользователем в пожертвованиях по организации.
     * Возвращает уникальные payment_method с подписью.
     */
    public function myPaymentMethodsForOrganization(User $user, Organization $organization): array
    {
        $phone = PhoneNumber::normalize($user->phone);

        $methods = Donation::query()
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->where(function ($q) use ($user, $phone) {
                $q->where('donor_id', $user->id);
                if ($phone !== null) {
                    $q->orWhere('donor_phone', $phone);
                }
            })
            ->select('payment_method')
            ->distinct()
            ->pluck('payment_method')
            ->filter()
            ->unique()
            ->values()
            ->map(fn ($slug) => [
                'payment_method' => $slug,
                'label' => self::paymentMethodLabel($slug),
            ])
            ->toArray();

        return $methods;
    }

    /**
     * Все поступления по организации с пагинацией.
     * Один платёж (payment_transaction_id) показывается один раз — дубли из миграции/повторов не выводятся.
     */
    public function allDonationsForOrganization(Organization $organization, int $page = 1, int $perPage = 20): LengthAwarePaginator
    {
        $perPage = min(max(1, $perPage), self::MAX_PER_PAGE);

        $subQuery = Donation::query()
            ->selectRaw('MIN(id) as id')
            ->where('organization_id', $organization->id)
            ->where('status', DonationStatus::Completed->value)
            ->groupByRaw('COALESCE(payment_transaction_id, id)');

        return Donation::query()
            ->whereIn('id', $subQuery)
            ->orderByRaw('COALESCE(paid_at, created_at) DESC')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    private function getRecurringDonationIdsForOrganization(int $organizationId, string $period): array
    {
        $query = Donation::query()
            ->select('donations.id')
            ->leftJoin('payment_transactions', 'donations.payment_transaction_id', '=', 'payment_transactions.id')
            ->where('donations.organization_id', $organizationId)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($q) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.recurring_period') IS NOT NULL")
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(donations.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.recurring_period') IS NOT NULL");
            });

        if ($period === self::PERIOD_WEEK) {
            $query->where(function ($q) {
                $q->where('donations.paid_at', '>=', now()->subWeek())
                    ->orWhere('donations.created_at', '>=', now()->subWeek());
            });
        } elseif ($period === self::PERIOD_MONTH) {
            $query->where(function ($q) {
                $q->where('donations.paid_at', '>=', now()->subMonth())
                    ->orWhere('donations.created_at', '>=', now()->subMonth());
            });
        }

        return $query->pluck('id')->toArray();
    }

    private function applyPeriodFilter($query, string $period): void
    {
        $table = 'donations';
        if ($period === self::PERIOD_WEEK) {
            $query->where(function ($q) use ($table) {
                $q->where("{$table}.paid_at", '>=', now()->subWeek())
                    ->orWhere(function ($q2) use ($table) {
                        $q2->whereNull("{$table}.paid_at")
                            ->where("{$table}.created_at", '>=', now()->subWeek());
                    });
            });
        } elseif ($period === self::PERIOD_MONTH) {
            $query->where(function ($q) use ($table) {
                $q->where("{$table}.paid_at", '>=', now()->subMonth())
                    ->orWhere(function ($q2) use ($table) {
                        $q2->whereNull("{$table}.paid_at")
                            ->where("{$table}.created_at", '>=', now()->subMonth());
                    });
            });
        }
    }

    private function getRecurringDonationIds(int $projectId, string $period): array
    {
        $query = Donation::query()
            ->select('donations.id')
            ->leftJoin('payment_transactions', 'donations.payment_transaction_id', '=', 'payment_transactions.id')
            ->where('donations.project_id', $projectId)
            ->where('donations.status', DonationStatus::Completed->value)
            ->where(function ($q) {
                $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_transactions.payment_details, '$.recurring_period') IS NOT NULL")
                    ->orWhereRaw("JSON_UNQUOTE(JSON_EXTRACT(donations.payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(donations.payment_details, '$.recurring_period') IS NOT NULL");
            });

        if ($period === self::PERIOD_WEEK) {
            $query->where(function ($q) {
                $q->where('donations.paid_at', '>=', now()->subWeek())
                    ->orWhere('donations.created_at', '>=', now()->subWeek());
            });
        } elseif ($period === self::PERIOD_MONTH) {
            $query->where(function ($q) {
                $q->where('donations.paid_at', '>=', now()->subMonth())
                    ->orWhere('donations.created_at', '>=', now()->subMonth());
            });
        }

        return $query->pluck('id')->toArray();
    }

    private function formatRubles(int $amountInKopecks): string
    {
        $rubles = $amountInKopecks / 100;

        return number_format($rubles, 0, '', ' ') . ' ₽';
    }

    public static function paymentMethodLabel(?string $slug): string
    {
        return match ($slug) {
            'sbp' => 'СБП',
            'bankcard', 'bank_card', 'card' => 'Онлайн',
            'sberbank', 'sberpay' => 'SberPay',
            'tinkoff_bank', 'tpay' => 'T-Pay',
            default => $slug ? ucfirst($slug) : '—',
        };
    }
}
