<?php

namespace App\Support;

use Illuminate\Support\Str;

class PhoneNumber
{
    /**
     * Normalize Russian phone number to +7XXXXXXXXXX format.
     */
    public static function normalize(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $digits = preg_replace('/\D+/', '', $value);

        if ($digits === '') {
            return null;
        }

        if (Str::startsWith($digits, '8') && strlen($digits) === 11) {
            $digits = '7' . substr($digits, 1);
        }

        if (strlen($digits) === 10) {
            $digits = '7' . $digits;
        }

        if (strlen($digits) !== 11 || !Str::startsWith($digits, '7')) {
            return null;
        }

        return '+' . $digits;
    }

    /**
     * Validate if value is valid Russian phone number.
     */
    public static function isValidRussian(?string $value): bool
    {
        return self::normalize($value) !== null;
    }

    /**
     * Mask normalized phone for UI (+7*** ***-**-12).
     */
    public static function masked(string $normalized): string
    {
        $digits = preg_replace('/\D+/', '', $normalized);

        if (strlen($digits) !== 11) {
            return $normalized;
        }

        return sprintf(
            '+7 *** ***-**-%s',
            substr($digits, -2)
        );
    }
}
