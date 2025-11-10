<?php

namespace App\Http\Controllers\Dashboard;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ExportReportRequest;
use App\Http\Requests\Reports\GenerateReportRequest;
use App\Http\Requests\Reports\StoreReportRequest;
use App\Http\Requests\Reports\UpdateReportRequest;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\ReportResource;
use App\Http\Resources\ReportRunResource;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\Report;
use App\Services\Reports\ReportService;
use App\Support\InertiaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class OrganizationReportsController extends Controller
{
    public function __construct(protected ReportService $reportService)
    {
        $this->middleware('auth');
    }

    public function index(Request $request, Organization $organization)
    {
        $filters = [
            'report_type' => $request->query('report_type'),
            'status' => $request->query('status'),
            'search' => $request->query('search'),
        ];

        $reportsPaginator = $this->reportService->listReports($organization, $filters);

        $recentRuns = $organization->reportRuns()
            ->with(['report'])
            ->latest('generated_at')
            ->limit(8)
            ->get();

        return Inertia::render('dashboard/organization/reports/Index', [
            'organization' => InertiaResource::item(new OrganizationResource($organization->load('primaryDomain'))),
            'reportTypes' => $this->reportService->availableReportDefinitions(),
            'reports' => InertiaResource::paginate($reportsPaginator, ReportResource::class),
            'recentRuns' => InertiaResource::list($recentRuns, ReportRunResource::class),
            'filters' => [
                'availableStatuses' => ReportStatus::values(),
                'availablePeriods' => ['day', 'week', 'month', 'quarter', 'year', 'custom'],
                'query' => array_filter($filters, fn($value) => $value !== null && $value !== ''),
            ],
            'projects' => $organization->projects()
                ->select('id', 'title', 'status')
                ->orderBy('title')
                ->limit(100)
                ->get(),
        ]);
    }

    public function store(StoreReportRequest $request, Organization $organization): JsonResponse
    {
        $report = $this->reportService->createReport(
            $organization,
            $request->validatedData(),
            $request->user()
        );

        return response()->json([
            'message' => 'Отчет сохранен',
            'report' => new ReportResource($report),
        ], 201);
    }

    public function update(UpdateReportRequest $request, Organization $organization, Report $report): JsonResponse
    {
        $this->reportService->ensureReportBelongsToOrganization($report, $organization);

        $updated = $this->reportService->updateReport(
            $report,
            $request->validatedData(),
            $request->user()
        );

        return response()->json([
            'message' => 'Отчет обновлен',
            'report' => new ReportResource($updated),
        ]);
    }

    public function destroy(Organization $organization, Report $report): Response
    {
        $this->reportService->ensureReportBelongsToOrganization($report, $organization);

        $this->reportService->deleteReport($report);

        return response()->noContent();
    }

    public function generate(GenerateReportRequest $request, Organization $organization): JsonResponse
    {
        $reportType = ReportType::from($request->input('report_type'));

        $project = $request->filled('project_id')
            ? $this->resolveProject($organization, (int) $request->input('project_id'))
            : null;

        $stage = $request->filled('project_stage_id')
            ? $this->resolveProjectStage($organization, (int) $request->input('project_stage_id'), $project)
            : null;

        $payload = $this->reportService->buildReportPayload(
            $organization,
            $reportType,
            [
                'period' => $request->input('period'),
                'date_from' => $request->input('date_from'),
                'date_to' => $request->input('date_to'),
                'group_by' => $request->input('group_by'),
                'status' => $request->input('status'),
                'include_revenue' => $request->input('include_revenue'),
                'include_members' => $request->input('include_members'),
                'include_projects' => $request->input('include_projects'),
                'include_analytics' => $request->input('include_analytics'),
                'include_inactive' => $request->input('include_inactive'),
            ],
            $project,
            $stage
        );

        $runResource = null;
        $reportResource = null;

        if ($request->boolean('persist')) {
            $reportModel = null;
            if ($request->filled('report_id')) {
                $reportModel = $organization->reports()->findOrFail((int) $request->input('report_id'));
                $this->reportService->ensureReportBelongsToOrganization($reportModel, $organization);
            }

            $run = $this->reportService->persistRun(
                $payload,
                $organization,
                $request->user(),
                $reportModel,
                $project,
                $stage
            );

            $runResource = new ReportRunResource($run);

            if ($reportModel) {
                $reportResource = new ReportResource($reportModel->fresh(['latestRun', 'project', 'projectStage']));
            }
        }

        return response()->json([
            'message' => 'Отчет сформирован',
            'payload' => $payload,
            'run' => $runResource,
            'report' => $reportResource,
        ]);
    }

    public function export(ExportReportRequest $request, Organization $organization): Response
    {
        $reportType = ReportType::from($request->input('report_type'));
        $data = $request->input('data');
        $filename = $request->input('filename');

        return $this->reportService->export($reportType, [
            'data' => $data,
            'filters' => $request->input('filters', []),
            'summary' => $request->input('summary', []),
        ], $request->input('format'), $filename);
    }

    public function runs(Organization $organization, Report $report): JsonResponse
    {
        $this->reportService->ensureReportBelongsToOrganization($report, $organization);

        $runs = $report->runs()->latest('generated_at')->paginate(10);

        return response()->json(
            InertiaResource::paginate($runs, ReportRunResource::class)
        );
    }

    public function projectStages(Organization $organization, Project $project): JsonResponse
    {
        if ($project->organization_id !== $organization->id) {
            abort(404);
        }

        $stages = $project->stages()
            ->select('id', 'title', 'status', 'start_date', 'end_date')
            ->orderBy('order')
            ->get();

        return response()->json([
            'project' => [
                'id' => $project->id,
                'title' => $project->title,
            ],
            'stages' => $stages,
        ]);
    }

    public function projectOptions(Organization $organization): JsonResponse
    {
        $projects = $organization->projects()
            ->select('id', 'title', 'status')
            ->orderBy('title')
            ->paginate(20);

        return response()->json($projects);
    }

    protected function resolveProject(Organization $organization, int $projectId): Project
    {
        $project = $organization->projects()->findOrFail($projectId);

        if ($project->organization_id !== $organization->id) {
            abort(404);
        }

        return $project;
    }

    protected function resolveProjectStage(Organization $organization, int $stageId, ?Project $project = null): ProjectStage
    {
        $stage = ProjectStage::query()
            ->where('id', $stageId)
            ->when($project, fn($query) => $query->where('project_id', $project->id))
            ->firstOrFail();

        if ($stage->project->organization_id !== $organization->id) {
            abort(404);
        }

        return $stage;
    }
}
