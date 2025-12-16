<?php

namespace App\Http\Requests\YooKassa;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
  public function authorize(): bool
  {
    return $this->user()?->can('payments.manage') ?? false;
  }

  public function rules(): array
  {
    return [
      'credentials' => ['required', 'array'],
      'credentials.client_id' => ['required', 'string', 'max:255'],
      'credentials.secret_key' => ['required', 'string', 'max:255'],
      'credentials.account_id' => ['nullable', 'string', 'max:255'],
      'credentials.base_url' => ['nullable', 'url'],
      'options' => ['nullable', 'array'],
      'webhook' => ['nullable', 'array'],
      'webhook.url' => ['nullable', 'url'],
      'webhook.secret' => ['nullable', 'string', 'max:255'],
    ];
  }
}
