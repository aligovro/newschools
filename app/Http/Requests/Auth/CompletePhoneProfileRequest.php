<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CompletePhoneProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
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
                Rule::unique(User::class, 'email')->ignore($this->user()?->id),
            ],
            'photo' => ['nullable', 'string', 'max:500'],
            'password' => ['nullable', 'string', 'min:6', 'confirmed'],
            'password_confirmation' => ['nullable', 'string'],
        ];
    }
}


