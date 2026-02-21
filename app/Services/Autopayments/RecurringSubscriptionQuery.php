<?php

namespace App\Services\Autopayments;

use App\Models\Organization;
use App\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Единая точка правды для определения recurring-транзакций и ключа подписки.
 * Используется в списке автоплатежей, счётчике подписок и при необходимости в кроне.
 */
class RecurringSubscriptionQuery
{
    /**
     * Получить базовый query для recurring-транзакций организации.
     * Транзакции должны быть completed и иметь признак recurring (is_recurring или recurring_period).
     */
    public static function forOrganization(Organization $organization): Builder
    {
        return PaymentTransaction::query()
            ->where('organization_id', $organization->id)
            ->where('status', PaymentTransaction::STATUS_COMPLETED)
            ->where(function ($query) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = true")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->whereNotNull(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id'))"))
            ->where(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id'))"), '!=', '');
    }

    /**
     * Получить SQL-выражение для ключа подписки (только saved_payment_method_id).
     *
     * @param string|null $tableAlias Префикс таблицы (например, 'pt') для запросов с JOIN, чтобы избежать неоднозначности колонки payment_details
     */
    public static function subscriptionKeyExpression(?string $tableAlias = null): string
    {
        $col = $tableAlias !== null && $tableAlias !== '' ? $tableAlias . '.payment_details' : 'payment_details';
        return "JSON_UNQUOTE(JSON_EXTRACT({$col}, '$.saved_payment_method_id'))";
    }

    /**
     * Подсчитать количество уникальных подписок для организации.
     * Используется в виджете для отображения счётчика подписчиков.
     */
    public static function countUniqueSubscriptions(Organization $organization): int
    {
        $keyExpr = static::subscriptionKeyExpression();
        return (int) static::forOrganization($organization)
            ->getQuery()
            ->selectRaw("COUNT(DISTINCT {$keyExpr}) as cnt")
            ->value('cnt');
    }
}
