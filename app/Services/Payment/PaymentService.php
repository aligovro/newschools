<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use App\Models\Donation;
use App\Models\Organization;
use App\Models\Fundraiser;
use App\Models\OrganizationProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Создание платежа
     */
    public function createPayment(array $data): array
    {
        DB::beginTransaction();

        try {
            // Валидация данных
            $this->validatePaymentData($data);

            // Получаем метод платежа
            $paymentMethod = PaymentMethod::where('slug', $data['payment_method_slug'])
                ->where('is_active', true)
                ->firstOrFail();

            // Создаем транзакцию
            $transaction = PaymentTransaction::create([
                'organization_id' => $data['organization_id'],
                'fundraiser_id' => $data['fundraiser_id'] ?? null,
                'project_id' => $data['project_id'] ?? null,
                'payment_method_id' => $paymentMethod->id,
                'transaction_id' => PaymentTransaction::generateTransactionId(),
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'RUB',
                'status' => PaymentTransaction::STATUS_PENDING,
                'payment_method_slug' => $paymentMethod->slug,
                'description' => $data['description'] ?? null,
                'return_url' => $data['return_url'] ?? null,
                'success_url' => $data['success_url'] ?? null,
                'failure_url' => $data['failure_url'] ?? null,
                'expires_at' => now()->addHours(24), // Платеж действителен 24 часа
            ]);

            // Создаем шлюз и инициируем платеж
            $gateway = PaymentGatewayFactory::create($paymentMethod);
            $paymentResult = $gateway->createPayment($transaction);

            if ($paymentResult['success']) {
                // Обновляем транзакцию с данными от шлюза
                $transaction->update([
                    'external_id' => $paymentResult['payment_id'] ?? null,
                    'gateway_response' => $paymentResult,
                ]);

                DB::commit();

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_CREATED,
                    'Платеж успешно создан',
                    PaymentLog::LEVEL_INFO,
                    ['gateway' => $gateway->getName()]
                );

                return [
                    'success' => true,
                    'transaction_id' => $transaction->transaction_id,
                    'payment_id' => $paymentResult['payment_id'] ?? null,
                    'redirect_url' => $paymentResult['redirect_url'] ?? null,
                    'qr_code' => $paymentResult['qr_code'] ?? null,
                    'deep_link' => $paymentResult['deep_link'] ?? null,
                    'confirmation_url' => $paymentResult['confirmation_url'] ?? null,
                ];
            } else {
                // Обновляем статус транзакции на неудачный
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_FAILED,
                    'failed_at' => now(),
                    'gateway_response' => $paymentResult,
                ]);

                DB::commit();

                PaymentLog::createErrorLog(
                    $transaction->id,
                    PaymentLog::ACTION_FAILED,
                    'Ошибка создания платежа: ' . ($paymentResult['error'] ?? 'Неизвестная ошибка'),
                    ['gateway' => $gateway->getName()]
                );

                return [
                    'success' => false,
                    'error' => $paymentResult['error'] ?? 'Неизвестная ошибка',
                ];
            }
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Payment creation failed', [
                'error' => $e->getMessage(),
                'data' => $data,
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка создания платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Обработка webhook'а
     */
    public function handleWebhook(string $gatewaySlug, Request $request): array
    {
        try {
            $gateway = PaymentGatewayFactory::createBySlug($gatewaySlug);
            return $gateway->handleWebhook($request);
        } catch (\Exception $e) {
            Log::error('Webhook handling failed', [
                'gateway' => $gatewaySlug,
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка обработки webhook: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Получение статуса платежа
     */
    public function getPaymentStatus(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            // Если платеж еще не завершен, проверяем статус в шлюзе
            if ($transaction->isPending()) {
                $gateway = PaymentGatewayFactory::create($transaction->paymentMethod);
                $externalStatus = $gateway->getPaymentStatus($transaction->external_id);

                if ($externalStatus !== $transaction->status) {
                    $transaction->update(['status' => $externalStatus]);
                }
            }

            return [
                'success' => true,
                'transaction_id' => $transaction->transaction_id,
                'status' => $transaction->status,
                'amount' => $transaction->amount,
                'currency' => $transaction->currency,
                'created_at' => $transaction->created_at,
                'paid_at' => $transaction->paid_at,
                'failed_at' => $transaction->failed_at,
                'is_expired' => $transaction->isExpired(),
            ];
        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка получения статуса платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Отмена платежа
     */
    public function cancelPayment(string $transactionId): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            if (!$transaction->isPending()) {
                return [
                    'success' => false,
                    'error' => 'Платеж не может быть отменен',
                ];
            }

            $gateway = PaymentGatewayFactory::create($transaction->paymentMethod);
            $cancelled = $gateway->cancelPayment($transaction->external_id);

            if ($cancelled) {
                $transaction->update([
                    'status' => PaymentTransaction::STATUS_CANCELLED,
                    'failed_at' => now(),
                ]);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_CANCELLED,
                    'Платеж отменен'
                );

                return [
                    'success' => true,
                    'message' => 'Платеж успешно отменен',
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Не удалось отменить платеж в платежной системе',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment cancellation failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка отмены платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Возврат платежа
     */
    public function refundPayment(string $transactionId, int $amount = null): array
    {
        try {
            $transaction = PaymentTransaction::where('transaction_id', $transactionId)->firstOrFail();

            if (!$transaction->isCompleted()) {
                return [
                    'success' => false,
                    'error' => 'Можно вернуть только завершенные платежи',
                ];
            }

            $refundAmount = $amount ?? $transaction->amount;

            if ($refundAmount > $transaction->amount) {
                return [
                    'success' => false,
                    'error' => 'Сумма возврата не может превышать сумму платежа',
                ];
            }

            $gateway = PaymentGatewayFactory::create($transaction->paymentMethod);
            $refunded = $gateway->refundPayment($transaction->external_id, $refundAmount);

            if ($refunded) {
                $newStatus = $refundAmount === $transaction->amount
                    ? PaymentTransaction::STATUS_REFUNDED
                    : PaymentTransaction::STATUS_COMPLETED;

                $transaction->update([
                    'status' => $newStatus,
                    'refunded_at' => now(),
                ]);

                PaymentLog::createLog(
                    $transaction->id,
                    PaymentLog::ACTION_REFUNDED,
                    "Возврат платежа на сумму {$refundAmount} копеек"
                );

                return [
                    'success' => true,
                    'message' => 'Возврат успешно выполнен',
                    'refunded_amount' => $refundAmount,
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Не удалось выполнить возврат в платежной системе',
                ];
            }
        } catch (\Exception $e) {
            Log::error('Payment refund failed', [
                'transaction_id' => $transactionId,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Ошибка возврата платежа: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Создание доната после успешного платежа
     */
    public function createDonation(PaymentTransaction $transaction): Donation
    {
        return Donation::create([
            'organization_id' => $transaction->organization_id,
            'fundraiser_id' => $transaction->fundraiser_id,
            'project_id' => $transaction->project_id,
            'payment_transaction_id' => $transaction->id,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'status' => 'completed',
            'payment_method' => $transaction->payment_method_slug,
            'payment_id' => $transaction->external_id,
            'transaction_id' => $transaction->transaction_id,
            'is_anonymous' => false, // Можно добавить в данные платежа
            'donor_name' => $transaction->payment_details['donor_name'] ?? null,
            'donor_email' => $transaction->payment_details['donor_email'] ?? null,
            'donor_phone' => $transaction->payment_details['donor_phone'] ?? null,
            'donor_message' => $transaction->payment_details['donor_message'] ?? null,
            'send_receipt' => true,
            'payment_details' => $transaction->payment_details,
            'webhook_data' => $transaction->webhook_data,
            'paid_at' => $transaction->paid_at,
        ]);
    }

    /**
     * Валидация данных платежа
     */
    private function validatePaymentData(array $data): void
    {
        $required = ['organization_id', 'amount', 'payment_method_slug'];

        foreach ($required as $field) {
            if (!isset($data[$field])) {
                throw new \InvalidArgumentException("Required field missing: {$field}");
            }
        }

        // Проверяем организацию
        Organization::findOrFail($data['organization_id']);

        // Проверяем фандрайзер или проект
        if (isset($data['fundraiser_id'])) {
            Fundraiser::findOrFail($data['fundraiser_id']);
        }

        if (isset($data['project_id'])) {
            OrganizationProject::findOrFail($data['project_id']);
        }

        // Проверяем сумму
        if ($data['amount'] <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
    }

    /**
     * Получение доступных методов платежа
     */
    public function getAvailablePaymentMethods(): array
    {
        return PaymentGatewayFactory::getAvailablePaymentMethods();
    }

    /**
     * Получение статистики платежей
     */
    public function getPaymentStatistics(int $organizationId, array $filters = []): array
    {
        $query = PaymentTransaction::forOrganization($organizationId);

        if (isset($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $transactions = $query->get();

        return [
            'total_transactions' => $transactions->count(),
            'total_amount' => $transactions->sum('amount'),
            'completed_transactions' => $transactions->where('status', PaymentTransaction::STATUS_COMPLETED)->count(),
            'completed_amount' => $transactions->where('status', PaymentTransaction::STATUS_COMPLETED)->sum('amount'),
            'failed_transactions' => $transactions->where('status', PaymentTransaction::STATUS_FAILED)->count(),
            'pending_transactions' => $transactions->where('status', PaymentTransaction::STATUS_PENDING)->count(),
            'by_payment_method' => $transactions->groupBy('payment_method_slug')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'amount' => $group->sum('amount'),
                    'completed_count' => $group->where('status', PaymentTransaction::STATUS_COMPLETED)->count(),
                    'completed_amount' => $group->where('status', PaymentTransaction::STATUS_COMPLETED)->sum('amount'),
                ];
            }),
        ];
    }
}
