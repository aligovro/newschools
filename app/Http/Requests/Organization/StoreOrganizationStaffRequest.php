<?php

namespace App\Http\Requests\Organization;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\OrganizationStaff;

class StoreOrganizationStaffRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array
  {
    $organization = $this->route('organization');

    return [
      'last_name' => ['required', 'string', 'max:255'],
      'first_name' => ['required', 'string', 'max:255'],
      'middle_name' => ['nullable', 'string', 'max:255'],
      'is_director' => ['nullable', 'boolean'],
      'position' => [
        'required_if:is_director,false',
        'nullable',
        'string',
        'max:255',
        function ($attribute, $value, $fail) use ($organization) {
          // Проверяем актуальное значение is_director из запроса (может быть boolean или строка '1'/'0')
          $isDirector = filter_var($this->input('is_director', false), FILTER_VALIDATE_BOOLEAN);
          // Используем значение position из запроса (после prepareForValidation)
          $position = $this->input('position');
          
          // Если создается директор, проверяем что у организации еще нет директора
          if ($isDirector && $position === OrganizationStaff::POSITION_DIRECTOR) {
            $existingDirector = OrganizationStaff::where('organization_id', $organization->id)
              ->where('position', OrganizationStaff::POSITION_DIRECTOR)
              ->exists();
            if ($existingDirector) {
              $fail('У данной организации уже есть директор.');
            }
          }
        },
      ],
      'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:10240'],
      'address' => ['nullable', 'string', 'max:1000'],
      'email' => ['nullable', 'email', 'max:255'],
    ];
  }

  /**
   * Prepare the data for validation.
   */
  protected function prepareForValidation(): void
  {
    // Если is_director = true, устанавливаем position = 'Директор'
    // Обрабатываем как boolean, так и строковые значения '1'/'0'
    $isDirector = filter_var($this->input('is_director', false), FILTER_VALIDATE_BOOLEAN);
    if ($isDirector) {
      $this->merge([
        'position' => OrganizationStaff::POSITION_DIRECTOR,
      ]);
    }
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      'last_name.required' => 'Фамилия обязательна для заполнения.',
      'first_name.required' => 'Имя обязательно для заполнения.',
      'position.required_if' => 'Должность обязательна для заполнения, если не выбран директор.',
      'email.email' => 'Email должен быть корректным email адресом.',
      'photo.image' => 'Фотография должна быть изображением.',
      'photo.max' => 'Размер фотографии не должен превышать 10 МБ.',
    ];
  }
}
