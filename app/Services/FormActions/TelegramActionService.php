<?php

namespace App\Services\FormActions;

use App\Models\FormSubmission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramActionService
{
    public function execute(FormSubmission $submission, array $config): bool
    {
        try {
            $botToken = $config['bot_token'] ?? null;
            $chatId = $config['chat_id'] ?? null;
            $message = $config['message'] ?? 'Новая отправка формы';
            $parseMode = $config['parse_mode'] ?? 'HTML';

            if (!$botToken || !$chatId) {
                Log::error('Telegram action: Missing bot token or chat ID', [
                    'submission_id' => $submission->id,
                    'config' => $config
                ]);
                return false;
            }

            // Формируем сообщение
            $formattedMessage = $this->formatMessage($submission, $message, $parseMode);

            // Отправляем сообщение в Telegram
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $formattedMessage,
                'parse_mode' => $parseMode,
                'disable_web_page_preview' => true,
            ]);

            if ($response->successful()) {
                Log::info('Telegram action executed successfully', [
                    'submission_id' => $submission->id,
                    'chat_id' => $chatId
                ]);
                return true;
            } else {
                Log::error('Telegram action failed', [
                    'submission_id' => $submission->id,
                    'chat_id' => $chatId,
                    'response' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Telegram action failed with exception', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
                'config' => $config
            ]);
            return false;
        }
    }

    private function formatMessage(FormSubmission $submission, string $template, string $parseMode): string
    {
        $data = $submission->data;
        $formWidget = $submission->formWidget;

        // Заменяем плейсхолдеры в шаблоне
        $message = str_replace([
            '{form_name}',
            '{submission_id}',
            '{timestamp}',
            '{ip_address}',
        ], [
            $formWidget->name,
            $submission->id,
            $submission->created_at->format('d.m.Y H:i:s'),
            $submission->ip_address,
        ], $template);

        // Добавляем данные формы
        $formDataText = "\n\n📋 <b>Данные формы:</b>\n";
        foreach ($data as $field => $value) {
            $fieldLabel = $this->getFieldLabel($formWidget, $field);
            $formattedValue = is_array($value) ? implode(', ', $value) : $value;

            if ($parseMode === 'HTML') {
                $formDataText .= "• <b>{$fieldLabel}:</b> " . htmlspecialchars($formattedValue) . "\n";
            } else {
                $formDataText .= "• {$fieldLabel}: {$formattedValue}\n";
            }
        }

        return $message . $formDataText;
    }

    private function getFieldLabel($formWidget, string $fieldName): string
    {
        if (!$formWidget->fields) {
            return $fieldName;
        }

        foreach ($formWidget->fields as $field) {
            if ($field->name === $fieldName) {
                return $field->label ?: $fieldName;
            }
        }

        return $fieldName;
    }
}
