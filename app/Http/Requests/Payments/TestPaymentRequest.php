<?php

namespace App\Http\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class TestPaymentRequest extends FormRequest
{
  public function authorize(): bool
  {
    return true;
  }

  public function rules(): array
  {
    return [
      'amount' => ['required', 'numeric', 'min:1', 'max:1000'],
      'payment_method' => ['required', 'string'],
    ];
  }
}
