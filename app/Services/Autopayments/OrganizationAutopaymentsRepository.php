<?php

namespace App\Services\Autopayments;

use App\Models\Organization;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Репозиторий для чтения данных по автоплатежам организации.
 * Только выборка "сырых" данных из БД, без форматирования.
 * Для мигрированных организаций (is_legacy_migrated) использует organization_autopayments.
 */
class OrganizationAutopaymentsRepository
{
    /**
     * Для мигрированных организаций: список из organization_autopayments.
     *
     * @return array{keys: Collection, total: int, legacy_index: array<string, object>}
     */
    public function getLegacyAutopaymentsPaginated(
        int $organizationId,
        int $page,
        int $perPage,
        array $filters = []
    ): array {
        if (!Schema::hasTable('organization_autopayments')) {
            return ['keys' => collect(), 'total' => 0, 'legacy_index' => []];
        }

        $query = DB::table('organization_autopayments')
            ->where('organization_id', $organizationId);

        if (!empty($filters['recurring_period'])) {
            $query->where('recurring_period', $filters['recurring_period']);
        }

        $total = $query->count();
        $rows = (clone $query)
            ->orderBy('subscription_key')
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->get();

        $keys = $rows->pluck('subscription_key');
        $legacyIndex = [];
        foreach ($rows as $r) {
            $legacyIndex[$r->subscription_key] = $r;
        }

        return [
            'keys' => $keys,
            'total' => $total,
            'legacy_index' => $legacyIndex,
        ];
    }

    /**
     * Получить список ключей подписок с пагинацией (из payment_transactions).
     *
     * @return array{keys: Collection, total: int, legacy_index: array<string, object>|null}
     */
    public function getSubscriptionKeysPaginated(
        int $organizationId,
        int $page,
        int $perPage,
        array $filters = []
    ): array {
        $baseQuery = DB::table('payment_transactions')
            ->where('organization_id', $organizationId)
            ->where('status', 'completed')
            ->where(function ($query) {
                $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = 1")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.is_recurring') = true")
                    ->orWhereRaw("JSON_EXTRACT(payment_details, '$.recurring_period') IS NOT NULL");
            })
            ->whereNotNull(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id'))"))
            ->where(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id'))"), '!=', '');

        // Фильтр по периоду подписки (если нужен)
        if (!empty($filters['recurring_period'])) {
            $baseQuery->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.recurring_period')) = ?", [
                $filters['recurring_period']
            ]);
        }

        // Подсчет уникальных ключей
        $keyExpression = RecurringSubscriptionQuery::subscriptionKeyExpression();
        $total = (clone $baseQuery)
            ->selectRaw("{$keyExpression} as subscription_key")
            ->groupByRaw("{$keyExpression}")
            ->get()
            ->count();

        // Получение ключей с пагинацией
        $keys = $baseQuery
            ->selectRaw("{$keyExpression} as subscription_key")
            ->groupByRaw("{$keyExpression}")
            ->orderByRaw("{$keyExpression}")
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->pluck('subscription_key');

        return [
            'keys' => $keys,
            'total' => $total,
            'legacy_index' => null,
        ];
    }

    /**
     * Получить транзакции и связанные донаты по списку ключей подписок.
     *
     * @param array<string> $subscriptionKeys
     * @param array<string, object>|null $legacyIndex Для мигрированных: legacy_autopayment по ключу (для автоплатежей без платежей)
     * @return Collection<int, object{subscription_key: string, transaction: object, donations: Collection, legacy_autopayment: object|null}>
     */
    public function getTransactionsAndDonationsByKeys(
        int $organizationId,
        array $subscriptionKeys,
        ?array $legacyIndex = null
    ): Collection {
        if (empty($subscriptionKeys)) {
            return collect();
        }

        $placeholders = implode(',', array_fill(0, count($subscriptionKeys), '?'));
        $transactions = DB::table('payment_transactions as pt')
            ->leftJoin('donations as d', 'pt.id', '=', 'd.payment_transaction_id')
            ->where('pt.organization_id', $organizationId)
            ->where('pt.status', 'completed')
            ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(pt.payment_details, '$.saved_payment_method_id')) IN ({$placeholders})", $subscriptionKeys)
            ->select([
                'pt.id as transaction_id',
                'pt.amount as transaction_amount',
                'pt.currency',
                'pt.payment_method_slug',
                'pt.payment_details',
                'pt.paid_at',
                'pt.created_at as transaction_created_at',
                'd.id as donation_id',
                'd.donor_name',
                'd.is_anonymous',
                'd.amount as donation_amount',
                'd.paid_at as donation_paid_at',
                'd.created_at as donation_created_at',
            ])
            ->orderBy('pt.created_at')
            ->get();

        $grouped = collect();
        foreach ($subscriptionKeys as $key) {
            $keyTransactions = $transactions->filter(function ($row) use ($key) {
                $details = json_decode($row->payment_details ?? '{}', true);
                $rowKey = $details['saved_payment_method_id'] ?? null;
                return $rowKey === $key;
            });

            $legacyAp = $legacyIndex[$key] ?? null;

            if ($keyTransactions->isEmpty()) {
                // Автоплатеж без платежей — только для legacy (все 135)
                if ($legacyAp !== null) {
                    $grouped->push((object) [
                        'subscription_key' => $key,
                        'transaction' => (object) [
                            'id' => null,
                            'amount' => $legacyAp->amount ?? 0,
                            'currency' => 'RUB',
                            'payment_method_slug' => $legacyAp->payment_method_slug ?? 'yookassa',
                            'payment_details' => [
                                'recurring_period' => $legacyAp->recurring_period ?? 'monthly',
                            ],
                            'paid_at' => $legacyAp->first_payment_at,
                            'created_at' => $legacyAp->created_at ?? null,
                        ],
                        'donations' => collect(),
                        'legacy_autopayment' => $legacyAp,
                    ]);
                }
                continue;
            }

            $firstTransaction = $keyTransactions->first();
            $donations = $keyTransactions
                ->whereNotNull('donation_id')
                ->map(function ($row) {
                    return (object) [
                        'id' => $row->donation_id,
                        'donor_name' => $row->donor_name,
                        'is_anonymous' => $row->is_anonymous,
                        'amount' => $row->donation_amount ?? $row->transaction_amount,
                        'paid_at' => $row->donation_paid_at ?? $row->paid_at,
                        'created_at' => $row->donation_created_at ?? $row->transaction_created_at,
                    ];
                })
                ->sortByDesc('paid_at')
                ->values();

            $grouped->push((object) [
                'subscription_key' => $key,
                'transaction' => (object) [
                    'id' => $firstTransaction->transaction_id,
                    'amount' => $firstTransaction->transaction_amount,
                    'currency' => $firstTransaction->currency,
                    'payment_method_slug' => $firstTransaction->payment_method_slug,
                    'payment_details' => json_decode($firstTransaction->payment_details ?? '{}', true),
                    'paid_at' => $firstTransaction->paid_at,
                    'created_at' => $firstTransaction->transaction_created_at,
                ],
                'donations' => $donations,
                'legacy_autopayment' => $legacyAp,
            ]);
        }

        return $grouped;
    }
}
