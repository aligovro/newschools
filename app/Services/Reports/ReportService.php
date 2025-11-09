<?php

namespace App\Services\Reports;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Enums\ReportVisibility;
use App\Models\Organization;
use App\Models\Project;
use App\Models\ProjectStage;
use App\Models\Report;
use App\Models\ReportRun;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function __construct(
        protected ReportGenerator $generator,
        protected ReportExporter $exporter,
    ) {
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function availableReportDefinitions(): array
    {
        return [
            [
                'id' => ReportType::Revenue->value,
                'name' => ReportType::Revenue->label(),
                'description' => 'Анализ поступлений от пожертвований',
                'icon' => 'trending-up',
                'color' => 'green',
                'defaults' => ReportType::Revenue->defaultConfig(),
                'groupings' => ReportType::Revenue->allowedGroupings(),
            ],
            [
                'id' => ReportType::Members->value,
                'name' => ReportType::Members->label(),
                'description' => 'Статистика регистраций и активности участников',
                'icon' => 'users',
                'color' => 'blue',
                'defaults' => ReportType::Members->defaultConfig(),
                'groupings' => ReportType::Members->allowedGroupings(),
            ],
            [
                'id' => ReportType::Projects->value,
                'name' => ReportType::Projects->label(),
                'description' => 'Анализ эффективности проектов',
                'icon' => 'folder',
                'color' => 'purple',
                'defaults' => ReportType::Projects->defaultConfig(),
                'groupings' => ReportType::Projects->allowedGroupings(),
            ],
            [
                'id' => ReportType::Comprehensive->value,
                'name' => ReportType::Comprehensive->label(),
                'description' => 'Полный анализ деятельности организации',
                'icon' => 'bar-chart',
                'color' => 'orange',
                'defaults' => ReportType::Comprehensive->defaultConfig(),
                'groupings' => ReportType::Comprehensive->allowedGroupings(),
            ],
            [
                'id' => ReportType::Custom->value,
                'name' => ReportType::Custom->label(),
                'description' => 'Гибкая настройка отчета под ваши задачи',
                'icon' => 'sparkles',
                'color' => 'cyan',
                'defaults' => ReportType::Custom->defaultConfig(),
                'groupings' => ReportType::Custom->allowedGroupings(),
            ],
        ];
    }

    /**
     * @param array<string, mixed> $filters
     */
    public function listReports(Organization $organization, array $filters = []): LengthAwarePaginator
    {
        $query = $organization->reports()
            ->with(['project', 'projectStage', 'creator', 'updater', 'latestRun'])
            ->withCount('runs');

        if (isset($filters['report_type']) && $filters['report_type'] !== 'all') {
            $query->where('report_type', $filters['report_type']);
        }

        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search']) && $filters['search']) {
            $query->where(function (Builder $builder) use ($filters) {
                $builder->where('title', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->latest()->paginate(10)->withQueryString();
    }

    /**
     * @param array<string, mixed> $data
     */
    public function createReport(Organization $organization, array $data, ?User $user = null): Report
    {
        return DB::transaction(function () use ($organization, $data, $user) {
            $report = new Report();
            $report->fill($data);
            $report->organization()->associate($organization);
            $report->status = $data['status'] ?? ReportStatus::Draft->value;
            $report->visibility = $data['visibility'] ?? ReportVisibility::Private->value;

            if (!empty($data['project_id'])) {
                $report->project()->associate($data['project_id']);
            }

            if (!empty($data['project_stage_id'])) {
                $report->projectStage()->associate($data['project_stage_id']);
            }

            if ($user) {
                $report->creator()->associate($user);
                $report->updater()->associate($user);
            }

            $report->save();

            return $report->fresh(['project', 'projectStage', 'creator', 'updater', 'latestRun']);
        });
    }

    /**
     * @param array<string, mixed> $data
     */
    public function updateReport(Report $report, array $data, ?User $user = null): Report
    {
        return DB::transaction(function () use ($report, $data, $user) {
            $report->fill($data);

            if (array_key_exists('project_id', $data)) {
                $report->project()->dissociate();
                if (!empty($data['project_id'])) {
                    $report->project()->associate($data['project_id']);
                }
            }

            if (array_key_exists('project_stage_id', $data)) {
                $report->projectStage()->dissociate();
                if (!empty($data['project_stage_id'])) {
                    $report->projectStage()->associate($data['project_stage_id']);
                }
            }

            if ($user) {
                $report->updater()->associate($user);
            }

            $report->save();

            return $report->fresh(['project', 'projectStage', 'creator', 'updater', 'latestRun']);
        });
    }

    public function deleteReport(Report $report): void
    {
        $report->delete();
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function buildReportPayload(
        Organization $organization,
        ReportType $reportType,
        array $filters,
        ?Project $project = null,
        ?ProjectStage $stage = null,
    ): array {
        return $this->generator->generate($organization, $reportType, $filters, $project, $stage);
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function persistRun(
        array $payload,
        Organization $organization,
        ?User $user = null,
        ?Report $report = null,
        ?Project $project = null,
        ?ProjectStage $stage = null,
    ): ReportRun {
        return DB::transaction(function () use ($payload, $organization, $user, $report, $project, $stage) {
            $run = new ReportRun();
            $run->report_type = Arr::get($payload, 'type');
            $run->filters = Arr::get($payload, 'filters', []);
            $run->meta = Arr::get($payload, 'meta', []);
            $run->summary = Arr::get($payload, 'summary', []);
            $run->data = Arr::get($payload, 'data', []);
            $run->rows_count = Arr::get($payload, 'rows_count', 0);
            $run->generated_at = Arr::get($payload, 'generated_at', now());
            $run->organization()->associate($organization);

            if ($report) {
                $run->report()->associate($report);

                $report->update([
                    'filters' => Arr::get($payload, 'filters', $report->filters ?? []),
                    'summary' => $run->summary,
                    'meta' => array_filter([
                        ...($report->meta ?? []),
                        ...Arr::get($payload, 'meta', []),
                    ]),
                    'generated_at' => $run->generated_at,
                ]);
            }

            if ($project) {
                $run->project()->associate($project);
            }

            if ($stage) {
                $run->projectStage()->associate($stage);
            }

            if ($user) {
                $run->generator()->associate($user);
            }

            $run->save();

            return $run->fresh(['report', 'organization', 'project', 'projectStage', 'generator']);
        });
    }

    /**
     * @param array<string, mixed> $payload
     */
    public function export(ReportType $reportType, array $payload, string $format = 'csv', ?string $filename = null): Response
    {
        return $this->exporter->export($reportType, $payload, $format, $filename);
    }

    public function ensureReportBelongsToOrganization(Report $report, Organization $organization): void
    {
        if ($report->organization_id && $report->organization_id !== $organization->id) {
            abort(404);
        }
    }
}


