<?php

namespace App\Services\Autopayments;

/**
 * Маскирование ключа подписки для безопасного отображения.
 */
class SubscriptionKeyMasker
{
    /**
     * Замаскировать ключ подписки для отображения.
     * Показывает первые 4 и последние 4 символа, остальное заменяет на ***.
     */
    public static function mask(string $key): string
    {
        $length = strlen($key);
        
        if ($length <= 8) {
            // Если ключ короткий, показываем только последние 4 символа
            return '****' . substr($key, -4);
        }

        $start = substr($key, 0, 4);
        $end = substr($key, -4);
        
        return $start . '***' . $end;
    }
}
