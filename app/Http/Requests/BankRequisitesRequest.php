<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Request для валидации банковских реквизитов
 */
class BankRequisitesRequest extends FormRequest
{
    /**
     * Правила валидации
     */
    public function rules(): array
    {
        return [
            // Структурированные поля
            'recipient_name' => 'nullable|string|max:500',
            'organization_form' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:500',
            'bank_name' => 'nullable|string|max:255',
            'inn' => 'nullable|string|max:12',
            'kpp' => 'nullable|string|max:9',
            'bik' => 'nullable|string|max:9',
            'account' => 'nullable|string|max:20',
            'corr_account' => 'nullable|string|max:20',
            'beneficiary_name' => 'nullable|string|max:500',
            'ogrn' => 'nullable|string|max:15',
            'address' => 'nullable|string|max:1000',
            // Старые поля для обратной совместимости
            'bank_requisites' => 'nullable|string',
            'sber_card' => 'nullable|string|max:19',
            'tinkoff_card' => 'nullable|string|max:19',
            'card_recipient' => 'nullable|string|max:255',
        ];
    }
}
