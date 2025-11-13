<?php

namespace App\Support;

final class Money
{
    private const SYMBOLS = [
        'RUB' => '₽',
        'USD' => '$',
        'EUR' => '€',
    ];

    public static function fromRubles(float|int|string $amount): int
    {
        return (int) round((float) $amount * 100);
    }

    public static function toRubles(?int $amount): float
    {
        if ($amount === null) {
            return 0.0;
        }

        return round($amount / 100, 2);
    }

    public static function format(?int $amount, string $currency = 'RUB', int $precision = 2): string
    {
        $value = self::toRubles($amount);
        $formatted = number_format($value, $precision, ',', ' ');

        return trim($formatted . ' ' . self::symbol($currency));
    }

    public static function toArray(?int $amount, string $currency = 'RUB', int $precision = 2): array
    {
        $minor = $amount ?? 0;

        return [
            'minor' => $minor,
            'value' => self::toRubles($minor),
            'formatted' => self::format($minor, $currency, $precision),
            'currency' => $currency,
        ];
    }

    public static function symbol(string $currency): string
    {
        $key = strtoupper($currency);

        return self::SYMBOLS[$key] ?? $key;
    }
}
