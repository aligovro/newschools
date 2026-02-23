<?php

namespace App\Services\Recurring;

use App\Models\Donation;
use App\Models\PaymentTransaction;
use App\Services\Payment\PaymentService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * Создание повторного платежа по подписке (автоплатеж).
 * Используется основной командой и тестовой (по номеру телефона).
 */
class RecurringPaymentProcessor
{
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
            return [
                'success' => false,
                'error' => 'Отсутствует saved_payment_method_id',
            ];
        }

        $amount = (int) $originalDonation->amount;
        if ($amount <= 0) {
            return ['success' => false, 'error' => 'Некорректная сумма подписки'];
        }

        $paymentData = [
            'organization_id' => $originalDonation->organization_id,
            'fundraiser_id' => $originalDonation->fundraiser_id,
            'project_id' => $originalDonation->project_id,
            'project_stage_id' => $originalDonation->project_stage_id,
            'payment_method_slug' => $originalTransaction->payment_method_slug,
            'amount' => $amount,
            'currency' => $originalDonation->currency,
            'description' => $originalDonation->is_anonymous
                ? 'Регулярное анонимное пожертвование'
                : "Регулярное пожертвование от {$originalDonation->donor_name}",
            'donor_name' => $originalDonation->is_anonymous ? 'Анонимный донор' : $originalDonation->donor_name,
            'donor_email' => $originalDonation->donor_email,
            'donor_phone' => $originalDonation->donor_phone,
            'donor_message' => $originalDonation->donor_message,
            'is_anonymous' => $originalDonation->is_anonymous,
            'send_receipt' => $originalDonation->send_receipt,
            'is_recurring' => true,
            'recurring_period' => $paymentDetails['recurring_period'] ?? null,
            'payment_details' => [
                'is_recurring' => true,
                'recurring_period' => $paymentDetails['recurring_period'] ?? null,
                'saved_payment_method_id' => $savedPaymentMethodId,
                'original_donation_id' => $originalDonation->id,
                'original_transaction_id' => $originalTransaction->id,
            ],
            'success_url' => url('/donation/success'),
            'failure_url' => url('/donation/failure'),
        ];

        try {
            $result = $this->paymentService->createPayment($paymentData);

            if ($result['success']) {
                Log::info('Создан повторный платеж для регулярного пожертвования', [
                    'original_donation_id' => $originalDonation->id,
                    'new_transaction_id' => $result['transaction_id'] ?? null,
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            Log::error('Ошибка создания повторного платежа', [
                'original_donation_id' => $originalDonation->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
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
            'daily' => $lastPaymentDate->copy()->addDay(),
            'weekly' => $lastPaymentDate->copy()->addWeek(),
            'monthly' => $lastPaymentDate->copy()->addMonth(),
            default => $lastPaymentDate->copy()->addMonth(),
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
