<?php

namespace App\Services\Reports;

use App\Enums\ReportType;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectStage;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;

class ReportGenerator
{
    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function generate(
        Organization $organization,
        ReportType $reportType,
        array $filters = [],
        ?Project $project = null,
        ?ProjectStage $stage = null,
    ): array {
        $period = Arr::get($filters, 'period', 'month');
        $groupBy = Arr::get($filters, 'group_by');
        $status = Arr::get($filters, 'status', 'all');

        [$startDate, $endDate] = $this->resolveDateRange(
            $period,
            Arr::get($filters, 'date_from'),
            Arr::get($filters, 'date_to'),
            $stage,
        );

        $contextMeta = [
            'organization_id' => $organization->id,
            'project_id' => $project?->id,
            'project_stage_id' => $stage?->id,
            'period' => $period,
            'group_by' => $groupBy,
            'status' => $status,
            'date_from' => $startDate->toDateString(),
            'date_to' => $endDate->toDateString(),
        ];

        $result = match ($reportType) {
            ReportType::Revenue => $this->buildRevenueReport($organization, $startDate, $endDate, $groupBy ?? 'month', $project, $stage),
            ReportType::Members => $this->buildMembersReport($organization, $startDate, $endDate, (bool) Arr::get($filters, 'include_inactive', false)),
            ReportType::Projects => $this->buildProjectsReport($organization, $startDate, $endDate, $status, $project, $stage),
            ReportType::Comprehensive => $this->buildComprehensiveReport(
                $organization,
                $startDate,
                $endDate,
                [
                    'include_revenue' => Arr::get($filters, 'include_revenue', true),
                    'include_members' => Arr::get($filters, 'include_members', true),
                    'include_projects' => Arr::get($filters, 'include_projects', true),
                    'include_analytics' => Arr::get($filters, 'include_analytics', true),
                ],
                $project,
                $stage
            ),
            ReportType::Custom => $this->buildCustomReport($organization, $startDate, $endDate, $filters, $project, $stage),
        };

        return [
            'type' => $reportType->value,
            'title' => Arr::get($result, 'title', $reportType->label()),
            'filters' => array_merge($filters, [
                'period' => $period,
                'date_from' => $startDate->toDateString(),
                'date_to' => $endDate->toDateString(),
            ]),
            'meta' => array_merge($contextMeta, Arr::get($result, 'meta', [])),
            'data' => Arr::get($result, 'data', []),
            'summary' => Arr::get($result, 'summary', []),
            'rows_count' => Arr::get($result, 'rows_count', $this->resolveRowsCount(Arr::get($result, 'data', []))),
            'generated_at' => now(),
        ];
    }

