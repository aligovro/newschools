<?php

namespace App\Http\Requests\Public;

use App\Services\Sponsors\ProjectSponsorService;
use Illuminate\Foundation\Http\FormRequest;

class ProjectSponsorsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sort' => $this->input('sort', 'top'),
            'per_page' => $this->input('per_page', ProjectSponsorService::DEFAULT_PER_PAGE),
            'page' => $this->input('page', 1),
        ]);
    }

    public function rules(): array
    {
        return [
            'sort' => 'sometimes|in:top,recent',
            'per_page' => 'sometimes|integer|min:1|max:' . ProjectSponsorService::MAX_PER_PAGE,
            'page' => 'sometimes|integer|min:1',
        ];
    }

    public function sort(): string
    {
        return (string) ($this->validated()['sort'] ?? 'top');
    }

    public function perPage(): int
    {
        return (int) ($this->validated()['per_page'] ?? ProjectSponsorService::DEFAULT_PER_PAGE);
    }

    public function page(): int
    {
        return (int) ($this->validated()['page'] ?? 1);
    }
}

