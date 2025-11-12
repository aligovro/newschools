<?php

namespace App\Http\Requests\SuggestedOrganization;

use App\Models\SuggestedOrganization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SuggestedOrganizationListRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'search' => ['sometimes', 'string', 'max:255'],
            'status' => ['sometimes', 'string', Rule::in(SuggestedOrganization::STATUSES)],
            'sort_by' => ['sometimes', 'string', Rule::in(SuggestedOrganization::SORTABLE_FIELDS)],
            'sort_direction' => ['sometimes', 'string', Rule::in(['asc', 'desc'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'city_id' => ['sometimes', 'integer', 'exists:cities,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort_by' => $this->input('sort_by', 'created_at'),
            'sort_direction' => $this->input('sort_direction', 'desc'),
            'per_page' => $this->input('per_page', 15),
            'page' => $this->input('page', 1),
        ]);
    }

    /**
     * @param string|null $key
     * @param mixed $default
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null)
    {
        /** @var array<string, mixed> $data */
        $data = parent::validated($key, $default);

        $data['sort_by'] ??= 'created_at';
        $data['sort_direction'] ??= 'desc';
        $data['per_page'] ??= 15;
        $data['page'] ??= 1;

        return $data;
    }
}


