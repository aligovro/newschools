<?php

namespace App\Http\Requests\ClubApplication;

use Illuminate\Foundation\Http\FormRequest;

class StoreClubApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'club_id'         => ['nullable', 'integer', 'exists:organization_clubs,id'],
            'organization_id' => ['required', 'integer', 'exists:organizations,id'],
            'club_name'       => ['required', 'string', 'max:255'],
            'name'            => ['required', 'string', 'max:255'],
            'phone'           => ['required', 'string', 'max:30'],
            'comment'         => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'            => 'Укажите ваше имя',
            'phone.required'           => 'Укажите номер телефона',
            'organization_id.required' => 'Не указана организация',
            'organization_id.exists'   => 'Организация не найдена',
        ];
    }
}
