<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\OrganizationStatus;

class StoreOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9-]+$/',
                Rule::unique('organizations', 'slug'),
            ],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', Rule::in(['school', 'university', 'kindergarten', 'other'])],
            'status' => ['required', 'string', Rule::in(array_column(OrganizationStatus::cases(), 'value'))],
            'needs_target_amount' => ['nullable', 'numeric', 'min:0'],
            'needs_collected_amount' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'needs_target_amount' => $this->normalizeNumericInput($this->input('needs_target_amount')),
            'needs_collected_amount' => $this->normalizeNumericInput($this->input('needs_collected_amount')),
        ]);
    }

    private function normalizeNumericInput(mixed $value): mixed
    {
        if ($value === null) {
            return null;
        }

        if ($value === '' || $value === 'null') {
            return null;
        }

        if (is_numeric($value)) {
            return $value;
        }

        $clean = preg_replace('/[^\d.,-]/', '', (string) $value);
        if ($clean === '') {
            return null;
        }

        $normalized = str_replace(',', '.', $clean);
        return is_numeric($normalized) ? $normalized : null;
    }
}
