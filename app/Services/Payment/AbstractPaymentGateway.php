<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use App\Models\PaymentTransaction;
use App\Models\PaymentLog;
use Illuminate\Http\Request;

abstract class AbstractPaymentGateway
{
    protected PaymentMethod $paymentMethod;
    protected bool $isTestMode;

    public function __construct(PaymentMethod $paymentMethod)
    {
        $this->paymentMethod = $paymentMethod;
        $this->isTestMode = $paymentMethod->is_test_mode;
    }

    /**
     * Получение названия шлюза
     */
    abstract public function getName(): string;

    /**
     * Получение slug шлюза
     */
    abstract public function getSlug(): string;

    /**
     * Создание платежа
     */
    abstract public function createPayment(PaymentTransaction $transaction): array;

    /**
     * Получение статуса платежа
     */
    abstract public function getPaymentStatus(string $externalId): string;

    /**
     * Обработка webhook'а
     */
    abstract public function handleWebhook(Request $request): array;

    /**
     * Отмена платежа
     */
    abstract public function cancelPayment(string $externalId): bool;

    /**
     * Возврат платежа
     */
    abstract public function refundPayment(string $externalId, int $amount = null): bool;

    /**
     * Проверка валидности webhook'а
     */
    abstract protected function validateWebhook(Request $request): bool;

    /**
     * Получение настроек шлюза
     */
    protected function getSettings(): array
    {
        return $this->paymentMethod->getGatewaySettings();
    }

    /**
     * Получение настройки по ключу
     */
    protected function getSetting(string $key, $default = null)
    {
        $settings = $this->getSettings();
        return $settings[$key] ?? $default;
    }

    /**
     * Проверка тестового режима
     */
    protected function isTestMode(): bool
    {
        return $this->isTestMode;
    }

    /**
     * Логирование
     */
    protected function log(int $transactionId, string $action, string $message, string $level = PaymentLog::LEVEL_INFO, array $context = []): void
    {
        PaymentLog::createLog($transactionId, $action, $message, $level, $context);
    }

    /**
     * Логирование ошибки
     */
    protected function logError(int $transactionId, string $action, string $message, array $context = []): void
    {
        PaymentLog::createErrorLog($transactionId, $action, $message, $context);
    }

    /**
     * Логирование webhook'а
     */
    protected function logWebhook(int $transactionId, string $action, string $message, array $webhookData = []): void
    {
        PaymentLog::createWebhookLog($transactionId, $action, $message, $webhookData);
    }

    /**
     * Обновление статуса транзакции
     */
    protected function updateTransactionStatus(PaymentTransaction $transaction, string $status, array $additionalData = []): void
    {
        $updateData = array_merge(['status' => $status], $additionalData);

        if ($status === PaymentTransaction::STATUS_COMPLETED && !$transaction->paid_at) {
            $updateData['paid_at'] = now();
        }

        if ($status === PaymentTransaction::STATUS_FAILED && !$transaction->failed_at) {
            $updateData['failed_at'] = now();
        }

        if ($status === PaymentTransaction::STATUS_REFUNDED && !$transaction->refunded_at) {
            $updateData['refunded_at'] = now();
        }

        $transaction->update($updateData);

        $this->log(
            $transaction->id,
            PaymentLog::ACTION_STATUS_CHANGED,
            "Статус изменен на: {$status}",
            PaymentLog::LEVEL_INFO,
            $additionalData
        );
    }

    /**
     * Получение URL для возврата
     */
    protected function getReturnUrl(PaymentTransaction $transaction): string
    {
        $baseUrl = config('app.url');
        $returnUrl = $transaction->return_url ?: $baseUrl . '/payment/return';

        return $returnUrl . '?transaction_id=' . $transaction->transaction_id;
    }

    /**
     * Получение URL для callback
     */
    protected function getCallbackUrl(PaymentTransaction $transaction): string
    {
        $baseUrl = config('app.url');
        return $baseUrl . '/api/payments/webhook/' . $this->getSlug() . '/' . $transaction->transaction_id;
    }

    /**
     * Получение URL при успехе
     */
    protected function getSuccessUrl(PaymentTransaction $transaction): string
    {
        $baseUrl = config('app.url');
        $successUrl = $transaction->success_url ?: $baseUrl . '/payment/success';

        return $successUrl . '?transaction_id=' . $transaction->transaction_id;
    }

    /**
     * Получение URL при ошибке
     */
    protected function getFailureUrl(PaymentTransaction $transaction): string
    {
        $baseUrl = config('app.url');
        $failureUrl = $transaction->failure_url ?: $baseUrl . '/payment/failure';

        return $failureUrl . '?transaction_id=' . $transaction->transaction_id;
    }

    /**
     * Форматирование суммы для платежной системы
     */
    protected function formatAmount(int $amount): string
    {
        return number_format($amount / 100, 2, '.', '');
    }

    /**
     * Проверка валидности суммы
     */
    protected function validateAmount(int $amount): bool
    {
        return $this->paymentMethod->isValidAmount($amount);
    }

    /**
     * Получение описания платежа
     */
    protected function getPaymentDescription(PaymentTransaction $transaction): string
    {
        if ($transaction->description) {
            return $transaction->description;
        }

        $description = 'Пожертвование';

        if ($transaction->fundraiser) {
            $description .= ' на ' . $transaction->fundraiser->title;
        } elseif ($transaction->project) {
            $description .= ' на ' . $transaction->project->title;
        }

        $description .= ' (' . $transaction->organization->name . ')';

        return $description;
    }
}
