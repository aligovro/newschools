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

    public function __construct(HttpFactory $http, array $config)
    {
        $this->http = $http;
        $this->baseUrl = rtrim($config['base_url'] ?? 'https://api.yookassa.ru', '/');
        $this->clientId = $config['client_id'] ?? '';
        $this->secretKey = $config['secret_key'] ?? '';
        $this->accountId = $config['account_id'] ?? null;

        if (!$this->clientId || !$this->secretKey) {
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

    protected function request(string $method, string $uri, array $payload = [], array $query = []): array
    {
        $url = $this->baseUrl . $uri;

        $request = $this->http->withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Idempotence-Key' => Arr::get($payload, 'idempotence_key', uniqid('ykp_', true)),
        ])->withBasicAuth($this->clientId, $this->secretKey);

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
            ]);

            throw new RuntimeException('YooKassa partner API error: ' . $response->body());
        }

        return $response->json() ?? [];
    }
}