    /**
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    protected function buildComprehensiveReport(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        array $options,
        ?Project $project,
        ?ProjectStage $stage,
    ): array {
        $data = [];
        $summary = [];

        if ($options['include_revenue']) {
            $revenue = $this->buildRevenueReport($organization, $startDate, $endDate, 'month', $project, $stage);
            $data['revenue'] = $revenue['data'];
            $summary['revenue'] = $revenue['summary'];
        }

        if ($options['include_members']) {
            $members = $this->buildMembersReport($organization, $startDate, $endDate, false);
            $data['members'] = $members['data'];
            $summary['members'] = $members['summary'];
        }

        if ($options['include_projects']) {
            $projects = $this->buildProjectsReport($organization, $startDate, $endDate, 'all', $project, $stage);
            $data['projects'] = $projects['data'];
            $summary['projects'] = $projects['summary'];
        }

        if ($options['include_analytics']) {
            $analytics = $this->buildAnalyticsData($organization, $startDate, $endDate, $project);
            $data['analytics'] = $analytics;
        }

        return [
            'title' => 'Комплексный отчет',
            'data' => $data,
            'summary' => $summary,
            'rows_count' => collect($data)->sum(fn ($section) => $this->resolveRowsCount($section)),
        ];
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    protected function buildCustomReport(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        array $filters,
        ?Project $project,
        ?ProjectStage $stage,
    ): array {
        $revenue = $this->buildRevenueReport(
            $organization,
            $startDate,
            $endDate,
            Arr::get($filters, 'group_by', 'month'),
            $project,
            $stage
        );

        return [
            'title' => Arr::get($filters, 'title', 'Сводный отчет'),
            'data' => [
                'revenue' => $revenue['data'],
            ],
            'summary' => [
                'revenue' => $revenue['summary'],
            ],
            'rows_count' => $revenue['rows_count'],
            'meta' => [
                'group_by' => Arr::get($filters, 'group_by', 'month'),
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildRevenueReport(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        string $groupBy,
        ?Project $project,
        ?ProjectStage $stage,
    ): array {
        $query = $organization->donations()
            ->select('donations.*')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($project) {
            $query->where('project_id', $project->id);
        }

        if ($stage && $stage->start_date && $stage->end_date) {
            $query->whereBetween('created_at', [
                $stage->start_date->copy()->startOfDay(),
                $stage->end_date->copy()->endOfDay(),
            ]);
        }

        $data = match ($groupBy) {
            'day' => $query->selectRaw('DATE(created_at) as period, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'week' => $query->selectRaw('YEARWEEK(created_at) as period, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'month' => $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'quarter' => $query->selectRaw('CONCAT(YEAR(created_at), "-Q", QUARTER(created_at)) as period, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('period')
                ->orderBy('period')
                ->get(),
            'project' => $query->join('projects', 'donations.project_id', '=', 'projects.id')
                ->selectRaw('projects.title as period, SUM(donations.amount) as total, COUNT(*) as count')
                ->groupBy('projects.id', 'projects.title')
                ->orderBy('total', 'desc')
                ->get(),
            'payment_method' => $query->selectRaw('payment_method as period, SUM(amount) as total, COUNT(*) as count')
                ->groupBy('payment_method')
                ->orderBy('total', 'desc')
                ->get(),
            default => collect(),
        };

        $totalAmount = $data->sum('total');
        $totalCount = $data->sum('count');

        return [
            'title' => 'Отчет по доходам',
            'meta' => ['group_by' => $groupBy],
            'data' => $data->map(function ($row) {
                return [
                    'period' => $row->period,
                    'total' => (int) $row->total,
                    'count' => (int) $row->count,
                    'total_rubles' => round(((int) $row->total) / 100, 2),
                ];
            })->all(),
            'summary' => [
                'total_amount' => (int) $totalAmount,
                'total_amount_rubles' => round($totalAmount / 100, 2),
                'total_transactions' => (int) $totalCount,
                'average_transaction' => $totalCount > 0 ? round($totalAmount / $totalCount, 2) : 0,
            ],
            'rows_count' => $data->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildMembersReport(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        bool $includeInactive,
    ): array {
        $query = $organization->members()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (!$includeInactive) {
            $query->where('is_active', true);
        }

        $registrations = $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $membersBySource = $query->selectRaw('COALESCE(source, "unknown") as source, COUNT(*) as count')
            ->groupBy('source')
            ->orderBy('count', 'desc')
            ->get();

        $activeMembers = $organization->members()
            ->where('last_active_at', '>=', $startDate)
            ->count();

        return [
            'title' => 'Отчет по участникам',
            'data' => [
                'daily_registrations' => $registrations->map(fn ($row) => [
                    'date' => $row->date,
                    'count' => (int) $row->count,
                ])->all(),
                'members_by_source' => $membersBySource->map(fn ($row) => [
                    'source' => $row->source,
                    'count' => (int) $row->count,
                ])->all(),
                'active_members' => $activeMembers,
            ],
            'summary' => [
                'new_members' => (int) $registrations->sum('count'),
                'active_members' => $activeMembers,
                'top_source' => $membersBySource->first()->source ?? null,
            ],
            'rows_count' => $registrations->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildProjectsReport(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        string $status,
        ?Project $project,
        ?ProjectStage $stage,
    ): array {
        $query = $organization->projects()
            ->with(['stages'])
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($project) {
            $query->where('projects.id', $project->id);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $projects = $query->get();

        $projectsByStatus = $projects->groupBy('status')->map(fn (Collection $group) => [
            'status' => $group->first()->status,
            'count' => $group->count(),
        ])->values()->all();

        $fundingProgress = $projects->map(function (Project $project) use ($stage) {
            $targetAmount = $project->target_amount;
            $collectedAmount = $project->collected_amount;

            if ($stage && $project->id === $stage->project_id) {
                $targetAmount = $stage->target_amount;
                $collectedAmount = $stage->collected_amount;
            }

            return [
                'project_id' => $project->id,
                'title' => $project->title,
                'target_amount' => (int) $targetAmount,
                'collected_amount' => (int) $collectedAmount,
                'progress_percentage' => $targetAmount > 0
                    ? round(($collectedAmount / $targetAmount) * 100, 2)
                    : 0,
            ];
        })->sortByDesc('progress_percentage')->values()->all();

        $totalTarget = array_sum(array_column($fundingProgress, 'target_amount'));
        $totalCollected = array_sum(array_column($fundingProgress, 'collected_amount'));

        return [
            'title' => 'Отчет по проектам',
            'data' => [
                'projects_by_status' => $projectsByStatus,
                'funding_progress' => $fundingProgress,
                'average_funding_time' => $this->calculateAverageFundingTime($organization, $startDate, $endDate, $project),
            ],
            'summary' => [
                'total_projects' => count($fundingProgress),
                'total_target' => (int) $totalTarget,
                'total_collected' => (int) $totalCollected,
                'overall_progress' => $totalTarget > 0
                    ? round(($totalCollected / $totalTarget) * 100, 2)
                    : 0,
            ],
            'rows_count' => count($fundingProgress),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildAnalyticsData(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        ?Project $project,
    ): array {
        return [
            'conversion_rate' => $this->calculateConversionRate($organization, $startDate, $endDate, $project),
            'average_donation' => $organization->donations()
                ->when($project, fn (Builder $builder) => $builder->where('project_id', $project->id))
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('amount') ?? 0,
            'retention_rate' => $this->calculateRetentionRate($organization, $startDate, $endDate),
            'growth_rate' => $this->calculateGrowthRate($organization, $startDate, $endDate, $project),
        ];
    }

    /**
     * @param mixed $data
     */
    protected function resolveRowsCount($data): int
    {
        if (is_array($data)) {
            if ($this->isAssociative($data)) {
                return collect($data)->sum(fn ($value) => $this->resolveRowsCount($value));
            }

            return count($data);
        }

        if ($data instanceof Collection) {
            return $data->count();
        }

        return 0;
    }

