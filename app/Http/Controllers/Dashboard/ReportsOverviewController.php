<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\ReportStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReportResource;
use App\Models\Organization;
use App\Models\Site;
use App\Services\Reports\ReportService;
use App\Support\InertiaResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportsOverviewController extends Controller
{
    public function __construct(private readonly ReportService $reportService)
    {
        $this->middleware('auth');
    }

    public function index(Request $request): Response
    {
        $user = $request->user();

        if (!$user->hasRole('super_admin')) {
            abort(403);
        }

        $filters = [
            'organization_id' => $request->query('organization_id', 'all'),
            'site_id' => $request->query('site_id', 'all'),
            'report_type' => $request->query('report_type', 'all'),
            'status' => $request->query('status', 'all'),
            'search' => $request->query('search'),
            'per_page' => $request->query('per_page'),
        ];

        $reportsPaginator = $this->reportService->listAllReports($filters);

        $organizations = Organization::select('id', 'name')
            ->orderBy('name')
            ->get();

        $sites = collect();
        if ($filters['organization_id'] !== 'all' && $filters['organization_id']) {
            $sites = Site::query()
                ->where('organization_id', $filters['organization_id'])
                ->select('id', 'name', 'status')
                ->orderBy('name')
                ->get();
        }

        return Inertia::render('dashboard/reports/Index', [
            'reportTypes' => $this->reportService->availableReportDefinitions(),
            'reports' => InertiaResource::paginate($reportsPaginator, ReportResource::class),
            'filters' => [
                'availableStatuses' => ReportStatus::values(),
                'query' => array_filter(
                    $filters,
                    fn ($value) => $value !== null && $value !== '' && $value !== 'all'
                ),
            ],
            'organizations' => $organizations,
            'sites' => $sites,
        ]);
    }
}


