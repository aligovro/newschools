<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectStagesRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'stages' => 'required|array',
      'stages.*.id' => 'nullable|integer|exists:project_stages,id',
      'stages.*.title' => 'nullable|string|max:255',
      'stages.*.description' => 'nullable|string',
      'stages.*.target_amount' => 'nullable|numeric',
      'stages.*.existing_image' => 'nullable|string',
      'stages.*.gallery' => 'nullable|array',
      'stages.*.remove_image' => 'nullable|boolean',
    ];
  }
}
