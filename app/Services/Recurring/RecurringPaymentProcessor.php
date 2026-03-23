<?php

namespace App\Services\Recurring;

use App\Mail\RecurringPaymentCancelledMail;
use App\Models\Donation;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Создание повторного платежа по подписке (автоплатеж).
 * Используется основной командой и тестовой (по номеру телефона).
 */
class RecurringPaymentProcessor
{
    private const MAX_FAILED_ATTEMPTS = 3;

    public function __construct(
        private readonly PaymentService $paymentService
    ) {
    }

    public function shouldCreateNextPayment(Donation $donation): bool
    {
        $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
        $recurringPeriod = $paymentDetails['recurring_period'] ?? null;

        if (!$recurringPeriod) {
            return false;
        }

        // Подписка отменена — не создаём платёж
        if (!empty($paymentDetails['recurring_cancelled_at'])) {
            return false;
        }

        // Превышен лимит попыток — не создаём платёж
        if (($paymentDetails['recurring_failed_attempts'] ?? 0) >= self::MAX_FAILED_ATTEMPTS) {
            return false;
        }

        $lastPayment = $this->getLastPaymentForSubscription($donation);
        if (!$lastPayment) {
            $lastPayment = $donation->paymentTransaction;
        }

        $lastPaymentDate = $lastPayment->paid_at ?? $lastPayment->created_at;
        $nextPaymentDate = $this->calculateNextPaymentDate(Carbon::parse($lastPaymentDate), $recurringPeriod);
        $existingPayment = $this->getExistingPaymentForDate($donation, $nextPaymentDate);

        return $nextPaymentDate->isPast() && !$existingPayment;
    }

    public function createRecurringPayment(Donation $originalDonation): array
    {
        $originalTransaction = $originalDonation->paymentTransaction;
        $paymentDetails = $originalTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return ['success' => false, 'error' => 'Отсутствует saved_payment_method_id'];
        }

