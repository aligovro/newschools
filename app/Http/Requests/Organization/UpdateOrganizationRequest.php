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
      'admin_user_id' => ['nullable', 'exists:users,id'],
      'founded_at' => ['nullable', 'date'],
      'is_public' => ['boolean'],
      'logo' => ['sometimes'],
      // Галерея изображений (новые файлы)
      'images' => ['nullable', 'array', 'max:20'],
      'images.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'],
      // Существующие изображения (строки путей) для сохранения порядка
      'existing_images' => ['nullable', 'array'],
      'existing_images.*' => ['string'],
    ];
  }
}
