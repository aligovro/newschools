<?php

namespace App\Http\Requests\Reports;

use App\Enums\ReportType;
use App\Models\Project;
use App\Models\ProjectStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateReportRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'include_revenue' => $this->toBool($this->input('include_revenue', true)),
            'include_members' => $this->toBool($this->input('include_members', true)),
            'include_projects' => $this->toBool($this->input('include_projects', true)),
            'include_analytics' => $this->toBool($this->input('include_analytics', true)),
            'include_inactive' => $this->toBool($this->input('include_inactive', false)),
            'persist' => $this->toBool($this->input('persist', false)),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'report_type' => ['required', Rule::enum(ReportType::class)],
            'period' => ['required', 'string', Rule::in(['day', 'week', 'month', 'quarter', 'year', 'custom'])],
            'date_from' => ['nullable', 'date', 'required_if:period,custom'],
            'date_to' => ['nullable', 'date', 'required_if:period,custom', 'after_or_equal:date_from'],
            'group_by' => ['nullable', 'string'],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'project_stage_id' => ['nullable', 'integer', 'exists:project_stages,id'],
            'site_id' => ['nullable', 'integer', 'exists:sites,id'],
            'format' => ['nullable', 'string', Rule::in(['json', 'pdf', 'excel', 'csv'])],
            'status' => ['nullable', 'string', Rule::in(['all', 'active', 'completed', 'failed', 'cancelled'])],
            'include_revenue' => ['boolean'],
            'include_members' => ['boolean'],
            'include_projects' => ['boolean'],
            'include_analytics' => ['boolean'],
            'include_inactive' => ['boolean'],
            'persist' => ['boolean'],
            'report_id' => ['nullable', 'integer', 'exists:reports,id'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $projectId = $this->input('project_id');
            $stageId = $this->input('project_stage_id');
            $siteId = $this->input('site_id');
            /** @var Organization|null $organization */
            $organization = $this->route('organization');

            if ($stageId) {
                $stage = ProjectStage::find($stageId);

                if (!$stage) {
                    return;
                }

                if ($projectId && $stage->project_id !== (int) $projectId) {
                    $validator->errors()->add(
                        'project_stage_id',
                        'Выбранный этап не принадлежит указанному проекту.'
                    );
                }
            }

            if ($projectId && !$stageId) {
                $project = Project::find($projectId);
                if ($project === null) {
                    $validator->errors()->add('project_id', 'Выбранный проект не найден.');
                }
            }

            if ($siteId && $organization) {
                $hasSite = $organization->sites()->whereKey($siteId)->exists();
                if (!$hasSite) {
                    $validator->errors()->add('site_id', 'Выбранный сайт не принадлежит организации.');
                }
            }
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return [
            'period' => $this->input('period'),
            'date_from' => $this->input('date_from'),
            'date_to' => $this->input('date_to'),
            'group_by' => $this->input('group_by'),
            'status' => $this->input('status'),
            'include_revenue' => $this->boolean('include_revenue'),
            'include_members' => $this->boolean('include_members'),
            'include_projects' => $this->boolean('include_projects'),
            'include_analytics' => $this->boolean('include_analytics'),
            'include_inactive' => $this->boolean('include_inactive'),
            'site_id' => $this->input('site_id'),
        ];
    }

    private function toBool(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false;
    }
}


