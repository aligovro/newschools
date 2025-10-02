<?php

namespace App\Services\FormActions;

use App\Models\FormSubmission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DatabaseActionService
{
  public function execute(FormSubmission $submission, array $config): bool
  {
    try {
      $table = $config['table'] ?? 'form_submissions_data';
      $mapping = $config['mapping'] ?? [];
      $additionalFields = $config['additional_fields'] ?? [];

      if (empty($table)) {
        Log::error('Database action: No table specified', [
          'submission_id' => $submission->id,
          'config' => $config
        ]);
        return false;
      }

      // Подготавливаем данные для вставки
      $insertData = [
        'form_submission_id' => $submission->id,
        'form_widget_id' => $submission->form_widget_id,
        'created_at' => now(),
        'updated_at' => now(),
      ];

      // Применяем маппинг полей
      foreach ($submission->data as $fieldName => $value) {
        $mappedField = $mapping[$fieldName] ?? $fieldName;

        // Обрабатываем массивы (для чекбоксов)
        if (is_array($value)) {
          $insertData[$mappedField] = json_encode($value);
        } else {
          $insertData[$mappedField] = $value;
        }
      }

      // Добавляем дополнительные поля
      foreach ($additionalFields as $field => $value) {
        $insertData[$field] = $value;
      }

      // Вставляем данные в таблицу
      DB::table($table)->insert($insertData);

      Log::info('Database action executed successfully', [
        'submission_id' => $submission->id,
        'table' => $table,
        'mapping' => $mapping
      ]);

      return true;
    } catch (\Exception $e) {
      Log::error('Database action failed', [
        'submission_id' => $submission->id,
        'error' => $e->getMessage(),
        'config' => $config
      ]);
      return false;
    }
  }
}