        $amount = (int) $originalDonation->amount;
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Некорректная сумма подписки'];
        }

        $paymentData = [
            'organization_id'   => $originalDonation->organization_id,
            'fundraiser_id'     => $originalDonation->fundraiser_id,
            'project_id'        => $originalDonation->project_id,
            'project_stage_id'  => $originalDonation->project_stage_id,
            'payment_method_slug' => $originalTransaction->payment_method_slug,
            'amount'            => $amount,
            'currency'          => $originalDonation->currency,
            'description'       => $originalDonation->is_anonymous
                ? 'Регулярное анонимное пожертвование'
                : "Регулярное пожертвование от {$originalDonation->donor_name}",
            'donor_name'        => $originalDonation->is_anonymous ? 'Анонимный донор' : $originalDonation->donor_name,
            'donor_email'       => $originalDonation->donor_email,
            'donor_phone'       => $originalDonation->donor_phone,
            'donor_message'     => $originalDonation->donor_message,
            'is_anonymous'      => $originalDonation->is_anonymous,
            'send_receipt'      => $originalDonation->send_receipt,
            'is_recurring'      => true,
            'recurring_period'  => $paymentDetails['recurring_period'] ?? null,
            'payment_details'   => [
                'is_recurring'           => true,
                'recurring_period'       => $paymentDetails['recurring_period'] ?? null,
                'saved_payment_method_id' => $savedPaymentMethodId,
                'original_donation_id'   => $originalDonation->id,
                'original_transaction_id' => $originalTransaction->id,
            ],
            'success_url' => url('/donation/success'),
            'failure_url' => url('/donation/failure'),
        ];

        try {
            $result = $this->paymentService->createPayment($paymentData);

            if ($result['success']) {
                $this->resetFailedAttempts($originalTransaction);
                Log::info('Создан повторный платеж для регулярного пожертвования', [
                    'original_donation_id' => $originalDonation->id,
                    'new_transaction_id'   => $result['transaction_id'] ?? null,
                ]);
            } else {
                $this->recordFailedAttempt($originalDonation, $originalTransaction);
            }

            return $result;
        } catch (\Exception $e) {
            $this->recordFailedAttempt($originalDonation, $originalTransaction);
            Log::error('Ошибка создания повторного платежа', [
                'original_donation_id' => $originalDonation->id,
                'error'                => $e->getMessage(),
            ]);

            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Отменить подписку по ключу.
     * Устанавливает recurring_cancelled_at во всех транзакциях организации с этим ключом.
     */
    public function cancelSubscription(string $savedPaymentMethodId, int $organizationId): void
    {
        $transactions = PaymentTransaction::query()
            ->where('organization_id', $organizationId)
            ->whereRaw(
                "JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id')) = ?",
                [$savedPaymentMethodId]
            )
            ->get();

        $cancelledAt = now()->toISOString();

        foreach ($transactions as $tx) {
            $details = $tx->payment_details ?? [];
            $details['recurring_cancelled_at'] = $cancelledAt;
            $tx->payment_details = $details;
            $tx->save();
        }

        Log::info('Подписка отменена', [
            'saved_payment_method_id' => $savedPaymentMethodId,
            'organization_id'         => $organizationId,
            'transactions_updated'    => $transactions->count(),
        ]);
    }

    private function recordFailedAttempt(Donation $donation, PaymentTransaction $originalTransaction): void
    {
        $details = $originalTransaction->payment_details ?? [];
        $attempts = (int) ($details['recurring_failed_attempts'] ?? 0) + 1;

        $details['recurring_failed_attempts'] = $attempts;
        $details['recurring_last_failed_at']  = now()->toISOString();
        $originalTransaction->payment_details = $details;
        $originalTransaction->save();

        Log::warning('Зафиксирована ошибка автоплатежа', [
            'donation_id' => $donation->id,
            'attempt'     => $attempts,
            'max'         => self::MAX_FAILED_ATTEMPTS,
        ]);

        if ($attempts >= self::MAX_FAILED_ATTEMPTS) {
            $this->autoCancel($donation, $details);
        }
    }

    private function resetFailedAttempts(PaymentTransaction $transaction): void
    {
        $details = $transaction->payment_details ?? [];

        if (empty($details['recurring_failed_attempts'])) {
            return;
        }

        unset($details['recurring_failed_attempts'], $details['recurring_last_failed_at']);
        $transaction->payment_details = $details;
        $transaction->save();
    }

    private function autoCancel(Donation $donation, array $paymentDetails): void
    {
        $savedMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if ($savedMethodId) {
            $this->cancelSubscription($savedMethodId, $donation->organization_id);
        }

        Log::warning('Подписка автоматически отменена после превышения лимита ошибок', [
            'donation_id'     => $donation->id,
            'organization_id' => $donation->organization_id,
        ]);

        $donorEmail = $donation->donor_email;
        if ($donorEmail && filter_var($donorEmail, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::to($donorEmail)->send(new RecurringPaymentCancelledMail($donation));
            } catch (\Throwable) {
                // Ошибка отправки не должна прерывать обработку
            }
        }
    }

    private function getLastPaymentForSubscription(Donation $originalDonation): ?PaymentTransaction
    {
        $paymentDetails = $originalDonation->paymentTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return $originalDonation->paymentTransaction;
        }

        return PaymentTransaction::query()
            ->where('organization_id', $originalDonation->organization_id)
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id')) = ?", [$savedPaymentMethodId])
            ->where('status', 'completed')
            ->orderBy('paid_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->first();
    }

    private function calculateNextPaymentDate(Carbon $lastPaymentDate, string $period): Carbon
    {
        return match ($period) {
            'daily'  => $lastPaymentDate->copy()->addDay(),
            'weekly' => $lastPaymentDate->copy()->addWeek(),
            default  => $lastPaymentDate->copy()->addMonth(),
        };
    }

    private function getExistingPaymentForDate(Donation $donation, Carbon $date): ?PaymentTransaction
    {
        $paymentDetails = $donation->paymentTransaction->payment_details ?? [];
        $savedPaymentMethodId = $paymentDetails['saved_payment_method_id'] ?? null;

        if (!$savedPaymentMethodId) {
            return null;
        }

        return PaymentTransaction::query()
            ->where('organization_id', $donation->organization_id)
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id')) = ?", [$savedPaymentMethodId])
            ->whereDate('created_at', $date->toDateString())
            ->where('status', '!=', 'cancelled')
            ->first();
    }
}
