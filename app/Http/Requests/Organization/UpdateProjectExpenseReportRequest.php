<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectExpenseReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'          => ['sometimes', 'required', 'string', 'max:500'],
            'amount_kopecks' => ['sometimes', 'required', 'integer', 'min:0'],
            'status'         => ['nullable', 'string', 'in:paid,pending'],
            'report_date'    => ['sometimes', 'required', 'date'],
            'pdf_file'       => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
        ];
    }
}
