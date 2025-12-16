<?php

namespace App\Http\Requests\YooKassa;

use Illuminate\Foundation\Http\FormRequest;

class SyncMerchantRequest extends FormRequest
{
  public function authorize(): bool
  {
    // Разрешаем синхронизацию всем авторизованным пользователям
    // Синхронизация - это обновление данных уже привязанного мерчанта
    // Мерчант уже привязан к организации через OAuth, поэтому синхронизация безопасна
    return $this->user() !== null;
  }

  public function rules(): array
  {
    return [
      'with_payments' => ['nullable', 'boolean'],
      'with_payouts' => ['nullable', 'boolean'],
    ];
  }
}
