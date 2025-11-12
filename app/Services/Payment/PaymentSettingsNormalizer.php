<?php

namespace App\Services\Payment;

class PaymentSettingsNormalizer
{
    /**
     * Нормализовать платежные настройки из запроса
     * Конвертирует легаси ключи в актуальные
     */
    public function normalize(array $paymentSettings): array
    {
        // Нормализация легаси ключей к единому формату
        if (isset($paymentSettings['enabled_methods']) && !isset($paymentSettings['enabled_gateways'])) {
            $paymentSettings['enabled_gateways'] = $paymentSettings['enabled_methods'];
            unset($paymentSettings['enabled_methods']);
        }

        if (isset($paymentSettings['gateway']) && !isset($paymentSettings['enabled_gateways'])) {
            $paymentSettings['enabled_gateways'] = [$paymentSettings['gateway']];
        }

        if (isset($paymentSettings['min_amount']) && !isset($paymentSettings['donation_min_amount'])) {
            $paymentSettings['donation_min_amount'] = (int) $paymentSettings['min_amount'];
            unset($paymentSettings['min_amount']);
        }

        if (isset($paymentSettings['max_amount']) && !isset($paymentSettings['donation_max_amount'])) {
            $paymentSettings['donation_max_amount'] = (int) $paymentSettings['max_amount'];
            unset($paymentSettings['max_amount']);
        }

        if (isset($paymentSettings['enabled_gateways']) && is_array($paymentSettings['enabled_gateways'])) {
            $paymentSettings['enabled_gateways'] = array_values(array_filter(array_map(
                static fn($gateway) => is_string($gateway) ? strtolower($gateway) : null,
                $paymentSettings['enabled_gateways']
            )));
        }

        if (empty($paymentSettings['enabled_gateways'])) {
            $paymentSettings['enabled_gateways'] = ['yookassa'];
        }

        if (isset($paymentSettings['credentials']) && is_array($paymentSettings['credentials'])) {
            $paymentSettings['credentials'] = array_filter(
                $paymentSettings['credentials'],
                static fn($value) => is_array($value)
            );
        } else {
            $paymentSettings['credentials'] = [];
        }

        if (isset($paymentSettings['options']) && !is_array($paymentSettings['options'])) {
            $paymentSettings['options'] = [];
        }

        $paymentSettings['currency'] = strtoupper(
            is_string($paymentSettings['currency'] ?? null) ? substr($paymentSettings['currency'], 0, 3) : 'RUB'
        );

        if (array_key_exists('test_mode', $paymentSettings)) {
            $paymentSettings['test_mode'] = filter_var($paymentSettings['test_mode'], FILTER_VALIDATE_BOOLEAN);
        } else {
            $paymentSettings['test_mode'] = true;
        }

        if (isset($paymentSettings['donation_min_amount'])) {
            $paymentSettings['donation_min_amount'] = max(0, (int) $paymentSettings['donation_min_amount']);
        } else {
            $paymentSettings['donation_min_amount'] = 100;
        }

        if (isset($paymentSettings['donation_max_amount'])) {
            $paymentSettings['donation_max_amount'] = max(0, (int) $paymentSettings['donation_max_amount']);
        } else {
            $paymentSettings['donation_max_amount'] = 0;
        }

        return $paymentSettings;
    }

    /**
     * Распарсить платежные настройки из строки JSON (если пришло из FormData)
     */
    public function parse($paymentSettingsRaw): ?array
    {
        if (!$paymentSettingsRaw) {
            return null;
        }

        // Если пришло как JSON строка (из FormData) - парсим
        if (is_string($paymentSettingsRaw)) {
            $parsed = json_decode($paymentSettingsRaw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($parsed)) {
                return $this->normalize($parsed);
            }
            return null;
        }

        // Если уже массив
        if (is_array($paymentSettingsRaw)) {
            return $this->normalize($paymentSettingsRaw);
        }

        return null;
    }
}
