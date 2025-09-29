<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;
use App\Models\Donation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class YooKassaService
{
  private string $shopId;
  private string $secretKey;
  private bool $testMode;
  private string $baseUrl;

  public function __construct()
  {
    $this->shopId = Config::get('payments.yookassa.shop_id');
    $this->secretKey = Config::get('payments.yookassa.secret_key');
    $this->testMode = Config::get('payments.yookassa.test_mode', true);
    $this->baseUrl = $this->testMode
      ? 'https://api.yookassa.ru/v3'
      : 'https://api.yookassa.ru/v3';
  }

  /**
   * Создать платеж
   */
  public function createPayment(PaymentTransaction $transaction): array
  {
    try {
      $donation = $transaction->donation;
      $organization = $donation->organization;

      $paymentData = [
        'amount' => [
          'value' => number_format($transaction->amount / 100, 2, '.', ''),
          'currency' => $transaction->currency,
        ],
        'confirmation' => [
          'type' => 'redirect',
          'return_url' => $this->getReturnUrl($transaction),
        ],
        'capture' => true,
        'description' => $this->getPaymentDescription($donation),
        'metadata' => [
          'transaction_id' => $transaction->id,
          'donation_id' => $donation->id,
          'organization_id' => $organization->id,
        ],
        'receipt' => [
          'customer' => [
            'email' => $donation->member?->email ?? $donation->email,
          ],
          'items' => [
            [
              'description' => $this->getPaymentDescription($donation),
              'quantity' => '1',
              'amount' => [
                'value' => number_format($transaction->amount / 100, 2, '.', ''),
                'currency' => $transaction->currency,
              ],
              'vat_code' => 1, // Без НДС
            ],
          ],
        ],
      ];

      $response = $this->makeRequest('POST', '/payments', $paymentData);

      if ($response['success']) {
        $payment = $response['data'];

        // Обновляем транзакцию
        $transaction->update([
          'external_id' => $payment['id'],
          'status' => $payment['status'],
          'payment_url' => $payment['confirmation']['confirmation_url'] ?? null,
          'metadata' => array_merge($transaction->metadata ?? [], [
            'yookassa_payment_id' => $payment['id'],
            'yookassa_response' => $payment,
          ]),
        ]);

        return [
          'success' => true,
          'payment_id' => $payment['id'],
          'payment_url' => $payment['confirmation']['confirmation_url'] ?? null,
          'status' => $payment['status'],
        ];
      }

      return [
        'success' => false,
        'error' => $response['error'],
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa payment creation failed', [
        'transaction_id' => $transaction->id,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Получить статус платежа
   */
  public function getPaymentStatus(string $paymentId): array
  {
    try {
      $response = $this->makeRequest('GET', "/payments/{$paymentId}");

      if ($response['success']) {
        return [
          'success' => true,
          'status' => $response['data']['status'],
          'paid' => $response['data']['paid'] ?? false,
          'amount' => $response['data']['amount']['value'] ?? 0,
          'currency' => $response['data']['amount']['currency'] ?? 'RUB',
        ];
      }

      return [
        'success' => false,
        'error' => $response['error'],
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa payment status check failed', [
        'payment_id' => $paymentId,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Отменить платеж
   */
  public function cancelPayment(string $paymentId): array
  {
    try {
      $response = $this->makeRequest('POST', "/payments/{$paymentId}/cancel");

      if ($response['success']) {
        return [
          'success' => true,
          'status' => $response['data']['status'],
        ];
      }

      return [
        'success' => false,
        'error' => $response['error'],
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa payment cancellation failed', [
        'payment_id' => $paymentId,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Создать возврат
   */
  public function createRefund(string $paymentId, int $amount, string $reason = null): array
  {
    try {
      $refundData = [
        'amount' => [
          'value' => number_format($amount / 100, 2, '.', ''),
          'currency' => 'RUB',
        ],
        'payment_id' => $paymentId,
      ];

      if ($reason) {
        $refundData['description'] = $reason;
      }

      $response = $this->makeRequest('POST', '/refunds', $refundData);

      if ($response['success']) {
        return [
          'success' => true,
          'refund_id' => $response['data']['id'],
          'status' => $response['data']['status'],
        ];
      }

      return [
        'success' => false,
        'error' => $response['error'],
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa refund creation failed', [
        'payment_id' => $paymentId,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Получить список платежей
   */
  public function getPayments(array $filters = []): array
  {
    try {
      $params = [];

      if (isset($filters['limit'])) {
        $params['limit'] = $filters['limit'];
      }

      if (isset($filters['cursor'])) {
        $params['cursor'] = $filters['cursor'];
      }

      if (isset($filters['status'])) {
        $params['status'] = $filters['status'];
      }

      if (isset($filters['created_at'])) {
        $params['created_at'] = $filters['created_at'];
      }

      $queryString = http_build_query($params);
      $url = "/payments" . ($queryString ? "?{$queryString}" : '');

      $response = $this->makeRequest('GET', $url);

      if ($response['success']) {
        return [
          'success' => true,
          'payments' => $response['data']['items'] ?? [],
          'next_cursor' => $response['data']['next_cursor'] ?? null,
        ];
      }

      return [
        'success' => false,
        'error' => $response['error'],
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa payments list failed', [
        'filters' => $filters,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Верифицировать webhook
   */
  public function verifyWebhook(string $signature, string $body): bool
  {
    $expectedSignature = base64_encode(hash_hmac('sha256', $body, $this->secretKey, true));
    return hash_equals($expectedSignature, $signature);
  }

  /**
   * Обработать webhook
   */
  public function handleWebhook(array $data): array
  {
    try {
      $event = $data['event'] ?? null;
      $object = $data['object'] ?? null;

      if (!$event || !$object) {
        return [
          'success' => false,
          'error' => 'Invalid webhook data',
        ];
      }

      $paymentId = $object['id'] ?? null;
      $status = $object['status'] ?? null;

      if (!$paymentId || !$status) {
        return [
          'success' => false,
          'error' => 'Missing payment ID or status',
        ];
      }

      // Находим транзакцию
      $transaction = PaymentTransaction::where('external_id', $paymentId)->first();

      if (!$transaction) {
        Log::warning('Transaction not found for webhook', [
          'payment_id' => $paymentId,
          'webhook_data' => $data,
        ]);

        return [
          'success' => false,
          'error' => 'Transaction not found',
        ];
      }

      // Обновляем статус транзакции
      $transaction->update([
        'status' => $this->mapYooKassaStatus($status),
        'metadata' => array_merge($transaction->metadata ?? [], [
          'webhook_data' => $data,
          'webhook_processed_at' => now()->toISOString(),
        ]),
      ]);

      // Обновляем статус пожертвования
      $donation = $transaction->donation;
      $donationStatus = $this->mapDonationStatus($status);
      $donation->update(['status' => $donationStatus]);

      return [
        'success' => true,
        'transaction_id' => $transaction->id,
        'donation_id' => $donation->id,
        'status' => $donationStatus,
      ];
    } catch (\Exception $e) {
      Log::error('YooKassa webhook handling failed', [
        'webhook_data' => $data,
        'error' => $e->getMessage(),
      ]);

      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Сделать запрос к API
   */
  private function makeRequest(string $method, string $endpoint, array $data = []): array
  {
    try {
      $url = $this->baseUrl . $endpoint;

      $options = [
        'auth' => [$this->shopId, $this->secretKey],
        'headers' => [
          'Content-Type' => 'application/json',
          'Idempotence-Key' => uniqid(),
        ],
      ];

      if (!empty($data)) {
        $options['json'] = $data;
      }

      $response = Http::withOptions($options)->$method($url);

      if ($response->successful()) {
        return [
          'success' => true,
          'data' => $response->json(),
        ];
      }

      return [
        'success' => false,
        'error' => $response->body(),
        'status' => $response->status(),
      ];
    } catch (\Exception $e) {
      return [
        'success' => false,
        'error' => $e->getMessage(),
      ];
    }
  }

  /**
   * Получить URL возврата
   */
  private function getReturnUrl(PaymentTransaction $transaction): string
  {
    return route('payment.success', ['transaction' => $transaction->id]);
  }

  /**
   * Получить описание платежа
   */
  private function getPaymentDescription(Donation $donation): string
  {
    $description = "Пожертвование в организацию: {$donation->organization->name}";

    if ($donation->project) {
      $description .= " (Проект: {$donation->project->title})";
    }

    if ($donation->description) {
      $description .= " - {$donation->description}";
    }

    return $description;
  }

  /**
   * Маппинг статусов ЮKassa в статусы транзакций
   */
  private function mapYooKassaStatus(string $yookassaStatus): string
  {
    return match ($yookassaStatus) {
      'pending' => 'pending',
      'waiting_for_capture' => 'pending',
      'succeeded' => 'completed',
      'canceled' => 'failed',
      default => 'pending',
    };
  }

  /**
   * Маппинг статусов ЮKassa в статусы пожертвований
   */
  private function mapDonationStatus(string $yookassaStatus): string
  {
    return match ($yookassaStatus) {
      'pending', 'waiting_for_capture' => 'pending',
      'succeeded' => 'completed',
      'canceled' => 'failed',
      default => 'pending',
    };
  }

  /**
   * Получить настройки из организации
   */
  public function getOrganizationSettings($organization): array
  {
    $settings = $organization->settings;
    $integrationSettings = $settings?->integration_settings ?? [];

    return [
      'shop_id' => $integrationSettings['yookassa_shop_id'] ?? $this->shopId,
      'secret_key' => $integrationSettings['yookassa_secret_key'] ?? $this->secretKey,
      'test_mode' => $integrationSettings['yookassa_test_mode'] ?? $this->testMode,
    ];
  }

  /**
   * Обновить настройки для организации
   */
  public function updateOrganizationSettings($organization, array $settings): void
  {
    $orgSettings = $organization->settings ?? $organization->settings()->create([]);
    $integrationSettings = $orgSettings->integration_settings ?? [];

    $integrationSettings['yookassa_shop_id'] = $settings['shop_id'];
    $integrationSettings['yookassa_secret_key'] = $settings['secret_key'];
    $integrationSettings['yookassa_test_mode'] = $settings['test_mode'];

    $orgSettings->update(['integration_settings' => $integrationSettings]);
  }

  /**
   * Проверить настройки организации
   */
  public function validateOrganizationSettings($organization): array
  {
    $settings = $this->getOrganizationSettings($organization);

    try {
      $response = $this->makeRequest('GET', '/me');

      return [
        'valid' => $response['success'],
        'error' => $response['success'] ? null : $response['error'],
        'settings' => $settings,
      ];
    } catch (\Exception $e) {
      return [
        'valid' => false,
        'error' => $e->getMessage(),
        'settings' => $settings,
      ];
    }
  }
}
