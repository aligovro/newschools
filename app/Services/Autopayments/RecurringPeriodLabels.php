<?php

namespace App\Services\Autopayments;

/**
 * Лейблы для периодов recurring-платежей.
 * Единый источник правды на бэкенде.
 */
class RecurringPeriodLabels
{
    private const LABELS = [
        'daily' => 'Ежедневно',
        'weekly' => 'Еженедельно',
        'monthly' => 'Ежемесячно',
    ];

    /**
     * Получить лейбл для периода.
     */
    public static function get(string $period): string
    {
        return self::LABELS[$period] ?? $period;
    }

    /**
     * Получить все доступные периоды из конфига.
     */
    public static function getAvailablePeriods(): array
    {
        return config('payments.recurring.periods', ['daily', 'weekly', 'monthly']);
    }
}
