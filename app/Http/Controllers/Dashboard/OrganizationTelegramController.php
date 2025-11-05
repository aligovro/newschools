<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrganizationTelegramController extends Controller
{
    public function __construct()
    {
        // Middleware применяется в маршрутах
    }

    /**
     * Страница настроек Telegram
     */
    public function index(Organization $organization)
    {
        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];
        $notificationSettings = $settings?->notification_settings ?? [];

        return Inertia::render('organization/admin/TelegramSettings', [
            'organization' => $organization,
            'integrationSettings' => $integrationSettings,
            'notificationSettings' => $notificationSettings,
            'botInfo' => $this->getBotInfo($integrationSettings['telegram_bot_token'] ?? null),
        ]);
    }

    /**
     * Настроить Telegram бота
     */
    public function setupBot(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bot_token' => 'required|string|max:255',
            'chat_id' => 'required|string|max:255',
            'webhook_url' => 'nullable|url|max:500',
            'auto_notifications' => 'boolean',
            'donation_notifications' => 'boolean',
            'member_notifications' => 'boolean',
            'project_notifications' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Проверяем валидность токена бота
            $botInfo = $this->validateBotToken($request->bot_token);

            if (!$botInfo) {
                return response()->json([
                    'message' => 'Неверный токен бота'
                ], 400);
            }

            // Проверяем доступность чата
            $chatInfo = $this->validateChatId($request->bot_token, $request->chat_id);

            if (!$chatInfo) {
                return response()->json([
                    'message' => 'Неверный ID чата или бот не добавлен в чат'
                ], 400);
            }

            $settings = $organization->settings ?? $organization->settings()->create([]);

            // Обновляем интеграционные настройки
            $integrationSettings = $settings->integration_settings ?? [];
            $integrationSettings['telegram_bot_token'] = $request->bot_token;
            $integrationSettings['telegram_chat_id'] = $request->chat_id;
            $integrationSettings['telegram_webhook_url'] = $request->webhook_url;
            $integrationSettings['telegram_bot_info'] = $botInfo;
            $integrationSettings['telegram_chat_info'] = $chatInfo;

            // Обновляем настройки уведомлений
            $notificationSettings = $settings->notification_settings ?? [];
            $notificationSettings['telegram_notifications'] = $request->auto_notifications ?? false;
            $notificationSettings['telegram_donation_notifications'] = $request->donation_notifications ?? false;
            $notificationSettings['telegram_member_notifications'] = $request->member_notifications ?? false;
            $notificationSettings['telegram_project_notifications'] = $request->project_notifications ?? false;

            $settings->update([
                'integration_settings' => $integrationSettings,
                'notification_settings' => $notificationSettings,
            ]);

            // Настраиваем webhook если указан URL
            if ($request->webhook_url) {
                $this->setupWebhook($request->bot_token, $request->webhook_url);
            }

            return response()->json([
                'message' => 'Telegram бот успешно настроен',
                'botInfo' => $botInfo,
                'chatInfo' => $chatInfo,
                'settings' => $settings->fresh(),
            ]);
        } catch (\Exception $e) {
            Log::error('Telegram bot setup failed', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Ошибка настройки бота: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Отправить тестовое сообщение
     */
    public function sendTestMessage(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];

        if (empty($integrationSettings['telegram_bot_token']) || empty($integrationSettings['telegram_chat_id'])) {
            return response()->json([
                'message' => 'Telegram бот не настроен'
            ], 400);
        }

        try {
            $message = $request->message ?? "🧪 Тестовое сообщение от организации: {$organization->name}\n\n✅ Telegram бот успешно настроен и работает!";

            $response = $this->sendMessage(
                $integrationSettings['telegram_bot_token'],
                $integrationSettings['telegram_chat_id'],
                $message
            );

            if ($response['success']) {
                return response()->json([
                    'message' => 'Тестовое сообщение отправлено',
                    'response' => $response,
                ]);
            } else {
                return response()->json([
                    'message' => 'Ошибка отправки сообщения: ' . $response['error']
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('Test message sending failed', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Ошибка отправки сообщения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Отправить уведомление о пожертвовании
     */
    public function sendDonationNotification(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'donation_id' => 'required|exists:donations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $donation = $organization->donations()->findOrFail($request->donation_id);

        try {
            $result = $this->sendDonationNotificationToTelegram($organization, $donation);

            return response()->json([
                'message' => 'Уведомление отправлено',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            Log::error('Donation notification failed', [
                'organization_id' => $organization->id,
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Ошибка отправки уведомления: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить статистику бота
     */
    public function getBotStats(Request $request, Organization $organization): JsonResponse
    {
        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];

        if (empty($integrationSettings['telegram_bot_token'])) {
            return response()->json([
                'message' => 'Telegram бот не настроен'
            ], 400);
        }

        try {
            $botStats = $this->getBotStatistics($integrationSettings['telegram_bot_token']);

            return response()->json([
                'stats' => $botStats,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка получения статистики: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Настроить webhook
     */
    public function setupWebhook(Request $request, Organization $organization): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'webhook_url' => 'required|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];

        if (empty($integrationSettings['telegram_bot_token'])) {
            return response()->json([
                'message' => 'Telegram бот не настроен'
            ], 400);
        }

        try {
            $result = $this->setupWebhook($integrationSettings['telegram_bot_token'], $request->webhook_url);

            if ($result['success']) {
                $integrationSettings['telegram_webhook_url'] = $request->webhook_url;
                $settings->update(['integration_settings' => $integrationSettings]);
            }

            return response()->json([
                'message' => $result['success'] ? 'Webhook настроен' : 'Ошибка настройки webhook',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка настройки webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить webhook
     */
    public function removeWebhook(Organization $organization): JsonResponse
    {
        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];

        if (empty($integrationSettings['telegram_bot_token'])) {
            return response()->json([
                'message' => 'Telegram бот не настроен'
            ], 400);
        }

        try {
            $result = $this->removeWebhook($integrationSettings['telegram_bot_token']);

            if ($result['success']) {
                unset($integrationSettings['telegram_webhook_url']);
                $settings->update(['integration_settings' => $integrationSettings]);
            }

            return response()->json([
                'message' => $result['success'] ? 'Webhook удален' : 'Ошибка удаления webhook',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Ошибка удаления webhook: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Обработка webhook от Telegram
     */
    public function handleWebhook(Request $request, Organization $organization): JsonResponse
    {
        try {
            $update = $request->all();
            Log::info('Telegram webhook received', $update);

            // Обрабатываем различные типы обновлений
            if (isset($update['message'])) {
                $this->handleMessage($organization, $update['message']);
            } elseif (isset($update['callback_query'])) {
                $this->handleCallbackQuery($organization, $update['callback_query']);
            }

            return response()->json(['ok' => true]);
        } catch (\Exception $e) {
            Log::error('Telegram webhook error', [
                'organization_id' => $organization->id,
                'error' => $e->getMessage(),
                'update' => $request->all(),
            ]);

            return response()->json(['ok' => false], 500);
        }
    }

    /**
     * Валидация токена бота
     */
    private function validateBotToken(string $botToken): ?array
    {
        try {
            $response = Http::get("https://api.telegram.org/bot{$botToken}/getMe");

            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok']) {
                    return $data['result'];
                }
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Валидация ID чата
     */
    private function validateChatId(string $botToken, string $chatId): ?array
    {
        try {
            $response = Http::get("https://api.telegram.org/bot{$botToken}/getChat", [
                'chat_id' => $chatId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                if ($data['ok']) {
                    return $data['result'];
                }
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Отправить сообщение
     */
    private function sendMessage(string $botToken, string $chatId, string $text): array
    {
        try {
            $response = Http::post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
                'parse_mode' => 'HTML',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => $data['ok'] ?? false,
                    'message_id' => $data['result']['message_id'] ?? null,
                ];
            }

            return [
                'success' => false,
                'error' => $response->body(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Отправить уведомление о пожертвовании в Telegram
     */
    private function sendDonationNotificationToTelegram(Organization $organization, $donation): array
    {
        $settings = $organization->settings;
        $integrationSettings = $settings?->integration_settings ?? [];
        $notificationSettings = $settings?->notification_settings ?? [];

        if (
            empty($integrationSettings['telegram_bot_token']) ||
            empty($integrationSettings['telegram_chat_id']) ||
            !($notificationSettings['telegram_donation_notifications'] ?? false)
        ) {
            return ['success' => false, 'error' => 'Уведомления отключены'];
        }

        $message = "💰 <b>Новое пожертвование!</b>\n\n" .
            "Организация: <b>{$organization->name}</b>\n" .
            "Сумма: <b>" . number_format($donation->amount / 100, 0, ',', ' ') . " ₽</b>\n" .
            "От: " . ($donation->member?->name ?? 'Аноним') . "\n" .
            "Дата: " . $donation->created_at->format('d.m.Y H:i');

        if ($donation->project) {
            $message .= "\nПроект: <b>{$donation->project->title}</b>";
        }

        return $this->sendMessage(
            $integrationSettings['telegram_bot_token'],
            $integrationSettings['telegram_chat_id'],
            $message
        );
    }

    /**
     * Получить информацию о боте
     */
    private function getBotInfo(?string $botToken): ?array
    {
        if (!$botToken) {
            return null;
        }

        return $this->validateBotToken($botToken);
    }


    /**
     * Получить статистику бота
     */
    private function getBotStatistics(string $botToken): array
    {
        try {
            $response = Http::get("https://api.telegram.org/bot{$botToken}/getWebhookInfo");

            if ($response->successful()) {
                $data = $response->json();
                return $data['result'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Обработать сообщение
     */
    private function handleMessage(Organization $organization, array $message): void
    {
        // Здесь можно добавить логику обработки входящих сообщений
        Log::info('Telegram message received', [
            'organization_id' => $organization->id,
            'message' => $message,
        ]);
    }

    /**
     * Обработать callback query
     */
    private function handleCallbackQuery(Organization $organization, array $callbackQuery): void
    {
        // Здесь можно добавить логику обработки callback запросов
        Log::info('Telegram callback query received', [
            'organization_id' => $organization->id,
            'callback_query' => $callbackQuery,
        ]);
    }
}
