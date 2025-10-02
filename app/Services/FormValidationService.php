<?php

namespace App\Services;

use App\Models\FormField;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class FormValidationService
{
    /**
     * Создает правила валидации для полей формы
     */
    public function createValidationRules(array $fields): array
    {
        $rules = [];
        $messages = [];

        foreach ($fields as $field) {
            $fieldRules = $this->getFieldValidationRules($field);
            $fieldMessages = $this->getFieldValidationMessages($field);

            $rules = array_merge($rules, $fieldRules);
            $messages = array_merge($messages, $fieldMessages);
        }

        return [
            'rules' => $rules,
            'messages' => $messages
        ];
    }

    /**
     * Получает правила валидации для конкретного поля
     */
    protected function getFieldValidationRules(FormField $field): array
    {
        $rules = [];
        $fieldName = $field->name;

        // Базовые правила в зависимости от типа поля
        switch ($field->type) {
            case 'email':
                $rules[$fieldName] = ['email'];
                break;
            case 'phone':
                $rules[$fieldName] = ['regex:/^[\+]?[0-9\s\-\(\)]{10,}$/'];
                break;
            case 'url':
                $rules[$fieldName] = ['url'];
                break;
            case 'number':
                $rules[$fieldName] = ['numeric'];
                break;
            case 'date':
                $rules[$fieldName] = ['date'];
                break;
            case 'file':
            case 'image':
                $rules[$fieldName] = ['file'];
                if ($field->type === 'image') {
                    $rules[$fieldName][] = 'image';
                }
                break;
        }

        // Обязательность поля
        if ($field->is_required) {
            $rules[$fieldName][] = 'required';
        } else {
            $rules[$fieldName][] = 'nullable';
        }

        // Дополнительные правила валидации из настроек поля
        if (!empty($field->validation)) {
            foreach ($field->validation as $rule) {
                $rules[$fieldName][] = $this->parseValidationRule($rule, $field);
            }
        }

        // Специальные правила для полей с опциями
        if (in_array($field->type, ['select', 'radio', 'checkbox'])) {
            $options = $field->options ?? [];
            $validValues = array_column($options, 'value');

            if ($field->type === 'checkbox') {
                $rules[$fieldName] = ['array'];
                $rules[$fieldName . '.*'] = [Rule::in($validValues)];
            } else {
                $rules[$fieldName][] = Rule::in($validValues);
            }
        }

        return $rules;
    }

    /**
     * Получает сообщения валидации для поля
     */
    protected function getFieldValidationMessages(FormField $field): array
    {
        $messages = [];
        $fieldName = $field->name;
        $fieldLabel = $field->label ?: $fieldName;

        // Базовые сообщения
        $messages["{$fieldName}.required"] = "Поле '{$fieldLabel}' обязательно для заполнения";
        $messages["{$fieldName}.email"] = "Поле '{$fieldLabel}' должно содержать корректный email адрес";
        $messages["{$fieldName}.url"] = "Поле '{$fieldLabel}' должно содержать корректный URL";
        $messages["{$fieldName}.numeric"] = "Поле '{$fieldLabel}' должно содержать число";
        $messages["{$fieldName}.date"] = "Поле '{$fieldLabel}' должно содержать корректную дату";
        $messages["{$fieldName}.file"] = "Поле '{$fieldLabel}' должно содержать файл";
        $messages["{$fieldName}.image"] = "Поле '{$fieldLabel}' должно содержать изображение";
        $messages["{$fieldName}.regex"] = "Поле '{$fieldLabel}' имеет неверный формат";
        $messages["{$fieldName}.array"] = "Поле '{$fieldName}' должно быть массивом";
        $messages["{$fieldName}.*.in"] = "Выбранное значение для поля '{$fieldLabel}' недопустимо";
        $messages["{$fieldName}.in"] = "Выбранное значение для поля '{$fieldLabel}' недопустимо";

        return $messages;
    }

    /**
     * Парсит правило валидации из строки
     */
    protected function parseValidationRule(string $rule, FormField $field): string
    {
        $rule = trim($rule);

        // Минимальная длина
        if (str_starts_with($rule, 'min:')) {
            $value = substr($rule, 4);
            return "min:{$value}";
        }

        // Максимальная длина
        if (str_starts_with($rule, 'max:')) {
            $value = substr($rule, 4);
            return "max:{$value}";
        }

        // Точная длина
        if (str_starts_with($rule, 'size:')) {
            $value = substr($rule, 5);
            return "size:{$value}";
        }

        // Регулярное выражение
        if (str_starts_with($rule, 'regex:')) {
            $value = substr($rule, 6);
            return "regex:{$value}";
        }

        // Минимальное значение (для чисел)
        if (str_starts_with($rule, 'min_value:')) {
            $value = substr($rule, 10);
            return "min:{$value}";
        }

        // Максимальное значение (для чисел)
        if (str_starts_with($rule, 'max_value:')) {
            $value = substr($rule, 9);
            return "max:{$value}";
        }

        // Размер файла (в килобайтах)
        if (str_starts_with($rule, 'file_size:')) {
            $value = substr($rule, 10);
            return "max:{$value}";
        }

        // Размеры изображения
        if (str_starts_with($rule, 'image_dimensions:')) {
            $value = substr($rule, 17);
            return "dimensions:{$value}";
        }

        return $rule;
    }

    /**
     * Валидирует данные формы
     */
    public function validateFormData(array $data, array $fields): array
    {
        $validationConfig = $this->createValidationRules($fields);

        $validator = Validator::make($data, $validationConfig['rules'], $validationConfig['messages']);

        if ($validator->fails()) {
            return [
                'success' => false,
                'errors' => $validator->errors(),
                'message' => 'Ошибки валидации формы'
            ];
        }

        return [
            'success' => true,
            'data' => $this->sanitizeFormData($data, $fields)
        ];
    }

    /**
     * Очищает и нормализует данные формы
     */
    protected function sanitizeFormData(array $data, array $fields): array
    {
        $sanitized = [];

        foreach ($fields as $field) {
            $fieldName = $field->name;
            $value = $data[$fieldName] ?? null;

            if ($value === null) {
                continue;
            }

            // Очистка в зависимости от типа поля
            switch ($field->type) {
                case 'email':
                    $sanitized[$fieldName] = strtolower(trim($value));
                    break;

                case 'text':
                case 'textarea':
                    $sanitized[$fieldName] = trim($value);
                    break;

                case 'phone':
                    $sanitized[$fieldName] = preg_replace('/[^\d\+\-\(\)\s]/', '', $value);
                    break;

                case 'number':
                    $sanitized[$fieldName] = is_numeric($value) ? (float) $value : $value;
                    break;

                case 'url':
                    $sanitized[$fieldName] = filter_var($value, FILTER_SANITIZE_URL);
                    break;

                case 'date':
                    $sanitized[$fieldName] = $value; // Дата уже валидирована
                    break;

                case 'checkbox':
                    $sanitized[$fieldName] = is_array($value) ? $value : [$value];
                    break;

                default:
                    $sanitized[$fieldName] = $value;
            }
        }

        return $sanitized;
    }

    /**
     * Проверяет безопасность файлов
     */
    public function validateFileSecurity($file): bool
    {
        if (!$file) {
            return true;
        }

        // Проверяем MIME тип
        $allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            return false;
        }

        // Проверяем расширение
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'doc', 'docx'];
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, $allowedExtensions)) {
            return false;
        }

        // Проверяем размер файла (максимум 10MB)
        if ($file->getSize() > 10 * 1024 * 1024) {
            return false;
        }

        return true;
    }
}
