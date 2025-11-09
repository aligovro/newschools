<?php

namespace App\Http\Requests\Reports;

use App\Enums\ReportType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportReportRequest extends FormRequest
{
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
            'format' => ['required', 'string', Rule::in(['pdf', 'excel', 'csv'])],
            'data' => ['required', 'array'],
            'filename' => ['nullable', 'string', 'max:255'],
        ];
    }
}


