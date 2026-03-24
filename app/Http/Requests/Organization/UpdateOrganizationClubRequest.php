<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrganizationClubRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:10240'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'schedule' => ['nullable', 'array'],
            'schedule.mon' => ['nullable', 'string', 'max:20'],
            'schedule.tue' => ['nullable', 'string', 'max:20'],
            'schedule.wed' => ['nullable', 'string', 'max:20'],
            'schedule.thu' => ['nullable', 'string', 'max:20'],
            'schedule.fri' => ['nullable', 'string', 'max:20'],
            'schedule.sat' => ['nullable', 'string', 'max:20'],
            'schedule.sun' => ['nullable', 'string', 'max:20'],
            'gallery' => ['nullable', 'array', 'max:10'],
            'gallery.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'existing_gallery' => ['nullable', 'array'],
            'existing_gallery.*' => ['string'],
            'gallery_sync' => ['nullable', 'string', 'in:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Название кружка/секции обязательно.',
            'gallery.max' => 'Можно загрузить максимум 10 изображений',
        ];
    }
}
