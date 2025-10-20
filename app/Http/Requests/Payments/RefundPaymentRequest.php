<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'amount' => ['nullable', 'numeric', 'min:1'],
      'reason' => ['nullable', 'string', 'max:500'],
    ];
  }
}
