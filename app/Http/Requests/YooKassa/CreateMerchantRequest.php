<?php

namespace App\Http\Requests\YooKassa;

use Illuminate\Foundation\Http\FormRequest;

class CreateMerchantRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('payments.manage') ?? false;
  }

  public function rules(): array
  {
    return [
      'settings' => ['array'],
      'settings.brand_name' => ['nullable', 'string', 'max:255'],
      'settings.description' => ['nullable', 'string', 'max:2000'],
      'settings.website' => ['nullable', 'url'],
      'submit' => ['nullable', 'boolean'],
    ];
  }
}
