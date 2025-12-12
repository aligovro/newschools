<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Services\Payments\YooKassa\YooKassaPartnerClientFactory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class YooKassaPartnerGateway extends AbstractPaymentGateway
{
  private YooKassaPartnerClientFactory $clientFactory;
  private ?YooKassaPartnerMerchant $merchant = null;

  public function __construct(PaymentMethod $paymentMethod, ?YooKassaPartnerMerchant $merchant = null)
  {
    parent::__construct($paymentMethod);
    $this->clientFactory = app(YooKassaPartnerClientFactory::class);
    $this->merchant = $merchant;
  }

  public function getName(): string
  {
    return 'ЮKassa Partner API';
  }

  public function getSlug(): string
  {
    return 'yookassa_partner';
  }

  public function createPayment(PaymentTransaction $transaction): array
  {
    try {
      if (!$this->merchant) {
        throw new \RuntimeException('YooKassa Partner merchant is not set');
      }

      $this->log(
        $transaction->id,
        PaymentLog::ACTION_CREATED,
        'Создание платежа через ЮKassa Partner API',
        PaymentLog::LEVEL_INFO,
        ['amount' => $transaction->amount]
      );

      $credentials = $this->merchant->credentials ?? [];
      $accessToken = $credentials['access_token'] ?? null;
      $accountId = $credentials['account_id'] ?? $this->merchant->external_id;

      if (!$accessToken) {
        throw new \RuntimeException('YooKassa Partner access token is not available');
      }

      if (!$accountId) {
        throw new \RuntimeException('YooKassa Partner account_id is not available');
      }

      // Создаем клиент с OAuth токеном
      $client = $this->clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
        'access_token' => $accessToken,
        'account_id' => $accountId,
      ]);

      $paymentData = [
        'amount' => [
          'value' => $this->formatAmount($transaction->amount),
          'currency' => $transaction->currency ?? 'RUB',
        ],
        'capture' => true,
        'confirmation' => $this->buildConfirmation($transaction),
        'description' => $this->getPaymentDescription($transaction),
        'metadata' => [
          'transaction_id' => $transaction->transaction_id,
          'organization_id' => $transaction->organization_id,
          'fundraiser_id' => $transaction->fundraiser_id,
          'project_id' => $transaction->project_id,
        ],
      ];

      // Проверяем, является ли это регулярным пожертвованием
      $isRecurring = isset($transaction->payment_details['is_recurring'])
        && ($transaction->payment_details['is_recurring'] === true
          || $transaction->payment_details['is_recurring'] === 'true'
          || $transaction->payment_details['is_recurring'] === 1)
        || isset($transaction->payment_details['recurring_period']);

      // Для регулярных платежей сохраняем способ оплаты
      if ($isRecurring) {
        $paymentData['save_payment_method'] = true;
      }

      // Если это повторный платеж по сохраненному способу оплаты
      if (isset($transaction->payment_details['saved_payment_method_id'])) {
        $paymentData['payment_method_id'] = $transaction->payment_details['saved_payment_method_id'];
        unset($paymentData['confirmation']);
      } else {
        // Добавляем методы оплаты в зависимости от типа платежа
        $paymentMethodData = $this->getPaymentMethodData();
        if (!empty($paymentMethodData)) {
          $paymentData['payment_method_data'] = $paymentMethodData;
        }
      }

      // Добавляем idempotence_key
      $paymentData['idempotence_key'] = $transaction->transaction_id;

      $responseData = $client->createPayment($paymentData);

      // Сохраняем существующие payment_details и дополняем их данными от gateway
      $existingPaymentDetails = $transaction->payment_details ?? [];
      $qrCode = $this->extractQrCodeFromResponse($responseData);
      $updateData = [
        'external_id' => $responseData['id'] ?? null,
        'gateway_response' => $responseData,
        'payment_details' => array_merge($existingPaymentDetails, [
          'confirmation_url' => $responseData['confirmation']['confirmation_url'] ?? null,
          'qr_code' => $qrCode,
          'payment_method' => $responseData['payment_method']['type'] ?? null,
        ]),
      ];

      // Для повторных платежей confirmation может отсутствовать
      if (!isset($responseData['confirmation'])) {
        $updateData['payment_details']['confirmation_url'] = null;
        $updateData['payment_details']['qr_code'] = null;
      }

      // Сохраняем payment_method_id для регулярных платежей
      $savedPaymentMethodId = null;
      if ($isRecurring && isset($responseData['payment_method']['saved']) && $responseData['payment_method']['saved'] === true) {
        $savedPaymentMethodId = $responseData['payment_method']['id'] ?? null;
        $updateData['payment_details']['saved_payment_method_id'] = $savedPaymentMethodId;
      }

      $transaction->update($updateData);

      $this->log(
        $transaction->id,
        PaymentLog::ACTION_CREATED,
        'Платеж успешно создан в ЮKassa Partner API',
        PaymentLog::LEVEL_INFO,
        ['payment_id' => $responseData['id'] ?? null]
      );

      return [
        'success' => true,
        'payment_id' => $responseData['id'] ?? null,
        'confirmation_url' => $responseData['confirmation']['confirmation_url'] ?? null,
        'redirect_url' => $responseData['confirmation']['confirmation_url'] ?? null,
        'qr_code' => $qrCode,
        'saved_payment_method_id' => $savedPaymentMethodId,
        'status' => $responseData['status'] ?? null,
      ];
    } catch (\Exception $e) {
      $this->logError(
        $transaction->id,
        PaymentLog::ACTION_FAILED,
        'Исключение при создании платежа в ЮKassa Partner API: ' . $e->getMessage(),
        ['exception' => $e->getTraceAsString()]
      );

      return [
        'success' => false,
        'error' => 'Ошибка создания платежа: ' . $e->getMessage(),
      ];
    }
  }

  public function getPaymentStatus(string $externalId): string
  {
    try {
      if (!$this->merchant) {
        return PaymentTransaction::STATUS_FAILED;
      }

      $credentials = $this->merchant->credentials ?? [];
      $accessToken = $credentials['access_token'] ?? null;
      $accountId = $credentials['account_id'] ?? $this->merchant->external_id;

      if (!$accessToken || !$accountId) {
        return PaymentTransaction::STATUS_FAILED;
      }

      $client = $this->clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
        'access_token' => $accessToken,
        'account_id' => $accountId,
      ]);

      $data = $client->getPayment($externalId);
      return $this->mapStatus($data['status'] ?? 'unknown');
    } catch (\Exception $e) {
      Log::error('Ошибка получения статуса платежа ЮKassa Partner API', [
        'external_id' => $externalId,
        'error' => $e->getMessage(),
      ]);

      return PaymentTransaction::STATUS_FAILED;
    }
  }

  public function handleWebhook(Request $request): array
  {
    // Webhook обработка аналогична обычному YooKassaGateway
    // Но может потребоваться дополнительная валидация для Partner API
    return (new YooKassaGateway($this->paymentMethod))->handleWebhook($request);
  }

  public function cancelPayment(string $externalId): bool
  {
    try {
      if (!$this->merchant) {
        return false;
      }

      $credentials = $this->merchant->credentials ?? [];
      $accessToken = $credentials['access_token'] ?? null;
      $accountId = $credentials['account_id'] ?? $this->merchant->external_id;

      if (!$accessToken || !$accountId) {
        return false;
      }

      $client = $this->clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
        'access_token' => $accessToken,
        'account_id' => $accountId,
      ]);

      $client->cancelPayment($externalId);
      return true;
    } catch (\Exception $e) {
      Log::error('Ошибка отмены платежа ЮKassa Partner API', [
        'external_id' => $externalId,
        'error' => $e->getMessage(),
      ]);

      return false;
    }
  }

  public function refundPayment(string $externalId, int $amount = null): bool
  {
    try {
      if (!$this->merchant) {
        return false;
      }

      $credentials = $this->merchant->credentials ?? [];
      $accessToken = $credentials['access_token'] ?? null;
      $accountId = $credentials['account_id'] ?? $this->merchant->external_id;

      if (!$accessToken || !$accountId) {
        return false;
      }

      $client = $this->clientFactory->forSettings([
        'client_id' => config('services.yookassa_partner.client_id'),
        'secret_key' => config('services.yookassa_partner.secret_key'),
        'base_url' => config('services.yookassa_partner.base_url', 'https://api.yookassa.ru'),
        'access_token' => $accessToken,
        'account_id' => $accountId,
      ]);

      // Получаем информацию о платеже для получения суммы
      $paymentInfo = $client->getPayment($externalId);
      $refundAmount = $amount ?? (int) ($paymentInfo['amount']['value'] * 100); // Конвертируем в копейки

      $refundData = [
        'amount' => [
          'value' => $this->formatAmount($refundAmount),
          'currency' => $paymentInfo['amount']['currency'] ?? 'RUB',
        ],
        'payment_id' => $externalId,
      ];

      $client->createRefund($externalId, $refundData);
      return true;
    } catch (\Exception $e) {
      Log::error('Ошибка возврата платежа ЮKassa Partner API', [
        'external_id' => $externalId,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);

      return false;
    }
  }

  protected function validateWebhook(Request $request): bool
  {
    // Проверяем подпись webhook'а
    $signature = $request->header('X-YooMoney-Signature');
    $body = $request->getContent();

    if (!$signature || !$body) {
      return false;
    }

    if (!$this->merchant) {
      return false;
    }

    $credentials = $this->merchant->credentials ?? [];
    $secretKey = $credentials['webhook_secret'] ?? config('services.yookassa_partner.secret_key');

    $expectedSignature = hash_hmac('sha256', $body, $secretKey);

    return hash_equals($signature, $expectedSignature);
  }

  /**
   * Аккуратно извлекаем данные QR-кода из ответа ЮKassa.
   */
  private function extractQrCodeFromResponse(array $responseData): ?string
  {
    $confirmation = $responseData['confirmation'] ?? null;
    if (!is_array($confirmation)) {
      return null;
    }

    $raw = $confirmation['confirmation_data'] ?? null;

    if (is_string($raw) && $raw !== '') {
      return $raw;
    }

    if (is_array($raw)) {
      foreach (['data', 'image', 'qr', 'payload'] as $key) {
        if (!empty($raw[$key]) && is_string($raw[$key])) {
          return $raw[$key];
        }
      }
    }

    return null;
  }

  /**
   * Получение методов оплаты в зависимости от типа
   */
  private function getPaymentMethodData(): array
  {
    $settings = $this->paymentMethod->settings ?? [];

    if (!empty($settings['payment_method_data']) && is_array($settings['payment_method_data'])) {
      return $settings['payment_method_data'];
    }

    if (!empty($settings['payment_method_type']) && is_string($settings['payment_method_type'])) {
      return ['type' => $settings['payment_method_type']];
    }

    return match ($this->paymentMethod->slug) {
      'sbp' => ['type' => 'sbp'],
      'sberpay' => ['type' => 'sberbank'],
      'tinkoff' => ['type' => 'tinkoff_bank'],
      'bankcard' => ['type' => 'bank_card'],
      default => [],
    };
  }

  /**
   * Формирование данных подтверждения оплаты.
   */
  private function buildConfirmation(PaymentTransaction $transaction): array
  {
    $settings = $this->paymentMethod->settings ?? [];
    $confirmation = $settings['confirmation'] ?? null;

    if (is_array($confirmation) && !empty($confirmation['type'])) {
      return $this->normalizeConfirmation($confirmation, $transaction);
    }

    $methodData = $this->getPaymentMethodData();
    $type = $methodData['type'] ?? null;

    return match ($type) {
      'sbp' => ['type' => 'qr'],
      'sberbank', 'tinkoff_bank' => [
        'type' => 'redirect',
        'return_url' => $this->getReturnUrl($transaction),
      ],
      default => [
        'type' => 'redirect',
        'return_url' => $this->getReturnUrl($transaction),
      ],
    };
  }

  /**
   * Нормализация пользовательских настроек подтверждения.
   */
  private function normalizeConfirmation(array $confirmation, PaymentTransaction $transaction): array
  {
    $type = strtolower((string) ($confirmation['type'] ?? 'redirect'));

    return match ($type) {
      'qr' => ['type' => 'qr'],
      'embedded' => [
        'type' => 'embedded',
        'locale' => $confirmation['locale'] ?? 'ru_RU',
      ],
      'mobile_application' => [
        'type' => 'mobile_application',
        'return_url' => $confirmation['return_url'] ?? $this->getReturnUrl($transaction),
      ],
      default => [
        'type' => 'redirect',
        'return_url' => $confirmation['return_url'] ?? $this->getReturnUrl($transaction),
      ],
    };
  }

  /**
   * Маппинг статусов ЮKassa на наши статусы
   */
  private function mapStatus(string $yookassaStatus): string
  {
    return match ($yookassaStatus) {
      'pending' => PaymentTransaction::STATUS_PENDING,
      'succeeded' => PaymentTransaction::STATUS_COMPLETED,
      'canceled' => PaymentTransaction::STATUS_CANCELLED,
      default => PaymentTransaction::STATUS_PENDING,
    };
  }
}
