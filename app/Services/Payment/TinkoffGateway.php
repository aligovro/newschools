<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TinkoffGateway extends AbstractPaymentGateway
{
  private string $apiUrl;
  private string $terminalKey;
  private string $password;

  public function __construct(PaymentMethod $paymentMethod)
  {
    parent::__construct($paymentMethod);

    $this->apiUrl = $this->isTestMode()
      ? 'https://rest-api-test.tinkoff.ru/v2'
      : 'https://securepay.tinkoff.ru/v2';

    $this->terminalKey = $this->getSetting('terminal_key');
    $this->password = $this->getSetting('password');
  }

  public function getName(): string
  {
    return 'Тинькофф';
  }

  public function getSlug(): string
  {
    return 'tinkoff';
  }

  public function createPayment(PaymentTransaction $transaction): array
  {
    try {
      $this->log(
        $transaction->id,
        PaymentLog::ACTION_CREATED,
        'Создание платежа через Тинькофф',
        PaymentLog::LEVEL_INFO,
        ['amount' => $transaction->amount]
      );

      $paymentData = [
        'TerminalKey' => $this->terminalKey,
        'Amount' => $transaction->amount,
        'OrderId' => $transaction->transaction_id,
        'Description' => $this->getPaymentDescription($transaction),
        'SuccessURL' => $this->getSuccessUrl($transaction),
        'FailURL' => $this->getFailureUrl($transaction),
        'NotificationURL' => $this->getCallbackUrl($transaction),
        'Receipt' => [
          'EmailCompany' => $transaction->organization->email,
          'Taxation' => 'usn_income',
          'Items' => [
            [
              'Name' => $this->getPaymentDescription($transaction),
              'Price' => $transaction->amount,
              'Quantity' => 1,
              'Amount' => $transaction->amount,
              'Tax' => 'none',
            ]
          ]
        ],
        'DATA' => [
          'organization_id' => $transaction->organization_id,
          'fundraiser_id' => $transaction->fundraiser_id,
          'project_id' => $transaction->project_id,
        ],
      ];

      // Добавляем подпись
      $paymentData['Token'] = $this->generateToken($paymentData);

      $response = Http::post($this->apiUrl . '/Init', $paymentData);

      if ($response->successful()) {
        $responseData = $response->json();

        if ($responseData['Success'] ?? false) {
          // Сохраняем существующие payment_details и дополняем их данными от gateway
          $existingPaymentDetails = $transaction->payment_details ?? [];
          $transaction->update([
            'external_id' => $responseData['PaymentId'] ?? null,
            'gateway_response' => $responseData,
            'payment_details' => array_merge($existingPaymentDetails, [
              'payment_url' => $responseData['PaymentURL'] ?? null,
              'status' => $responseData['Status'] ?? null,
            ]),
          ]);

          $this->log(
            $transaction->id,
            PaymentLog::ACTION_CREATED,
            'Платеж успешно создан в Тинькофф',
            PaymentLog::LEVEL_INFO,
            ['payment_id' => $responseData['PaymentId'] ?? null]
          );

          return [
            'success' => true,
            'payment_id' => $responseData['PaymentId'] ?? null,
            'payment_url' => $responseData['PaymentURL'] ?? null,
            'redirect_url' => $responseData['PaymentURL'] ?? null,
          ];
        } else {
          $errorMessage = 'Ошибка создания платежа в Тинькофф: ' . ($responseData['Message'] ?? 'Неизвестная ошибка');

          $this->logError(
            $transaction->id,
            PaymentLog::ACTION_FAILED,
            $errorMessage,
            ['response' => $responseData]
          );

          return [
            'success' => false,
            'error' => $errorMessage,
          ];
        }
      } else {
        $errorMessage = 'Ошибка HTTP при создании платежа в Тинькофф: ' . $response->body();

        $this->logError(
          $transaction->id,
          PaymentLog::ACTION_FAILED,
          $errorMessage,
          ['response' => $response->body()]
        );

        return [
          'success' => false,
          'error' => $errorMessage,
        ];
      }
    } catch (\Exception $e) {
      $this->logError(
        $transaction->id,
        PaymentLog::ACTION_FAILED,
        'Исключение при создании платежа в Тинькофф: ' . $e->getMessage(),
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
      $requestData = [
        'TerminalKey' => $this->terminalKey,
        'PaymentId' => $externalId,
      ];

      $requestData['Token'] = $this->generateToken($requestData);

      $response = Http::post($this->apiUrl . '/GetState', $requestData);

      if ($response->successful()) {
        $data = $response->json();
        if ($data['Success'] ?? false) {
          return $this->mapStatus($data['Status'] ?? 'unknown');
        }
      }

      return PaymentTransaction::STATUS_FAILED;
    } catch (\Exception $e) {
      Log::error('Ошибка получения статуса платежа Тинькофф', [
        'external_id' => $externalId,
        'error' => $e->getMessage(),
      ]);

      return PaymentTransaction::STATUS_FAILED;
    }
  }

  public function handleWebhook(Request $request): array
  {
    try {
      $this->logWebhook(
        0, // Будет определен позже
        PaymentLog::ACTION_WEBHOOK_RECEIVED,
        'Получен webhook от Тинькофф',
        $request->all()
      );

      if (!$this->validateWebhook($request)) {
        $this->logError(
          0,
          PaymentLog::ACTION_WEBHOOK_FAILED,
          'Невалидный webhook от Тинькофф',
          $request->all()
        );

        return ['success' => false, 'error' => 'Invalid webhook'];
      }

      $data = $request->json()->all();
      $paymentId = $data['PaymentId'] ?? '';
      $transaction = PaymentTransaction::where('external_id', $paymentId)->first();

      if (!$transaction) {
        $this->logError(
          0,
          PaymentLog::ACTION_WEBHOOK_FAILED,
          'Транзакция не найдена для webhook Тинькофф',
          $data
        );

        return ['success' => false, 'error' => 'Transaction not found'];
      }

      $status = $this->mapStatus($data['Status'] ?? 'unknown');

      $this->updateTransactionStatus($transaction, $status, [
        'webhook_data' => $data,
        'gateway_response' => array_merge($transaction->gateway_response ?? [], $data),
      ]);

      $this->logWebhook(
        $transaction->id,
        PaymentLog::ACTION_WEBHOOK_PROCESSED,
        'Webhook Тинькофф успешно обработан',
        $data
      );

      return ['success' => true, 'transaction_id' => $transaction->id];
    } catch (\Exception $e) {
      $this->logError(
        0,
        PaymentLog::ACTION_WEBHOOK_FAILED,
        'Ошибка обработки webhook Тинькофф: ' . $e->getMessage(),
        ['exception' => $e->getTraceAsString()]
      );

      return ['success' => false, 'error' => $e->getMessage()];
    }
  }

  public function cancelPayment(string $externalId): bool
  {
    try {
      $requestData = [
        'TerminalKey' => $this->terminalKey,
        'PaymentId' => $externalId,
      ];

      $requestData['Token'] = $this->generateToken($requestData);

      $response = Http::post($this->apiUrl . '/Cancel', $requestData);

      if ($response->successful()) {
        $data = $response->json();
        return $data['Success'] ?? false;
      }

      return false;
    } catch (\Exception $e) {
      Log::error('Ошибка отмены платежа Тинькофф', [
        'external_id' => $externalId,
        'error' => $e->getMessage(),
      ]);

      return false;
    }
  }

  public function refundPayment(string $externalId, int $amount = null): bool
  {
    try {
      $requestData = [
        'TerminalKey' => $this->terminalKey,
        'PaymentId' => $externalId,
      ];

      if ($amount) {
        $requestData['Amount'] = $amount;
      }

      $requestData['Token'] = $this->generateToken($requestData);

      $response = Http::post($this->apiUrl . '/Cancel', $requestData);

      if ($response->successful()) {
        $data = $response->json();
        return $data['Success'] ?? false;
      }

      return false;
    } catch (\Exception $e) {
      Log::error('Ошибка возврата платежа Тинькофф', [
        'external_id' => $externalId,
        'amount' => $amount,
        'error' => $e->getMessage(),
      ]);

      return false;
    }
  }

  protected function validateWebhook(Request $request): bool
  {
    $data = $request->json()->all();

    // Проверяем подпись webhook'а
    $receivedToken = $data['Token'] ?? '';
    unset($data['Token']);

    $expectedToken = $this->generateToken($data);

    return hash_equals($receivedToken, $expectedToken);
  }

  /**
   * Генерация токена для запросов к API Тинькофф
   */
  private function generateToken(array $data): string
  {
    // Сортируем массив по ключам
    ksort($data);

    // Удаляем Token если есть
    unset($data['Token']);

    // Создаем строку для подписи
    $tokenString = '';
    foreach ($data as $key => $value) {
      if (is_array($value)) {
        $value = json_encode($value);
      }
      $tokenString .= $value;
    }

    $tokenString .= $this->password;

    return hash('sha256', $tokenString);
  }

  /**
   * Маппинг статусов Тинькофф на наши статусы
   */
  private function mapStatus(string $tinkoffStatus): string
  {
    return match ($tinkoffStatus) {
      'NEW', 'FORM_SHOWED', 'DEADLINE_EXPIRED', 'CANCELED', 'REFUNDED', 'PARTIAL_REFUNDED' => PaymentTransaction::STATUS_PENDING,
      'CONFIRMED', 'AUTHORIZED', 'COMPLETED' => PaymentTransaction::STATUS_COMPLETED,
      'REJECTED', 'REVERSED' => PaymentTransaction::STATUS_FAILED,
      default => PaymentTransaction::STATUS_PENDING,
    };
  }
}
