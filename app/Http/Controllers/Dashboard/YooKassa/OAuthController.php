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
      return response()->json([
        'error' => 'YooKassa Partner credentials not configured',
      ], 400);
    }

    // Генерируем state для защиты от CSRF
    $state = Str::random(32);
    session(['yookassa_oauth_state' => $state]);
    session(['yookassa_oauth_organization_id' => $organization->id]);

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

    // Проверяем наличие ошибки
    if ($error) {
      Log::error('YooKassa OAuth error', [
        'error' => $error,
        'error_description' => $request->query('error_description'),
      ]);

      return redirect()->route('yookassa.merchants')
        ->with('error', 'Ошибка авторизации: ' . ($request->query('error_description') ?? $error));
    }

    // Проверяем state для защиты от CSRF
    $sessionState = session('yookassa_oauth_state');
    if (!$state || $state !== $sessionState) {
      Log::warning('YooKassa OAuth state mismatch', [
        'received_state' => $state,
        'session_state' => $sessionState,
      ]);

      return redirect()->route('yookassa.merchants')
        ->with('error', 'Ошибка безопасности: неверный state параметр');
    }

    // Проверяем наличие кода авторизации
    if (!$code) {
      return redirect()->route('yookassa.merchants')
        ->with('error', 'Код авторизации не получен');
    }

    // Получаем ID организации из сессии
    $organizationId = session('yookassa_oauth_organization_id');
    if (!$organizationId) {
      return redirect()->route('yookassa.merchants')
        ->with('error', 'Не удалось определить организацию');
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

      // Сохраняем токены в мерчанте организации
      $merchant = $organization->yookassaPartnerMerchant;
      if (!$merchant) {
        $merchant = $this->merchantService->createDraft($organization);
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
        ]),
        'settings' => array_merge($merchant->settings ?? [], [
          'oauth_authorized' => true,
          'oauth_authorized_at' => now()->toIso8601String(),
        ]),
      ]);

      // Очищаем сессию
      session()->forget(['yookassa_oauth_state', 'yookassa_oauth_organization_id']);

      Log::info('YooKassa OAuth authorization successful', [
        'organization_id' => $organization->id,
        'merchant_id' => $merchant->id,
      ]);

      return redirect()->route('yookassa.merchants')
        ->with('success', 'Авторизация успешно завершена! Теперь вы можете работать с API магазина.');
    } catch (\Exception $e) {
      Log::error('YooKassa OAuth token exchange failed', [
        'organization_id' => $organization->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return redirect()->route('yookassa.merchants')
        ->with('error', 'Ошибка при получении токена доступа: ' . $e->getMessage());
    }
  }
}
