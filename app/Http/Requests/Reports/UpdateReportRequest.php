<?php

namespace App\Http\Requests\Reports;

use App\Enums\ReportStatus;
use App\Enums\ReportType;
use App\Enums\ReportVisibility;
use App\Models\ProjectStage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReportRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $filters = $this->input('filters', []);

        foreach ([
            'include_inactive',
            'include_revenue',
            'include_members',
            'include_projects',
            'include_analytics',
        ] as $booleanKey) {
            if (array_key_exists($booleanKey, $filters)) {
                $filters[$booleanKey] = filter_var(
                    $filters[$booleanKey],
                    FILTER_VALIDATE_BOOL,
                    FILTER_NULL_ON_FAILURE
                );
            }
        }

        $this->merge([
            'filters' => $filters,
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
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'description' => ['nullable', 'string'],
            'report_type' => ['sometimes', Rule::enum(ReportType::class)],
            'status' => ['nullable', 'string', Rule::in(ReportStatus::values())],
            'visibility' => ['nullable', 'string', Rule::in(ReportVisibility::values())],
            'project_id' => ['nullable', 'integer', 'exists:projects,id'],
            'project_stage_id' => ['nullable', 'integer', 'exists:project_stages,id'],
            'filters' => ['nullable', 'array'],
            'filters.period' => ['nullable', 'string', Rule::in(['day', 'week', 'month', 'quarter', 'year', 'custom'])],
            'filters.date_from' => ['nullable', 'date'],
            'filters.date_to' => ['nullable', 'date', 'after_or_equal:filters.date_from'],
            'filters.group_by' => ['nullable', 'string'],
            'filters.status' => ['nullable', 'string'],
            'filters.include_inactive' => ['nullable', 'boolean'],
            'filters.include_revenue' => ['nullable', 'boolean'],
            'filters.include_members' => ['nullable', 'boolean'],
            'filters.include_projects' => ['nullable', 'boolean'],
            'filters.include_analytics' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
            'summary' => ['nullable', 'array'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $projectId = $this->input('project_id');
            $stageId = $this->input('project_stage_id');

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
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function validatedData(): array
    {
        $data = $this->validated();

        if (isset($data['report_type'])) {
            $reportType = ReportType::from($data['report_type']);
            $data['filters'] = array_replace_recursive(
                $reportType->defaultConfig(),
                $data['filters'] ?? []
            );
        }

        return $data;
    }
}


