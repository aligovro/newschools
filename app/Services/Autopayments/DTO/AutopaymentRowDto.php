<?php

namespace App\Services\Autopayments\DTO;

/**
 * DTO для одной записи автоплатежа в списке.
 */
class AutopaymentRowDto
{
    public function __construct(
        public readonly string $title,
        public readonly int $amount,
        public readonly string $amount_formatted,
        public readonly string $recurring_period,
        public readonly string $recurring_period_label,
        public readonly ?string $payment_method_slug,
        public readonly array $payments, // [{date: string, label: string}, ...]
        public readonly ?string $first_payment_at,
        public readonly string $subscription_key_masked,
    ) {
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'amount' => $this->amount,
            'amount_formatted' => $this->amount_formatted,
            'recurring_period' => $this->recurring_period,
            'recurring_period_label' => $this->recurring_period_label,
            'payment_method_slug' => $this->payment_method_slug,
            'payments' => $this->payments,
            'first_payment_at' => $this->first_payment_at,
            'subscription_key_masked' => $this->subscription_key_masked,
        ];
    }
}
