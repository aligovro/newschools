<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class YooKassaGateway extends AbstractPaymentGateway
{
    private string $apiUrl;
    private string $shopId;
    private string $secretKey;

    public function __construct(\App\Models\PaymentMethod $paymentMethod)
    {
        parent::__construct($paymentMethod);

        $this->apiUrl = $this->isTestMode()
            ? 'https://api.yookassa.ru/v3/payments'
            : 'https://api.yookassa.ru/v3/payments';

        $this->shopId = $this->getSetting('shop_id');
        $this->secretKey = $this->getSetting('secret_key');
    }

    public function getName(): string
    {
        return 'ЮKassa (Сбербанк)';
    }

    public function getSlug(): string
    {
        return 'yookassa';
    }

    public function createPayment(PaymentTransaction $transaction): array
    {
        try {
            $this->log(
                $transaction->id,
                PaymentLog::ACTION_CREATED,
                'Создание платежа через ЮKassa',
                PaymentLog::LEVEL_INFO,
                ['amount' => $transaction->amount]
            );

            $paymentData = [
                'amount' => [
                    'value' => $this->formatAmount($transaction->amount),
                    'currency' => $transaction->currency,
                ],
                'confirmation' => [
                    'type' => 'redirect',
                    'return_url' => $this->getReturnUrl($transaction),
                ],
                'description' => $this->getPaymentDescription($transaction),
                'metadata' => [
                    'transaction_id' => $transaction->transaction_id,
                    'organization_id' => $transaction->organization_id,
                    'fundraiser_id' => $transaction->fundraiser_id,
                    'project_id' => $transaction->project_id,
                ],
            ];

            // Добавляем методы оплаты в зависимости от типа платежа
            $paymentMethods = $this->getPaymentMethods();
            if (!empty($paymentMethods)) {
                $paymentData['payment_method_data'] = $paymentMethods;
            }

            $response = Http::withBasicAuth($this->shopId, $this->secretKey)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Idempotence-Key' => $transaction->transaction_id,
                ])
                ->post($this->apiUrl, $paymentData);

            if ($response->successful()) {
                $responseData = $response->json();

                $transaction->update([
                    'external_id' => $responseData['id'] ?? null,
                    'gateway_response' => $responseData,
                    'payment_details' => [
                        'confirmation_url' => $responseData['confirmation']['confirmation_url'] ?? null,
                        'payment_method' => $responseData['payment_method']['type'] ?? null,
                    ],
                ]);

                $this->log(
                    $transaction->id,
                    PaymentLog::ACTION_CREATED,
                    'Платеж успешно создан в ЮKassa',
                    PaymentLog::LEVEL_INFO,
                    ['payment_id' => $responseData['id'] ?? null]
                );

                return [
                    'success' => true,
                    'payment_id' => $responseData['id'] ?? null,
                    'confirmation_url' => $responseData['confirmation']['confirmation_url'] ?? null,
                    'redirect_url' => $responseData['confirmation']['confirmation_url'] ?? null,
                ];
            } else {
                $errorMessage = 'Ошибка создания платежа в ЮKassa: ' . $response->body();

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
                'Исключение при создании платежа в ЮKassa: ' . $e->getMessage(),
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
            $response = Http::withBasicAuth($this->shopId, $this->secretKey)
                ->get($this->apiUrl . '/' . $externalId);

            if ($response->successful()) {
                $data = $response->json();
                return $this->mapStatus($data['status'] ?? 'unknown');
            }

            return PaymentTransaction::STATUS_FAILED;
        } catch (\Exception $e) {
            Log::error('Ошибка получения статуса платежа ЮKassa', [
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
                'Получен webhook от ЮKassa',
                $request->all()
            );

            if (!$this->validateWebhook($request)) {
                $this->logError(
                    0,
                    PaymentLog::ACTION_WEBHOOK_FAILED,
                    'Невалидный webhook от ЮKassa',
                    $request->all()
                );

                return ['success' => false, 'error' => 'Invalid webhook'];
            }

            $data = $request->json()->all();
            $paymentId = $data['object']['id'] ?? '';
            $transaction = PaymentTransaction::where('external_id', $paymentId)->first();

            if (!$transaction) {
                $this->logError(
                    0,
                    PaymentLog::ACTION_WEBHOOK_FAILED,
                    'Транзакция не найдена для webhook ЮKassa',
                    $data
                );

                return ['success' => false, 'error' => 'Transaction not found'];
            }

            $status = $this->mapStatus($data['object']['status'] ?? 'unknown');

            $this->updateTransactionStatus($transaction, $status, [
                'webhook_data' => $data,
                'gateway_response' => array_merge($transaction->gateway_response ?? [], $data['object'] ?? []),
            ]);

            $this->logWebhook(
                $transaction->id,
                PaymentLog::ACTION_WEBHOOK_PROCESSED,
                'Webhook ЮKassa успешно обработан',
                $data
            );

            return ['success' => true, 'transaction_id' => $transaction->id];
        } catch (\Exception $e) {
            $this->logError(
                0,
                PaymentLog::ACTION_WEBHOOK_FAILED,
                'Ошибка обработки webhook ЮKassa: ' . $e->getMessage(),
                ['exception' => $e->getTraceAsString()]
            );

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function cancelPayment(string $externalId): bool
    {
        try {
            $response = Http::withBasicAuth($this->shopId, $this->secretKey)
                ->post($this->apiUrl . '/' . $externalId . '/cancel');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Ошибка отмены платежа ЮKassa', [
                'external_id' => $externalId,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public function refundPayment(string $externalId, int $amount = null): bool
    {
        try {
            $refundData = [
                'amount' => [
                    'value' => $amount ? $this->formatAmount($amount) : $this->getPaymentAmount($externalId),
                    'currency' => 'RUB',
                ],
                'payment_id' => $externalId,
            ];

            $response = Http::withBasicAuth($this->shopId, $this->secretKey)
                ->post('https://api.yookassa.ru/v3/refunds', $refundData);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Ошибка возврата платежа ЮKassa', [
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

        $expectedSignature = hash_hmac('sha256', $body, $this->secretKey);

        return hash_equals($signature, $expectedSignature);
    }

    /**
     * Получение методов оплаты в зависимости от типа
     */
    private function getPaymentMethods(): array
    {
        $paymentMethodSlug = $this->paymentMethod->slug;

        return match ($paymentMethodSlug) {
            'sberpay' => ['type' => 'sberbank'],
            'bankcard' => ['type' => 'bank_card'],
            default => [],
        };
    }

    /**
     * Получение суммы платежа для возврата
     */
    private function getPaymentAmount(string $externalId): string
    {
        try {
            $response = Http::withBasicAuth($this->shopId, $this->secretKey)
                ->get($this->apiUrl . '/' . $externalId);

            if ($response->successful()) {
                $data = $response->json();
                return $data['amount']['value'] ?? '0.00';
            }
        } catch (\Exception $e) {
            Log::error('Ошибка получения суммы платежа ЮKassa', [
                'external_id' => $externalId,
                'error' => $e->getMessage(),
            ]);
        }

        return '0.00';
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
