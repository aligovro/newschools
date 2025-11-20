<?php

namespace App\Http\Requests\SuggestedOrganization;

use App\Models\SuggestedOrganization;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSuggestedOrganizationRequest extends FormRequest
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
      'name' => ['sometimes', 'required', 'string', 'max:255'],
      'locality_id' => ['nullable', 'integer', 'exists:localities,id'],
      'city_name' => ['nullable', 'string', 'max:255'],
      'address' => ['nullable', 'string', 'max:500'],
      'latitude' => ['nullable', 'numeric', 'between:-90,90'],
      'longitude' => ['nullable', 'numeric', 'between:-180,180'],
      'status' => ['sometimes', 'string', Rule::in(SuggestedOrganization::STATUSES)],
      'admin_notes' => ['nullable', 'string', 'max:1000'],
    ];
  }
}
