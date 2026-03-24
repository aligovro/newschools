<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectExpenseReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'          => ['required', 'string', 'max:500'],
            'amount_kopecks' => ['required', 'integer', 'min:0'],
            'status'         => ['nullable', 'string', 'in:paid,pending'],
            'report_date'    => ['required', 'date'],
            'pdf_file'       => ['nullable', 'file', 'mimes:pdf', 'max:20480'],
        ];
    }
}
