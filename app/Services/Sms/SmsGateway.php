<?php

namespace App\Services\Sms;

use App\Exceptions\SmsGatewayException;
use App\Services\GlobalSettingsService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsGateway
{
    public function __construct(private GlobalSettingsService $settingsService) {}

    /**
     * Send verification code via smsc.ru.
     *
     * @throws SmsGatewayException
     */
    public function sendVerificationCode(string $phone, string $code, ?string $messageTemplate = null): array
    {
        $config = $this->resolveConfig();

        if (! $config['login'] || ! $config['password']) {
            throw new SmsGatewayException('SMS gateway is not configured.');
        }

        $message = $messageTemplate
            ? str_replace('{code}', $code, $messageTemplate)
            : "Ваш код подтверждения: {$code}";

        $payload = array_filter([
            'login' => $config['login'],
            'psw' => $config['password'],
            'phones' => $phone,
            'mes' => $message,
            'sender' => $config['sender'] ?? null,
            'fmt' => 3, // JSON response
            'charset' => 'utf-8',
        ], fn($value) => $value !== null && $value !== '');

        $response = Http::asForm()
            ->timeout($config['timeout'] ?? 10)
            ->post($config['endpoint'] ?? 'https://smsc.ru/sys/send.php', $payload);

        if (! $response->ok()) {
            Log::error('smsc.ru response error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            throw new SmsGatewayException('Не удалось отправить SMS. Повторите попытку позже.');
        }

        $data = $response->json();

        if (isset($data['error'])) {
            Log::warning('smsc.ru returned error', [
                'error' => $data['error'],
                'code' => $data['error_code'] ?? null,
            ]);

            throw new SmsGatewayException($data['error']);
        }

        return $data;
    }

    /**
     * Resolve gateway credentials from settings or config.
     */
    private function resolveConfig(): array
    {
        $settings = $this->settingsService->getSettings();
        $integrationSettings = $settings->integration_settings ?? [];
        $smscSettings = Arr::get($integrationSettings, 'smsc', []);

        return array_merge([
            'endpoint' => config('services.smsc.endpoint'),
            'timeout' => config('services.smsc.timeout'),
            'login' => config('services.smsc.login'),
            'password' => config('services.smsc.password'),
            'sender' => config('services.smsc.sender'),
        ], array_filter($smscSettings ?? []));
    }
}
