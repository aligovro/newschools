<?php

namespace App\Http\Requests\Auth;

use App\Rules\RussianPhoneNumber;
use App\Support\PhoneNumber;
use Illuminate\Foundation\Http\FormRequest;

class RequestPhoneVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'phone' => ['required', new RussianPhoneNumber()],
            'organization_id' => ['nullable', 'exists:organizations,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('phone')) {
            $normalized = PhoneNumber::normalize($this->input('phone'));
            if ($normalized) {
                $this->merge(['phone' => $normalized]);
            }
        }
    }
}


