<?php

namespace App\Services\Payment;

use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SBPGateway extends AbstractPaymentGateway
{
    private string $apiUrl;
    private string $merchantId;
    private string $secretKey;

    public function __construct(\App\Models\PaymentMethod $paymentMethod)
    {
        parent::__construct($paymentMethod);

        $this->apiUrl = $this->isTestMode()
            ? 'https://api.sbp.nspk.ru/test/payment'
            : 'https://api.sbp.nspk.ru/payment';

        $this->merchantId = $this->getSetting('merchant_id');
        $this->secretKey = $this->getSetting('secret_key');
    }

    public function getName(): string
    {
        return 'Система быстрых платежей (СБП)';
    }

    public function getSlug(): string
    {
        return 'sbp';
    }

    public function createPayment(PaymentTransaction $transaction): array
    {
        try {
            $this->log(
                $transaction->id,
                PaymentLog::ACTION_CREATED,
                'Создание платежа через СБП',
                PaymentLog::LEVEL_INFO,
                ['amount' => $transaction->amount]
            );

            $paymentData = [
                'merchantId' => $this->merchantId,
                'amount' => $this->formatAmount($transaction->amount),
                'currency' => $transaction->currency,
                'orderId' => $transaction->transaction_id,
                'description' => $this->getPaymentDescription($transaction),
                'returnUrl' => $this->getReturnUrl($transaction),
                'successUrl' => $this->getSuccessUrl($transaction),
                'failUrl' => $this->getFailureUrl($transaction),
                'callbackUrl' => $this->getCallbackUrl($transaction),
                'extra' => [
                    'organization_id' => $transaction->organization_id,
                    'fundraiser_id' => $transaction->fundraiser_id,
                    'project_id' => $transaction->project_id,
                ],
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->post($this->apiUrl, $paymentData);

            if ($response->successful()) {
                $responseData = $response->json();

                $transaction->update([
                    'external_id' => $responseData['paymentId'] ?? null,
                    'gateway_response' => $responseData,
                    'payment_details' => [
                        'qr_code' => $responseData['qrCode'] ?? null,
                        'deep_link' => $responseData['deepLink'] ?? null,
                    ],
                ]);

                $this->log(
                    $transaction->id,
                    PaymentLog::ACTION_CREATED,
                    'Платеж успешно создан в СБП',
                    PaymentLog::LEVEL_INFO,
                    ['payment_id' => $responseData['paymentId'] ?? null]
                );

                return [
                    'success' => true,
                    'payment_id' => $responseData['paymentId'] ?? null,
                    'qr_code' => $responseData['qrCode'] ?? null,
                    'deep_link' => $responseData['deepLink'] ?? null,
                    'redirect_url' => $responseData['redirectUrl'] ?? null,
                ];
            } else {
                $errorMessage = 'Ошибка создания платежа в СБП: ' . $response->body();

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
                'Исключение при создании платежа в СБП: ' . $e->getMessage(),
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
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->get($this->apiUrl . '/' . $externalId);

            if ($response->successful()) {
                $data = $response->json();
                return $this->mapStatus($data['status'] ?? 'unknown');
            }

            return PaymentTransaction::STATUS_FAILED;
        } catch (\Exception $e) {
            Log::error('Ошибка получения статуса платежа СБП', [
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
                'Получен webhook от СБП',
                $request->all()
            );

            if (!$this->validateWebhook($request)) {
                $this->logError(
                    0,
                    PaymentLog::ACTION_WEBHOOK_FAILED,
                    'Невалидный webhook от СБП',
                    $request->all()
                );

                return ['success' => false, 'error' => 'Invalid webhook'];
            }

            $data = $request->json()->all();
            $transaction = PaymentTransaction::where('external_id', $data['paymentId'] ?? '')->first();

            if (!$transaction) {
                $this->logError(
                    0,
                    PaymentLog::ACTION_WEBHOOK_FAILED,
                    'Транзакция не найдена для webhook СБП',
                    $data
                );

                return ['success' => false, 'error' => 'Transaction not found'];
            }

            $status = $this->mapStatus($data['status'] ?? 'unknown');

            $this->updateTransactionStatus($transaction, $status, [
                'webhook_data' => $data,
                'gateway_response' => array_merge($transaction->gateway_response ?? [], $data),
            ]);

            $this->logWebhook(
                $transaction->id,
                PaymentLog::ACTION_WEBHOOK_PROCESSED,
                'Webhook СБП успешно обработан',
                $data
            );

            return ['success' => true, 'transaction_id' => $transaction->id];
        } catch (\Exception $e) {
            $this->logError(
                0,
                PaymentLog::ACTION_WEBHOOK_FAILED,
                'Ошибка обработки webhook СБП: ' . $e->getMessage(),
                ['exception' => $e->getTraceAsString()]
            );

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function cancelPayment(string $externalId): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->post($this->apiUrl . '/' . $externalId . '/cancel');

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Ошибка отмены платежа СБП', [
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
                'amount' => $amount ? $this->formatAmount($amount) : null,
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
            ])->post($this->apiUrl . '/' . $externalId . '/refund', $refundData);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Ошибка возврата платежа СБП', [
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
        $signature = $request->header('X-SBP-Signature');
        $body = $request->getContent();

        if (!$signature || !$body) {
            return false;
        }

        $expectedSignature = hash_hmac('sha256', $body, $this->secretKey);

        return hash_equals($signature, $expectedSignature);
    }

    /**
     * Маппинг статусов СБП на наши статусы
     */
    private function mapStatus(string $sbpStatus): string
    {
        return match ($sbpStatus) {
            'PENDING' => PaymentTransaction::STATUS_PENDING,
            'COMPLETED', 'SUCCEEDED' => PaymentTransaction::STATUS_COMPLETED,
            'FAILED', 'DECLINED' => PaymentTransaction::STATUS_FAILED,
            'CANCELLED' => PaymentTransaction::STATUS_CANCELLED,
            'REFUNDED' => PaymentTransaction::STATUS_REFUNDED,
            default => PaymentTransaction::STATUS_PENDING,
        };
    }
}
