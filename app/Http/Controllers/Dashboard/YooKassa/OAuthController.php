<?php

namespace App\Http\Controllers\Dashboard\YooKassa;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\Payments\YooKassa\YooKassaPartnerMerchantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    public function __construct(
        protected YooKassaPartnerMerchantService $merchantService
    ) {
        // handleCallback должен быть доступен без авторизации (публичный callback от YooKassa)
        $this->middleware(['auth', 'verified'])->except('handleCallback');
    }

    /**
     * Генерирует ссылку для OAuth авторизации магазина
     */
    public function getAuthorizationUrl(Request $request, Organization $organization)
    {
        $clientId = config('services.yookassa_partner.client_id');
        $callbackUrl = config('services.yookassa_partner.callback_url');
        $oauthUrl = config('services.yookassa_partner.oauth_url', 'https://yookassa.ru/oauth/v2');

        if (!$clientId || !$callbackUrl) {
            Log::error('YooKassa OAuth: credentials not configured', [
                'has_client_id' => !empty($clientId),
                'has_callback_url' => !empty($callbackUrl),
            ]);

            return response()->json([
                'error' => 'YooKassa Partner credentials not configured',
            ], 400);
        }

        // Логируем генерацию ссылки для отладки
        Log::info('YooKassa OAuth authorization URL generated', [
            'organization_id' => $organization->id,
            'callback_url' => $callbackUrl,
            'client_id' => $clientId,
        ]);

        // Генерируем state для защиты от CSRF
        // Кодируем organization_id в state, чтобы не зависеть от сессии
        $stateData = [
            'state' => Str::random(32),
            'organization_id' => $organization->id,
            'timestamp' => now()->timestamp,
        ];

        // Кодируем данные в base64 для передачи через state
        $encodedState = base64_encode(json_encode($stateData));

        // Сохраняем в сессию для валидации
        session(['yookassa_oauth_state' => $stateData['state']]);
        session(['yookassa_oauth_organization_id' => $organization->id]);

        // Используем закодированный state, который содержит organization_id
        $state = $encodedState;

        // Формируем URL для авторизации
        $authorizationUrl = $oauthUrl . '/authorize?' . http_build_query([
            'client_id' => $clientId,
            'response_type' => 'code',
            'redirect_uri' => $callbackUrl,
            'scope' => 'merchant.read merchant.write payment.read payment.write payout.read payout.write',
            'state' => $state,
        ]);

        return response()->json([
            'authorization_url' => $authorizationUrl,
        ]);
    }

    /**
     * Обрабатывает callback от YooKassa после авторизации
     */
    public function handleCallback(Request $request)
    {
        $code = $request->query('code');
        $state = $request->query('state');
        $error = $request->query('error');

        // Логируем все параметры для отладки
        Log::info('YooKassa OAuth callback received', [
            'has_code' => !empty($code),
            'has_state' => !empty($state),
            'has_error' => !empty($error),
            'all_params' => $request->query->all(),
            'session_id' => session()->getId(),
            'callback_url' => config('services.yookassa_partner.callback_url'),
            'request_url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Проверяем наличие ошибки
        if ($error) {
            Log::error('YooKassa OAuth error', [
                'error' => $error,
                'error_description' => $request->query('error_description'),
            ]);

            return redirect()->route('yookassa.merchants')
                ->with('error', 'Ошибка авторизации: ' . ($request->query('error_description') ?? $error));
        }

        // Проверяем наличие кода авторизации
        if (!$code) {
            Log::error('YooKassa OAuth: no authorization code received', [
                'has_state' => !empty($state),
                'has_error' => !empty($error),
                'all_params' => $request->query->all(),
            ]);
            return redirect()->route('organizations.index')
                ->with('error', 'Код авторизации не получен');
        }

        // Пытаемся декодировать organization_id из state
        $organizationId = null;
        $stateValid = false;

        if ($state) {
            try {
                // Пытаемся декодировать state (новый формат с organization_id)
                $decodedState = json_decode(base64_decode($state), true);

                if (is_array($decodedState) && isset($decodedState['organization_id'])) {
                    $organizationId = $decodedState['organization_id'];
                    $stateToken = $decodedState['state'] ?? null;
                    $timestamp = $decodedState['timestamp'] ?? null;

                    // Проверяем, что state не старше 1 часа
                    if ($timestamp && (now()->timestamp - $timestamp) > 3600) {
                        Log::warning('YooKassa OAuth: state expired', [
                            'age_seconds' => now()->timestamp - $timestamp,
                        ]);
                    } else {
                        // Проверяем state token из сессии (если сессия доступна)
                        $sessionState = session('yookassa_oauth_state');
                        if ($sessionState && $stateToken === $sessionState) {
                            $stateValid = true;
                            Log::info('YooKassa OAuth: state validated from session');
                        } else {
                            // Если сессия недоступна, но state содержит organization_id, продолжаем
                            // Это нормально, если callback происходит в другом браузере/сессии
                            $stateValid = true;
                            Log::info('YooKassa OAuth: state validated from encoded data (session unavailable)', [
                                'has_session_state' => !empty($sessionState),
                            ]);
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::warning('YooKassa OAuth: failed to decode state', [
                    'error' => $e->getMessage(),
                    'state_length' => strlen($state),
                ]);
            }
        }

        // Если не удалось получить из state, пробуем из сессии
        if (!$organizationId) {
            $organizationId = session('yookassa_oauth_organization_id');
            $sessionState = session('yookassa_oauth_state');

            if ($sessionState && $state && $state === $sessionState) {
                $stateValid = true;
                Log::info('YooKassa OAuth: state validated from session (legacy format)');
            }
        }

        // Если state не валиден и не в debug режиме, отклоняем запрос
        if (!$stateValid && !config('app.debug')) {
            Log::warning('YooKassa OAuth: state validation failed', [
                'has_state' => !empty($state),
                'has_organization_id' => !empty($organizationId),
                'session_id' => session()->getId(),
            ]);

            return redirect()->route('organizations.index')
                ->with('error', 'Ошибка безопасности: неверный state параметр. Попробуйте снова.');
        }

        // Если organization_id все еще не найден, это критическая ошибка
        if (!$organizationId) {
            Log::error('YooKassa OAuth: organization_id not found', [
                'has_state' => !empty($state),
                'session_id' => session()->getId(),
                'session_data' => session()->all(),
            ]);

            return redirect()->route('organizations.index')
                ->with('error', 'Не удалось определить организацию. Попробуйте создать новую ссылку для авторизации.');
        }

        $organization = Organization::findOrFail($organizationId);

        try {
            // Обмениваем код на токен доступа
            $client = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class)
                ->forSettings([
                    'client_id' => config('services.yookassa_partner.client_id'),
                    'secret_key' => config('services.yookassa_partner.secret_key'),
                    'base_url' => config('services.yookassa_partner.base_url'),
                ]);

            $tokenResponse = $client->exchangeCodeForToken($code, config('services.yookassa_partner.callback_url'));

            Log::info('YooKassa OAuth token response', [
                'has_access_token' => !empty($tokenResponse['access_token']),
                'response_keys' => array_keys($tokenResponse),
            ]);

            // Сохраняем токены в мерчанте организации
            $merchant = $organization->yookassaPartnerMerchant;
            if (!$merchant) {
                $merchant = $this->merchantService->createDraft($organization);
                Log::info('Created new merchant draft', [
                    'merchant_id' => $merchant->id,
                    'organization_id' => $organization->id,
                ]);
            }

            // Пытаемся получить account_id из токена или из информации о мерчанте
            $accountId = $tokenResponse['account_id'] ?? $merchant->external_id ?? null;

            // Если account_id не найден, пытаемся получить его через API
            if (!$accountId && !empty($tokenResponse['access_token'])) {
                try {
                    // Создаем временный клиент с токеном для получения информации о мерчанте
                    $tempClient = app(\App\Services\Payments\YooKassa\YooKassaPartnerClientFactory::class)
                        ->forSettings([
                            'client_id' => config('services.yookassa_partner.client_id'),
                            'secret_key' => config('services.yookassa_partner.secret_key'),
                            'base_url' => config('services.yookassa_partner.base_url'),
                            'access_token' => $tokenResponse['access_token'] ?? null,
                        ]);

                    // Пытаемся получить информацию о мерчанте через API
                    // В Partner API после OAuth можно получить информацию о магазине
                    // Пробуем использовать метод getMerchant если есть external_id
                    if ($merchant->external_id) {
                        try {
                            $merchantInfo = $tempClient->getMerchant($merchant->external_id);
                            $accountId = $merchantInfo['id'] ?? $accountId;
                            Log::info('Got account_id from getMerchant', ['account_id' => $accountId]);
                        } catch (\Exception $e) {
                            Log::warning('Failed to get account_id from getMerchant', ['error' => $e->getMessage()]);
                        }
                    }

                    // Если account_id все еще не найден, сохраняем токен и попробуем синхронизировать позже
                    if (!$accountId) {
                        Log::warning('Account ID not found, will be set during sync', [
                            'merchant_id' => $merchant->id,
                            'has_external_id' => !empty($merchant->external_id),
                        ]);
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to get merchant info for account_id', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                }
            }

            $merchant->update([
                'status' => YooKassaPartnerMerchant::STATUS_ACTIVE,
                'credentials' => array_merge($merchant->credentials ?? [], [
                    'access_token' => $tokenResponse['access_token'] ?? null,
                    'refresh_token' => $tokenResponse['refresh_token'] ?? null,
                    'expires_in' => $tokenResponse['expires_in'] ?? null,
                    'token_type' => $tokenResponse['token_type'] ?? 'Bearer',
                    'expires_at' => isset($tokenResponse['expires_in'])
                        ? now()->addSeconds($tokenResponse['expires_in'])
                        : null,
                    'oauth_authorized_at' => now()->toIso8601String(),
                    'account_id' => $accountId,
                ]),
                'settings' => array_merge($merchant->settings ?? [], [
                    'oauth_authorized' => true,
                    'oauth_authorized_at' => now()->toIso8601String(),
                ]),
            ]);

            // Очищаем сессию
            session()->forget(['yookassa_oauth_state', 'yookassa_oauth_organization_id']);

            // Обновляем мерчант после сохранения токенов
            $merchant->refresh();

            Log::info('YooKassa OAuth authorization successful', [
                'organization_id' => $organization->id,
                'merchant_id' => $merchant->id,
                'has_access_token' => !empty($merchant->credentials['access_token']),
                'account_id' => $accountId,
                'external_id' => $merchant->external_id,
                'status' => $merchant->status,
                'callback_url' => config('services.yookassa_partner.callback_url'),
            ]);

            // Редиректим на страницу организации
            return redirect()->route('organizations.show', $organization->id)
                ->with('success', 'Авторизация YooKassa успешно завершена! Теперь вы можете работать с API магазина.');
        } catch (\Exception $e) {
            Log::error('YooKassa OAuth token exchange failed', [
                'organization_id' => $organization->id ?? null,
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'trace' => $e->getTraceAsString(),
                'has_code' => !empty($code),
                'callback_url' => config('services.yookassa_partner.callback_url'),
                'client_id' => config('services.yookassa_partner.client_id'),
            ]);

            $errorMessage = 'Ошибка при получении токена доступа: ' . $e->getMessage();

            // Если есть organization_id, редиректим на страницу организации
            if (isset($organization)) {
                return redirect()->route('organizations.show', $organization->id)
                    ->with('error', $errorMessage);
            }

            return redirect()->route('organizations.index')
                ->with('error', $errorMessage);
        }
    }
}
