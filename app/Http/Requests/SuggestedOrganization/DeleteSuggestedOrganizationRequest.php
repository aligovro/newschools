<?php

namespace App\Http\Requests\SuggestedOrganization;

use Illuminate\Foundation\Http\FormRequest;

class DeleteSuggestedOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isSuperAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}


