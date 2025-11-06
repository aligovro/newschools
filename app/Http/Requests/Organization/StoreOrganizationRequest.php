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
    ];
  }
}
