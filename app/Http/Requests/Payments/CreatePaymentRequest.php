<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class CreatePaymentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'amount' => ['required', 'numeric', 'min:1'],
      'payment_method' => ['required', 'string'],
      'member_id' => ['nullable', 'exists:members,id'],
      'project_id' => ['nullable', 'exists:organization_projects,id'],
      'description' => ['nullable', 'string', 'max:500'],
      'return_url' => ['nullable', 'url'],
      'idempotency_key' => ['nullable', 'string', 'max:100'],
    ];
  }
}
