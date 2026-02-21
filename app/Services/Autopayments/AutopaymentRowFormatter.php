<?php

namespace App\Services\Autopayments;

use App\Services\Autopayments\DTO\AutopaymentRowDto;
use App\Support\Money;
use Carbon\Carbon;

/**
 * Форматтер для преобразования сырых данных подписки в DTO.
 */
class AutopaymentRowFormatter
{
    /**
     * Форматировать данные одной подписки в DTO.
     *
     * @param object{subscription_key: string, transaction: object, donations: Collection, legacy_autopayment?: object|null} $subscriptionData
     */
    public function format(object $subscriptionData): AutopaymentRowDto
    {
        $transaction = $subscriptionData->transaction;
        $donations = $subscriptionData->donations;
        $paymentDetails = $transaction->payment_details ?? [];
        $legacyAp = $subscriptionData->legacy_autopayment ?? null;

        // Заголовок: из organization_autopayments (миграция) или первой донации
        $title = ($legacyAp && !empty($legacyAp->title))
            ? $legacyAp->title
            : ($legacyAp && !empty($legacyAp->phone_number)
                ? ('Автоплатеж ' . $legacyAp->phone_number)
                : $this->resolveTitleFromDonations($donations));

        // Сумма из первой транзакции
        $amount = (int) ($transaction->amount ?? 0);
        $currency = $transaction->currency ?? 'RUB';
        $amountFormatted = Money::format($amount, $currency);

        // Период подписки
        $recurringPeriod = $paymentDetails['recurring_period'] ?? 'monthly';
        $recurringPeriodLabel = RecurringPeriodLabels::get($recurringPeriod);

        // Список платежей (последние 10)
        $payments = $donations
            ->take(10)
            ->map(function ($donation) {
                $date = $donation->paid_at 
                    ? Carbon::parse($donation->paid_at)->format('d.m.Y H:i')
                    : ($donation->created_at ? Carbon::parse($donation->created_at)->format('d.m.Y H:i') : null);
                
                $label = $this->resolvePaymentLabel($donation);

                return [
                    'date' => $date,
                    'label' => $label,
                ];
            })
            ->toArray();

        // Дата первого платежа
        $firstPaymentAt = $transaction->paid_at 
            ? Carbon::parse($transaction->paid_at)->format('d.m.Y H:i')
            : ($transaction->created_at ? Carbon::parse($transaction->created_at)->format('d.m.Y H:i') : null);

        // Замаскированный ключ подписки
        $subscriptionKeyMasked = SubscriptionKeyMasker::mask($subscriptionData->subscription_key);

        return new AutopaymentRowDto(
            title: $title,
            amount: $amount,
            amount_formatted: $amountFormatted,
            recurring_period: $recurringPeriod,
            recurring_period_label: $recurringPeriodLabel,
            payment_method_slug: $transaction->payment_method_slug,
            payments: $payments,
            first_payment_at: $firstPaymentAt,
            subscription_key_masked: $subscriptionKeyMasked,
        );
    }

    private function resolveTitleFromDonations($donations): string
    {
        $first = $donations->first();
        if ($first && !$first->is_anonymous && $first->donor_name && $first->donor_name !== 'Импорт из blagoqr') {
            return $first->donor_name;
        }
        return 'Анонимное пожертвование';
    }

    /** "Импорт из blagoqr" нигде не показываем — заменяем на "Анонимное пожертвование". */
    private function resolvePaymentLabel(object $donation): string
    {
        if ($donation->is_anonymous) {
            return 'Анонимное пожертвование';
        }
        $name = trim($donation->donor_name ?? '');
        if ($name === '' || $name === 'Импорт из blagoqr') {
            return 'Анонимное пожертвование';
        }
        return $name;
    }
}
