<?php

namespace App\Http\Requests\YooKassa;

use Illuminate\Foundation\Http\FormRequest;

class SyncMerchantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage-payments');
    }

    public function rules(): array
    {
        return [
            'with_payments' => ['nullable', 'boolean'],
            'with_payouts' => ['nullable', 'boolean'],
        ];
    }
}

