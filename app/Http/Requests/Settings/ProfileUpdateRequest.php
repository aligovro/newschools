<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use App\Rules\RussianPhoneNumber;
use App\Support\PhoneNumber;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'nullable',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class, 'email')->ignore($this->user()->id),
            ],
            'phone' => [
                'nullable',
                new RussianPhoneNumber(required: false),
                Rule::unique(User::class, 'phone')->ignore($this->user()->id),
            ],
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $email = $this->input('email');
            $phone = $this->input('phone');

            if (empty($email) && empty($phone)) {
                $validator->errors()->add('email', __('Укажите email или номер телефона'));
                $validator->errors()->add('phone', __('Укажите email или номер телефона'));
            }
        });
    }
}
