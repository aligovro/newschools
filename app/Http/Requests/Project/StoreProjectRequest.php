<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
  /**
   * Определить, может ли пользователь выполнить этот запрос
   */
  public function authorize(): bool
  {
    return true; // Права доступа проверяются через middleware
  }

  /**
   * Правила валидации
   */
  public function rules(): array
  {
    $organization = $this->route('organization');
    $categories = array_keys($organization->type_config['categories'] ?? []);

    return [
      'title' => 'required|string|max:255',
      'slug' => 'nullable|string|max:255',
      'short_description' => 'nullable|string|max:500',
      'description' => 'nullable|string',
      'category' => 'required|string|in:' . implode(',', $categories),
      'category_ids' => 'nullable|array',
      'category_ids.*' => 'exists:project_categories,id',
      'target_amount' => 'nullable|numeric|min:0',
      'start_date' => 'nullable|date',
      'end_date' => 'nullable|date|after:start_date',
      'featured' => 'nullable|boolean',
      'status' => 'nullable|in:draft,active,completed,cancelled,suspended',
      'tags' => 'nullable|array',
      'tags.*' => 'string|max:50',
      'beneficiaries' => 'nullable|array',
      'progress_updates' => 'nullable|array',
      'seo_settings' => 'nullable|array',
      'payment_settings' => 'nullable|array',
      'image' => 'nullable|file|mimes:jpeg,png,jpg,webp|max:2048',
      'gallery' => 'nullable|array|max:10',
      'gallery.*' => 'file|image|mimes:jpeg,png,jpg,webp|max:2048',
    ];
  }

  /**
   * Кастомные сообщения об ошибках
   */
  public function messages(): array
  {
    return [
      'title.required' => 'Название проекта обязательно для заполнения',
      'category.required' => 'Выберите категорию проекта',
      'category.in' => 'Выбранная категория недоступна',
      'end_date.after' => 'Дата окончания должна быть позже даты начала',
      'image.mimes' => 'Изображение должно быть в формате: jpeg, png, jpg, webp',
      'image.max' => 'Размер изображения не должен превышать 2MB',
      'gallery.max' => 'Можно загрузить максимум 10 изображений',
    ];
  }
}
