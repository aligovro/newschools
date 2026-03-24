<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\Organization\StoreProjectExpenseReportRequest;
use App\Http\Requests\Organization\UpdateProjectExpenseReportRequest;
use App\Http\Resources\ProjectExpenseReportResource;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectExpenseReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ProjectExpenseReportController extends Controller
{
    private function assertProjectBelongs(Organization $organization, Project $project): void
    {
        if ($project->organization_id !== $organization->id) {
            abort(404);
        }
    }

    private function assertReportBelongs(Project $project, ProjectExpenseReport $report): void
    {
        if ($report->project_id !== $project->id) {
            abort(404);
        }
    }

    public function index(
        Request $request,
        Organization $organization,
        Project $project,
    ): JsonResponse|InertiaResponse {
        $this->assertProjectBelongs($organization, $project);

        $perPage = min((int) $request->get('per_page', 20), 100);
        $reports = $project->expenseReports()->paginate($perPage);

        if ($request->wantsJson()) {
            return response()->json([
                'data' => ProjectExpenseReportResource::collection($reports->items()),
                'pagination' => [
                    'current_page' => $reports->currentPage(),
                    'last_page'    => $reports->lastPage(),
                    'per_page'     => $reports->perPage(),
                    'total'        => $reports->total(),
                ],
            ]);
        }

        return Inertia::render('dashboard/projects/ProjectExpenseReportsPage', [
            'organization'   => $organization->only(['id', 'name', 'slug']),
            'project'        => $project->only(['id', 'title', 'slug']),
            'initialReports' => ProjectExpenseReportResource::collection($reports->items())->resolve(),
            'hasMore'        => $reports->currentPage() < $reports->lastPage(),
        ]);
    }

    public function store(
        StoreProjectExpenseReportRequest $request,
        Organization $organization,
        Project $project,
    ): JsonResponse {
        $this->assertProjectBelongs($organization, $project);

        $data = $request->only(['title', 'amount_kopecks', 'status', 'report_date']);
        $data['status'] ??= 'paid';

        if ($request->hasFile('pdf_file')) {
            $file = $request->file('pdf_file');
            $data['pdf_file']      = $file->store('project-expense-reports', 'public');
            $data['pdf_file_size'] = $file->getSize();
        }

        $report = $project->expenseReports()->create($data);

        return response()->json([
            'message' => 'Отчёт успешно добавлен',
            'data'    => new ProjectExpenseReportResource($report),
        ], 201);
    }

    public function update(
        UpdateProjectExpenseReportRequest $request,
        Organization $organization,
        Project $project,
        ProjectExpenseReport $expenseReport,
    ): JsonResponse {
        $this->assertProjectBelongs($organization, $project);
        $this->assertReportBelongs($project, $expenseReport);

        $data = $request->only(['title', 'amount_kopecks', 'status', 'report_date']);

        if ($request->hasFile('pdf_file')) {
            if ($expenseReport->pdf_file && Storage::disk('public')->exists($expenseReport->pdf_file)) {
                Storage::disk('public')->delete($expenseReport->pdf_file);
            }
            $file = $request->file('pdf_file');
            $data['pdf_file']      = $file->store('project-expense-reports', 'public');
            $data['pdf_file_size'] = $file->getSize();
        }

        $expenseReport->update($data);

        return response()->json([
            'message' => 'Отчёт успешно обновлён',
            'data'    => new ProjectExpenseReportResource($expenseReport->fresh()),
        ]);
    }

    public function destroy(
        Organization $organization,
        Project $project,
        ProjectExpenseReport $expenseReport,
    ): JsonResponse {
        $this->assertProjectBelongs($organization, $project);
        $this->assertReportBelongs($project, $expenseReport);

        if ($expenseReport->pdf_file && Storage::disk('public')->exists($expenseReport->pdf_file)) {
            Storage::disk('public')->delete($expenseReport->pdf_file);
        }

        $expenseReport->delete();

        return response()->json(['message' => 'Отчёт успешно удалён']);
    }
}
