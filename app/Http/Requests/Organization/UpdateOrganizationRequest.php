<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\OrganizationStatus;

class UpdateOrganizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string', Rule::in(['school', 'university', 'kindergarten', 'other'])],
            'status' => ['required', 'string', Rule::in(array_column(OrganizationStatus::cases(), 'value'))],
            'address' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'email'],
            'website' => ['nullable', 'url'],
            'region_id' => ['nullable', 'exists:regions,id'],
            'city_id' => ['nullable', 'exists:cities,id'],
            'settlement_id' => ['nullable', 'exists:settlements,id'],
            'founded_at' => ['nullable', 'date'],
            'is_public' => ['sometimes', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'city_name' => ['nullable', 'string', 'max:255'],
            'logo' => ['sometimes', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:10240'],
            // Галерея изображений (новые файлы)
            'images' => ['nullable', 'array', 'max:20'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
            // Существующие изображения (строки путей) для сохранения порядка
            'existing_images' => ['nullable', 'array'],
            'existing_images.*' => ['string'],
            // Платежные настройки
            'payment_settings' => ['nullable'],
            // Администратор организации (для новой логики с organization_users)
            'admin_user_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }

    /**
     * Подготовить данные для валидации
     */
    protected function prepareForValidation(): void
    {
        // Преобразуем is_public в boolean
        if ($this->has('is_public')) {
            $this->merge([
                'is_public' => $this->boolean('is_public'),
            ]);
        }

        // Преобразуем latitude и longitude в числа или null
        if ($this->has('latitude')) {
            $latitude = $this->input('latitude');
            $this->merge([
                'latitude' => ($latitude !== null && $latitude !== '') ? (float) $latitude : null,
            ]);
        }

        if ($this->has('longitude')) {
            $longitude = $this->input('longitude');
            $this->merge([
                'longitude' => ($longitude !== null && $longitude !== '') ? (float) $longitude : null,
            ]);
        }

        // Удаляем пустой city_name
        if ($this->has('city_name') && $this->input('city_name') === '') {
            $this->merge(['city_name' => null]);
        }
    }

    /**
     * Получить валидированные данные для обновления
     */
    public function getUpdateData(): array
    {
        return $this->only([
            'name',
            'slug',
            'description',
            'type',
            'status',
            'address',
            'phone',
            'email',
            'website',
            'region_id',
            'city_id',
            'settlement_id',
            'founded_at',
            'is_public',
            'latitude',
            'longitude',
            'city_name',
        ]);
    }
}
