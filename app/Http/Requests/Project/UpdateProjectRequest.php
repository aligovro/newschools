<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
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
    $project = $this->route('project');
    $categories = array_keys($organization->type_config['categories'] ?? []);

    return [
      'title' => 'required|string|max:255',
      'slug' => 'nullable|string|max:255|unique:projects,slug,' . $project->id . ',id,organization_id,' . $organization->id,
      'short_description' => 'nullable|string|max:500',
      'description' => 'nullable|string',
      'category' => 'required|string|in:' . implode(',', $categories),
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
      'existing_gallery' => 'nullable|array',
      'existing_gallery.*' => 'string',
    ];
  }

  /**
   * Кастомные сообщения об ошибках
   */
  public function messages(): array
  {
    return [
      'title.required' => 'Название проекта обязательно для заполнения',
      'slug.unique' => 'Этот slug уже используется',
      'category.required' => 'Выберите категорию проекта',
      'category.in' => 'Выбранная категория недоступна',
      'end_date.after' => 'Дата окончания должна быть позже даты начала',
      'image.mimes' => 'Изображение должно быть в формате: jpeg, png, jpg, webp',
      'image.max' => 'Размер изображения не должен превышать 2MB',
      'gallery.max' => 'Можно загрузить максимум 10 изображений',
    ];
  }
}
