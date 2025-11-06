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

        if (isset($paymentSettings['min_amount']) && !isset($paymentSettings['donation_min_amount'])) {
            $paymentSettings['donation_min_amount'] = (int) $paymentSettings['min_amount'];
            unset($paymentSettings['min_amount']);
        }

        if (isset($paymentSettings['max_amount']) && !isset($paymentSettings['donation_max_amount'])) {
            $paymentSettings['donation_max_amount'] = (int) $paymentSettings['max_amount'];
            unset($paymentSettings['max_amount']);
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
