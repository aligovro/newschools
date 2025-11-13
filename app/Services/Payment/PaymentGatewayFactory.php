<?php

namespace App\Services\Payment;

use App\Models\PaymentMethod;
use InvalidArgumentException;
use Illuminate\Support\Facades\Log;

class PaymentGatewayFactory
{
    /**
     * Создание экземпляра шлюза по методу платежа.
     */
    public static function create(PaymentMethod $paymentMethod): AbstractPaymentGateway
    {
        return self::createForProvider(
            self::guessProviderFromGatewayClass($paymentMethod->gateway),
            $paymentMethod
        );
    }

    /**
     * Создание экземпляра шлюза по методу платежа и провайдеру.
     */
    public static function createForProvider(string $provider, PaymentMethod $paymentMethod): AbstractPaymentGateway
    {
        $gatewayClass = self::gatewayClassForProvider($provider, $paymentMethod);

        if (!class_exists($gatewayClass)) {
            throw new InvalidArgumentException("Gateway class not found: {$gatewayClass}");
        }

        if (!is_subclass_of($gatewayClass, AbstractPaymentGateway::class)) {
            throw new InvalidArgumentException("Gateway class must extend AbstractPaymentGateway: {$gatewayClass}");
        }

        return new $gatewayClass($paymentMethod);
    }

    /**
     * Создание шлюза по slug метода платежа.
     * Использует провайдер, указанный в самом методе.
     */
    public static function createBySlug(string $slug): AbstractPaymentGateway
    {
        $paymentMethod = PaymentMethod::where('slug', $slug)->where('is_active', true)->first();

        if (!$paymentMethod) {
            throw new InvalidArgumentException("Active payment method not found: {$slug}");
        }

        return self::create($paymentMethod);
    }

    /**
     * Получение всех доступных шлюзов
     */
    public static function getAvailableGateways(): array
    {
        $paymentMethods = PaymentMethod::active()->ordered()->get();
        $gateways = [];

        foreach ($paymentMethods as $paymentMethod) {
            try {
                $gateways[] = self::createForProvider(
                    self::guessProviderFromGatewayClass($paymentMethod->gateway),
                    $paymentMethod
                );
            } catch (\Exception $e) {
                // Логируем ошибку, но не прерываем выполнение
                Log::error("Failed to create gateway for payment method {$paymentMethod->slug}: " . $e->getMessage());
            }
        }

        return $gateways;
    }

    /**
     * Получение шлюза по ID метода платежа
     */
    public static function createById(int $paymentMethodId): AbstractPaymentGateway
    {
        $paymentMethod = PaymentMethod::where('id', $paymentMethodId)->where('is_active', true)->first();

        if (!$paymentMethod) {
            throw new InvalidArgumentException("Active payment method not found with ID: {$paymentMethodId}");
        }

        return self::create($paymentMethod);
    }

    /**
     * Проверка доступности шлюза
     */
    public static function isGatewayAvailable(string $slug): bool
    {
        try {
            self::createBySlug($slug);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Получение списка доступных методов платежа
     */
    public static function getAvailablePaymentMethods(): array
    {
        $paymentMethods = PaymentMethod::active()->ordered()->get();
        $methods = [];

        foreach ($paymentMethods as $paymentMethod) {
            $methods[] = [
                'id' => $paymentMethod->id,
                'name' => $paymentMethod->name,
                'slug' => $paymentMethod->slug,
                'icon' => $paymentMethod->icon_url,
                'description' => $paymentMethod->description,
                'fee_percentage' => $paymentMethod->fee_percentage,
                'fee_fixed' => $paymentMethod->fee_fixed,
                'min_amount' => $paymentMethod->min_amount,
                'max_amount' => $paymentMethod->max_amount,
                'is_available' => self::isGatewayAvailable($paymentMethod->slug),
            ];
        }

        return $methods;
    }

    /**
     * Определяем провайдера по имени класса шлюза.
     */
    public static function guessProviderFromGatewayClass(?string $gatewayClass): string
    {
        return match ($gatewayClass) {
            \App\Services\Payment\TinkoffGateway::class => 'tinkoff',
            \App\Services\Payment\SBPGateway::class => 'sbp',
            \App\Services\Payment\YooKassaGateway::class => 'yookassa',
            default => 'yookassa',
        };
    }

    /**
     * Получаем класс шлюза для указанного провайдера.
     */
    protected static function gatewayClassForProvider(string $provider, PaymentMethod $fallback): string
    {
        $normalized = strtolower($provider);

        return match ($normalized) {
            'yookassa', 'yoomoney' => \App\Services\Payment\YooKassaGateway::class,
            'tinkoff' => \App\Services\Payment\TinkoffGateway::class,
            'sbp' => \App\Services\Payment\SBPGateway::class,
            default => $fallback->gateway ?? \App\Services\Payment\YooKassaGateway::class,
        };
    }
}
