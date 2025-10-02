<?php

namespace App\Services\FormActions;

use App\Models\FormSubmission;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookActionService
{
    public function execute(FormSubmission $submission, array $config): bool
    {
        try {
            $url = $config['url'] ?? null;
            $method = strtoupper($config['method'] ?? 'POST');
            $headers = $config['headers'] ?? [];
            $timeout = $config['timeout'] ?? 30;

            if (!$url) {
                Log::error('Webhook action: No URL specified', [
                    'submission_id' => $submission->id,
                    'config' => $config
                ]);
                return false;
            }

            // Подготавливаем данные для отправки
            $payload = [
                'form_id' => $submission->form_widget_id,
                'submission_id' => $submission->id,
                'data' => $submission->data,
                'timestamp' => $submission->created_at->toISOString(),
                'ip_address' => $submission->ip_address,
                'user_agent' => $submission->user_agent,
            ];

            // Добавляем дополнительные поля из конфигурации
            if (isset($config['additional_fields'])) {
                $payload = array_merge($payload, $config['additional_fields']);
            }

            // Выполняем HTTP запрос
            $response = Http::timeout($timeout)
                ->withHeaders($headers)
                ->$method($url, $payload);

            if ($response->successful()) {
                Log::info('Webhook action executed successfully', [
                    'submission_id' => $submission->id,
                    'url' => $url,
                    'method' => $method,
                    'status_code' => $response->status()
                ]);
                return true;
            } else {
                Log::error('Webhook action failed', [
                    'submission_id' => $submission->id,
                    'url' => $url,
                    'method' => $method,
                    'status_code' => $response->status(),
                    'response' => $response->body()
                ]);
                return false;
            }
        } catch (\Exception $e) {
            Log::error('Webhook action failed with exception', [
                'submission_id' => $submission->id,
                'error' => $e->getMessage(),
                'config' => $config
            ]);
            return false;
        }
    }
}
