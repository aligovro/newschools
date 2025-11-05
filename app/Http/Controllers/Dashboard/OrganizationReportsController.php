<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use App\Models\Donation;
use App\Models\Member;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Http\Resources\OrganizationResource;

class OrganizationReportsController extends Controller
{
    public function __construct()
    {
        // Middleware применяется в маршрутах
    }

    /**
     * Страница отчетов
     */
    public function index(Organization $organization)
    {
        $availableReports = $this->getAvailableReports();
        $recentReports = $this->getRecentReports($organization);

        return Inertia::render('organization/admin/ReportsIndex', [
            'organization' => (new OrganizationResource($organization))->toArray(request()),
            'availableReports' => $availableReports,
            'recentReports' => $recentReports,
        ]);
    }

    /**
     * Генерация отчета по доходам
     */
    public function generateRevenueReport(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|string|in:day,week,month,quarter,year,custom',
            'date_from' => 'nullable|date|required_if:period,custom',
            'date_to' => 'nullable|date|required_if:period,custom|after_or_equal:date_from',
            'format' => 'nullable|string|in:json,pdf,excel',
            'group_by' => 'nullable|string|in:day,week,month,project,payment_method',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $period = $request->period;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;
            $groupBy = $request->group_by ?? 'day';

            // Определяем период
            [$startDate, $endDate] = $this->getDateRange($period, $dateFrom, $dateTo);

            // Генерируем отчет
            $reportData = $this->generateRevenueData($organization, $startDate, $endDate, $groupBy);

            $report = [
                'type' => 'revenue',
                'title' => 'Отчет по доходам',
                'organization' => $organization->name,
                'period' => $period,
                'date_from' => $startDate->format('Y-m-d'),
                'date_to' => $endDate->format('Y-m-d'),
                'generated_at' => now()->toISOString(),
                'data' => $reportData,
                'summary' => $this->getRevenueSummary($reportData),
            ];

            return response()->json([
                'message' => 'Отчет сгенерирован',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка генерации отчета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Генерация отчета по участникам
     */
    public function generateMembersReport(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|string|in:day,week,month,quarter,year,custom',
            'date_from' => 'nullable|date|required_if:period,custom',
            'date_to' => 'nullable|date|required_if:period,custom|after_or_equal:date_from',
            'format' => 'nullable|string|in:json,pdf,excel',
            'include_inactive' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $period = $request->period;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            [$startDate, $endDate] = $this->getDateRange($period, $dateFrom, $dateTo);

            $reportData = $this->generateMembersData($organization, $startDate, $endDate, $request->include_inactive ?? false);

            $report = [
                'type' => 'members',
                'title' => 'Отчет по участникам',
                'organization' => $organization->name,
                'period' => $period,
                'date_from' => $startDate->format('Y-m-d'),
                'date_to' => $endDate->format('Y-m-d'),
                'generated_at' => now()->toISOString(),
                'data' => $reportData,
                'summary' => $this->getMembersSummary($reportData),
            ];

            return response()->json([
                'message' => 'Отчет сгенерирован',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка генерации отчета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Генерация отчета по проектам
     */
    public function generateProjectsReport(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|string|in:day,week,month,quarter,year,custom',
            'date_from' => 'nullable|date|required_if:period,custom',
            'date_to' => 'nullable|date|required_if:period,custom|after_or_equal:date_from',
            'format' => 'nullable|string|in:json,pdf,excel',
            'status' => 'nullable|string|in:all,active,completed,failed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $period = $request->period;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;
            $status = $request->status ?? 'all';

            [$startDate, $endDate] = $this->getDateRange($period, $dateFrom, $dateTo);

            $reportData = $this->generateProjectsData($organization, $startDate, $endDate, $status);

            $report = [
                'type' => 'projects',
                'title' => 'Отчет по проектам',
                'organization' => $organization->name,
                'period' => $period,
                'date_from' => $startDate->format('Y-m-d'),
                'date_to' => $endDate->format('Y-m-d'),
                'generated_at' => now()->toISOString(),
                'data' => $reportData,
                'summary' => $this->getProjectsSummary($reportData),
            ];

            return response()->json([
                'message' => 'Отчет сгенерирован',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка генерации отчета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Генерация комплексного отчета
     */
    public function generateComprehensiveReport(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'period' => 'required|string|in:day,week,month,quarter,year,custom',
            'date_from' => 'nullable|date|required_if:period,custom',
            'date_to' => 'nullable|date|required_if:period,custom|after_or_equal:date_from',
            'include_revenue' => 'boolean',
            'include_members' => 'boolean',
            'include_projects' => 'boolean',
            'include_analytics' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $period = $request->period;
            $dateFrom = $request->date_from;
            $dateTo = $request->date_to;

            [$startDate, $endDate] = $this->getDateRange($period, $dateFrom, $dateTo);

            $report = [
                'type' => 'comprehensive',
                'title' => 'Комплексный отчет',
                'organization' => $organization->name,
                'period' => $period,
                'date_from' => $startDate->format('Y-m-d'),
                'date_to' => $endDate->format('Y-m-d'),
                'generated_at' => now()->toISOString(),
            ];

            if ($request->include_revenue ?? true) {
                $report['revenue'] = $this->generateRevenueData($organization, $startDate, $endDate, 'month');
                $report['revenue_summary'] = $this->getRevenueSummary($report['revenue']);
            }

            if ($request->include_members ?? true) {
                $report['members'] = $this->generateMembersData($organization, $startDate, $endDate, false);
                $report['members_summary'] = $this->getMembersSummary($report['members']);
            }

            if ($request->include_projects ?? true) {
                $report['projects'] = $this->generateProjectsData($organization, $startDate, $endDate, 'all');
                $report['projects_summary'] = $this->getProjectsSummary($report['projects']);
            }

            if ($request->include_analytics ?? true) {
                $report['analytics'] = $this->generateAnalyticsData($organization, $startDate, $endDate);
            }

            return response()->json([
                'message' => 'Комплексный отчет сгенерирован',
                'report' => $report,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка генерации отчета: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Экспорт отчета
     */
    public function exportReport(Request $request, Organization $organization)
    {
        $validator = Validator::make($request->all(), [
            'report_type' => 'required|string|in:revenue,members,projects,comprehensive',
            'format' => 'required|string|in:pdf,excel,csv',
            'report_data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $format = $request->format;
        $reportData = $request->report_data;

        switch ($format) {
            case 'pdf':
                return $this->exportToPdf($organization, $reportData);
            case 'excel':
                return $this->exportToExcel($organization, $reportData);
            case 'csv':
                return $this->exportToCsv($organization, $reportData);
            default:
                return response()->json(['message' => 'Неподдерживаемый формат'], 400);
        }
    }

    /**
     * Получить доступные отчеты
     */
    private function getAvailableReports(): array
    {
        return [
            [
                'id' => 'revenue',
                'name' => 'Отчет по доходам',
                'description' => 'Анализ поступлений от пожертвований',
                'icon' => 'trending-up',
                'color' => 'green',
            ],
            [
                'id' => 'members',
                'name' => 'Отчет по участникам',
                'description' => 'Статистика регистраций и активности участников',
                'icon' => 'users',
                'color' => 'blue',
            ],
            [
                'id' => 'projects',
                'name' => 'Отчет по проектам',
                'description' => 'Анализ эффективности проектов',
                'icon' => 'folder',
                'color' => 'purple',
            ],
            [
                'id' => 'comprehensive',
                'name' => 'Комплексный отчет',
                'description' => 'Полный анализ деятельности организации',
                'icon' => 'bar-chart',
                'color' => 'orange',
            ],
        ];
    }

    /**
     * Получить последние отчеты
     */
    private function getRecentReports(Organization $organization): array
    {
        // В реальном проекте здесь должны быть сохраненные отчеты
        return [];
    }

    /**
     * Получить диапазон дат
     */
    private function getDateRange(string $period, ?string $dateFrom, ?string $dateTo): array
    {
        if ($period === 'custom') {
            return [
                Carbon::parse($dateFrom)->startOfDay(),
                Carbon::parse($dateTo)->endOfDay(),
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

    /**
     * Генерировать данные по доходам
     */
    private function generateRevenueData(Organization $organization, Carbon $startDate, Carbon $endDate, string $groupBy): array
    {
        $query = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate]);

        switch ($groupBy) {
            case 'day':
                return $query->selectRaw('DATE(created_at) as period, SUM(amount) as total, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get()
                    ->toArray();

            case 'week':
                return $query->selectRaw('YEARWEEK(created_at) as period, SUM(amount) as total, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get()
                    ->toArray();

            case 'month':
                return $query->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as period, SUM(amount) as total, COUNT(*) as count')
                    ->groupBy('period')
                    ->orderBy('period')
                    ->get()
                    ->toArray();

            case 'project':
                return $query->join('projects', 'donations.project_id', '=', 'projects.id')
                    ->selectRaw('projects.title as period, SUM(donations.amount) as total, COUNT(*) as count')
                    ->groupBy('projects.id', 'projects.title')
                    ->orderBy('total', 'desc')
                    ->get()
                    ->toArray();

            case 'payment_method':
                return $query->selectRaw('payment_method as period, SUM(amount) as total, COUNT(*) as count')
                    ->groupBy('payment_method')
                    ->orderBy('total', 'desc')
                    ->get()
                    ->toArray();

            default:
                return [];
        }
    }

    /**
     * Генерировать данные по участникам
     */
    private function generateMembersData(Organization $organization, Carbon $startDate, Carbon $endDate, bool $includeInactive): array
    {
        $query = $organization->members()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (!$includeInactive) {
            $query->where('is_active', true);
        }

        return [
            'daily_registrations' => $query->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->toArray(),
            'members_by_source' => $query->selectRaw('source as source, COUNT(*) as count')
                ->groupBy('source')
                ->orderBy('count', 'desc')
                ->get()
                ->toArray(),
            'active_members' => $organization->members()
                ->where('last_active_at', '>=', $startDate)
                ->count(),
        ];
    }

    /**
     * Генерировать данные по проектам
     */
    private function generateProjectsData(Organization $organization, Carbon $startDate, Carbon $endDate, string $status): array
    {
        $query = $organization->projects()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        return [
            'projects_by_status' => $query->selectRaw('status as status, COUNT(*) as count')
                ->groupBy('status')
                ->get()
                ->toArray(),
            'funding_progress' => $query->selectRaw('title, target_amount, collected_amount,
                ROUND((collected_amount / target_amount) * 100, 2) as progress_percentage')
                ->orderBy('progress_percentage', 'desc')
                ->get()
                ->toArray(),
            'average_funding_time' => $this->calculateAverageFundingTime($organization, $startDate, $endDate),
        ];
    }

    /**
     * Генерировать аналитические данные
     */
    private function generateAnalyticsData(Organization $organization, Carbon $startDate, Carbon $endDate): array
    {
        return [
            'conversion_rate' => $this->calculateConversionRate($organization, $startDate, $endDate),
            'average_donation' => $organization->donations()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('amount') ?? 0,
            'retention_rate' => $this->calculateRetentionRate($organization, $startDate, $endDate),
            'growth_rate' => $this->calculateGrowthRate($organization, $startDate, $endDate),
        ];
    }

    /**
     * Получить сводку по доходам
     */
    private function getRevenueSummary(array $data): array
    {
        $total = array_sum(array_column($data, 'total'));
        $count = array_sum(array_column($data, 'count'));

        return [
            'total_amount' => $total,
            'total_transactions' => $count,
            'average_transaction' => $count > 0 ? $total / $count : 0,
        ];
    }

    /**
     * Получить сводку по участникам
     */
    private function getMembersSummary(array $data): array
    {
        return [
            'new_members' => array_sum(array_column($data['daily_registrations'], 'count')),
            'active_members' => $data['active_members'],
            'top_source' => $data['members_by_source'][0]['source'] ?? null,
        ];
    }

    /**
     * Получить сводку по проектам
     */
    private function getProjectsSummary(array $data): array
    {
        $totalTarget = array_sum(array_column($data['funding_progress'], 'target_amount'));
        $totalCollected = array_sum(array_column($data['funding_progress'], 'collected_amount'));

        return [
            'total_projects' => count($data['funding_progress']),
            'total_target' => $totalTarget,
            'total_collected' => $totalCollected,
            'overall_progress' => $totalTarget > 0 ? round(($totalCollected / $totalTarget) * 100, 2) : 0,
        ];
    }

    /**
     * Экспорт в PDF
     */
    private function exportToPdf(Organization $organization, array $reportData)
    {
        // Здесь должна быть генерация PDF
        return response()->json(['message' => 'PDF экспорт в разработке']);
    }

    /**
     * Экспорт в Excel
     */
    private function exportToExcel(Organization $organization, array $reportData)
    {
        // Здесь должна быть генерация Excel
        return response()->json(['message' => 'Excel экспорт в разработке']);
    }

    /**
     * Экспорт в CSV
     */
    private function exportToCsv(Organization $organization, array $reportData)
    {
        $filename = "report_{$organization->slug}_" . now()->format('Y-m-d_H-i-s') . '.csv';

        return response()->streamDownload(function () use ($reportData) {
            $output = fopen('php://output', 'w');

            // Заголовки
            fputcsv($output, ['Период', 'Значение', 'Количество'], ';');

            // Данные
            foreach ($reportData as $row) {
                fputcsv($output, [
                    $row['period'] ?? $row['date'] ?? '',
                    $row['total'] ?? $row['count'] ?? '',
                    $row['count'] ?? '',
                ], ';');
            }

            fclose($output);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * Рассчитать среднее время финансирования
     */
    private function calculateAverageFundingTime(Organization $organization, Carbon $startDate, Carbon $endDate): float
    {
        $projects = $organization->projects()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        if ($projects->isEmpty()) {
            return 0;
        }

        $totalDays = $projects->sum(function ($project) {
            return $project->updated_at->diffInDays($project->created_at);
        });

        return $totalDays / $projects->count();
    }

    /**
     * Рассчитать конверсию
     */
    private function calculateConversionRate(Organization $organization, Carbon $startDate, Carbon $endDate): float
    {
        $totalVisitors = $organization->statistics()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('unique_visitors');

        $donations = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return $totalVisitors > 0 ? ($donations / $totalVisitors) * 100 : 0;
    }

    /**
     * Рассчитать retention rate
     */
    private function calculateRetentionRate(Organization $organization, Carbon $startDate, Carbon $endDate): float
    {
        // Упрощенная логика для демонстрации
        $totalMembers = $organization->members()->count();
        $activeMembers = $organization->members()
            ->where('last_active_at', '>=', $startDate)
            ->count();

        return $totalMembers > 0 ? ($activeMembers / $totalMembers) * 100 : 0;
    }

    /**
     * Рассчитать рост
     */
    private function calculateGrowthRate(Organization $organization, Carbon $startDate, Carbon $endDate): float
    {
        $periodStart = $startDate->copy()->subMonth();
        $periodEnd = $startDate->copy()->subDay();

        $previousPeriod = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$periodStart, $periodEnd])
            ->sum('amount');

        $currentPeriod = $organization->donations()
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        return $previousPeriod > 0 ? (($currentPeriod - $previousPeriod) / $previousPeriod) * 100 : 0;
    }
}