    protected function isAssociative(array $array): bool
    {
        return array_keys($array) !== range(0, count($array) - 1);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    protected function resolveDateRange(
        string $period,
        ?string $dateFrom,
        ?string $dateTo,
        ?ProjectStage $stage,
    ): array {
        if ($period === 'custom' && $dateFrom && $dateTo) {
            return [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay(),
            ];
        }

        if ($stage && $stage->start_date && $stage->end_date) {
            return [
                Carbon::parse($stage->start_date)->startOfDay(),
                Carbon::parse($stage->end_date)->endOfDay(),
            ];
        }

        return match ($period) {
            'day' => [now()->startOfDay(), now()->endOfDay()],
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'quarter' => [now()->startOfQuarter(), now()->endOfQuarter()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->subMonth()->startOfDay(), now()->endOfDay()],
        };
    }

    protected function calculateAverageFundingTime(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        ?Project $project,
    ): float {
        $projects = $organization->projects()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->when($project, fn (Builder $builder) => $builder->where('id', $project->id))
            ->get();

        if ($projects->isEmpty()) {
            return 0.0;
        }

        $totalDays = $projects->sum(function (Project $project) {
            return $project->updated_at
                ? $project->updated_at->diffInDays($project->created_at)
                : 0;
        });

        return $totalDays / $projects->count();
    }

    protected function calculateConversionRate(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        ?Project $project,
    ): float {
        $totalVisitors = $organization->statistics()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('unique_visitors');

        $donationsQuery = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($project) {
            $donationsQuery->where('project_id', $project->id);
        }

        $donations = $donationsQuery->count();

        return $totalVisitors > 0
            ? round(($donations / $totalVisitors) * 100, 2)
            : 0.0;
    }

    protected function calculateRetentionRate(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
    ): float {
        $totalMembers = $organization->members()->count();
        $activeMembers = $organization->members()
            ->where('last_active_at', '>=', $startDate)
            ->count();

        return $totalMembers > 0
            ? round(($activeMembers / $totalMembers) * 100, 2)
            : 0.0;
    }

    protected function calculateGrowthRate(
        Organization $organization,
        Carbon $startDate,
        Carbon $endDate,
        ?Project $project,
    ): float {
        $periodStart = $startDate->copy()->subMonth();
        $periodEnd = $startDate->copy()->subDay();

        $previousPeriodQuery = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$periodStart, $periodEnd]);

        $currentPeriodQuery = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($project) {
            $previousPeriodQuery->where('project_id', $project->id);
            $currentPeriodQuery->where('project_id', $project->id);
        }

        $previousPeriod = (float) $previousPeriodQuery->sum('amount');
        $currentPeriod = (float) $currentPeriodQuery->sum('amount');

        if ($previousPeriod <= 0) {
            return 0.0;
        }

        return round((($currentPeriod - $previousPeriod) / $previousPeriod) * 100, 2);
    }
}


