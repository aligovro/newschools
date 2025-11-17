<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyPhoneCodeRequest extends FormRequest
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
            'token' => ['required', 'uuid'],
            'code' => ['required', 'digits:6'],
            'organization_id' => ['nullable', 'exists:organizations,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'remember' => ['sometimes', 'boolean'],
        ];
    }
}


