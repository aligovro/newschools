<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProjectExpenseReportResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectExpenseReportsController extends Controller
{
    private const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    private const PER_PAGE  = 3;

    public function index(Request $request, Project $project): JsonResponse
    {
        $month   = $request->get('month'); // "2026-02"
        $perPage = max(1, min((int) $request->get('per_page', self::PER_PAGE), 20));
        $page    = max(1, (int) $request->get('page', 1));

        $query = $project->expenseReports();

        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            [$year, $mon] = explode('-', $month);
            $query->whereYear('report_date', $year)
                  ->whereMonth('report_date', $mon);
        }

        $paginator = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data'       => ProjectExpenseReportResource::collection($paginator->items())->resolve($request),
            'has_more'   => $paginator->currentPage() < $paginator->lastPage(),
            'month_tabs' => $this->getMonthTabs($project),
        ]);
    }

    private function getMonthTabs(Project $project): array
    {
        return $project->expenseReports()
            ->selectRaw('YEAR(report_date) as year, MONTH(report_date) as month, COUNT(*) as cnt')
            ->groupByRaw('YEAR(report_date), MONTH(report_date)')
            ->reorder()
            ->orderByRaw('YEAR(report_date) DESC, MONTH(report_date) DESC')
            ->get()
            ->map(fn ($row) => [
                'value' => sprintf('%04d-%02d', $row->year, $row->month),
                'label' => self::MONTHS_RU[$row->month - 1] . ' ' . $row->year,
                'count' => (int) $row->cnt,
            ])
            ->toArray();
    }
}
