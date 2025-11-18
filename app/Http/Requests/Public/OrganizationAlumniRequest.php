<?php

namespace App\Http\Requests\Public;

use App\Services\Organizations\OrganizationAlumniService;
use Illuminate\Foundation\Http\FormRequest;

class OrganizationAlumniRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'per_page' => $this->input('per_page', OrganizationAlumniService::DEFAULT_PER_PAGE),
            'page' => $this->input('page', 1),
        ]);
    }

    public function rules(): array
    {
        return [
            'per_page' => 'sometimes|integer|min:1|max:' . OrganizationAlumniService::MAX_PER_PAGE,
            'page' => 'sometimes|integer|min:1',
        ];
    }

    public function perPage(): int
    {
        return (int) ($this->validated()['per_page'] ?? OrganizationAlumniService::DEFAULT_PER_PAGE);
    }

    public function page(): int
    {
        return (int) ($this->validated()['page'] ?? 1);
    }
}


