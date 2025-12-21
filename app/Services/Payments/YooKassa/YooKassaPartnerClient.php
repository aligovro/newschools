<?php

namespace App\Services\Payments\YooKassa;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class YooKassaPartnerClient
{
    protected HttpFactory $http;

    protected string $baseUrl;
    protected string $clientId;
    protected string $secretKey;
    protected ?string $accountId;
  protected ?string $accessToken;
  protected bool $useOAuth;

    public function __construct(HttpFactory $http, array $config)
    {
        $this->http = $http;
        $this->baseUrl = rtrim($config['base_url'] ?? 'https://api.yookassa.ru', '/');
        $this->clientId = $config['client_id'] ?? '';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->accountId = $config['account_id'] ?? null;
    $this->accessToken = $config['access_token'] ?? null;
    $this->useOAuth = !empty($this->accessToken);

    if (!$this->useOAuth && (!$this->clientId || !$this->secretKey)) {
            throw new RuntimeException('YooKassa partner credentials are not configured');
        }
    }

    public function createMerchant(array $payload): array
    {
        return $this->request('POST', '/v3/merchants', $payload);
    }

    public function getMerchant(string $merchantId): array
    {
        return $this->request('GET', "/v3/merchants/{$merchantId}");
    }

  /**
   * Получает информацию о текущем мерчанте через OAuth токен
   * Использует endpoint /v3/me
   */
  public function getMe(): array
  {
    if (!$this->useOAuth || !$this->accessToken) {
      throw new RuntimeException('OAuth token is required for /me endpoint');
    }
    return $this->request('GET', '/v3/me');
  }

    public function listPayments(array $query = []): array
    {
        return $this->request('GET', '/v3/payments', [], $query);
    }

    public function listPayouts(array $query = []): array
    {
        return $this->request('GET', '/v3/payouts', [], $query);
    }

    public function confirmPayout(string $payoutId, array $payload = []): array
    {
        return $this->request('POST', "/v3/payouts/{$payoutId}/confirm", $payload);
    }

  /**
   * Создает платеж через Partner API
   */
  public function createPayment(array $payload): array
  {
    return $this->request('POST', '/v3/payments', $payload);
  }

  /**
   * Получает информацию о платеже
   */
  public function getPayment(string $paymentId): array
  {
    return $this->request('GET', "/v3/payments/{$paymentId}");
  }

  /**
   * Отменяет платеж
   */
  public function cancelPayment(string $paymentId): array
  {
    return $this->request('POST', "/v3/payments/{$paymentId}/cancel");
  }

  /**
   * Создает возврат платежа
   */
  public function createRefund(string $paymentId, array $payload): array
  {
    return $this->request('POST', '/v3/refunds', $payload);
  }

  /**
   * Обменивает код авторизации на токен доступа
   */
  public function exchangeCodeForToken(string $code, string $redirectUri): array
  {
    $oauthUrl = config('services.yookassa_partner.oauth_url', 'https://yookassa.ru/oauth/v2');
    $tokenUrl = $oauthUrl . '/token';

    $response = $this->http->asForm()->post($tokenUrl, [
      'grant_type' => 'authorization_code',
      'code' => $code,
      'client_id' => $this->clientId,
      'client_secret' => $this->secretKey,
      'redirect_uri' => $redirectUri,
    ]);

    if (!$response->successful()) {
      Log::error('YooKassa OAuth token exchange failed', [
        'url' => $tokenUrl,
        'response' => $response->json(),
        'status' => $response->status(),
      ]);

      throw new RuntimeException('YooKassa OAuth token exchange error: ' . $response->body());
    }

    return $response->json() ?? [];
  }

    protected function request(string $method, string $uri, array $payload = [], array $query = []): array
    {
        $url = $this->baseUrl . $uri;

    $headers = [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Idempotence-Key' => Arr::get($payload, 'idempotence_key', uniqid('ykp_', true)),
    ];

    // Если используется OAuth токен, используем Bearer авторизацию
    if ($this->useOAuth && $this->accessToken) {
      $request = $this->http->withHeaders($headers)
        ->withToken($this->accessToken);
    } else {
      // Иначе используем Basic Auth
      $request = $this->http->withHeaders($headers)
        ->withBasicAuth($this->clientId, $this->secretKey);
    }

    // Добавляем account_id в заголовок для Partner API
        if ($this->accountId) {
            $request = $request->withHeaders(['X-Account-Id' => $this->accountId]);
        }

        /** @var Response $response */
        $response = $request->{$method}($url, $method === 'GET' ? $query : $payload);

        if (!$response->successful()) {
            Log::error('YooKassa partner request failed', [
                'method' => $method,
                'url' => $url,
                'payload' => $payload,
                'query' => $query,
                'response' => $response->json(),
                'status' => $response->status(),
        'use_oauth' => $this->useOAuth,
            ]);

            throw new RuntimeException('YooKassa partner API error: ' . $response->body());
        }

        return $response->json() ?? [];
    }
}
