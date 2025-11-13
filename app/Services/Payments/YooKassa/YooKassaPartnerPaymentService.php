<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\Payments\YooKassaPartnerPaymentDetail;
use App\Models\PaymentTransaction;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class YooKassaPartnerPaymentService
{
    public function __construct(
        protected YooKassaPartnerClientFactory $clientFactory
    ) {
    }

    public function syncMerchantPayments(YooKassaPartnerMerchant $merchant, array $params = []): void
    {
        if (!$merchant->external_id) {
            return;
        }

        $client = $this->clientFactory->forOrganization($merchant->organization);
        $response = $client->listPayments(array_merge([
            'merchant_id' => $merchant->external_id,
            'limit' => 50,
        ], $params));

        $items = Arr::get($response, 'items', []);

        foreach ($items as $item) {
            $this->storePayment($merchant, $item);
        }
    }

    public function storePayment(YooKassaPartnerMerchant $merchant, array $payload): YooKassaPartnerPaymentDetail
    {
        return DB::transaction(function () use ($merchant, $payload) {
            $externalId = Arr::get($payload, 'id');

            $detail = YooKassaPartnerPaymentDetail::firstOrNew([
                'external_payment_id' => $externalId,
            ]);

            $transaction = $detail->transaction ?: PaymentTransaction::firstOrCreate(
                [
                    'transaction_id' => Arr::get($payload, 'metadata.transaction_id', uniqid('txn_', true)),
                ],
                [
                    'organization_id' => $merchant->organization_id,
                    'amount' => (int) round((float) Arr::get($payload, 'amount.value', 0) * 100),
                    'currency' => Arr::get($payload, 'amount.currency', 'RUB'),
                    'status' => $this->mapStatus(Arr::get($payload, 'status')),
                    'payment_method_slug' => Arr::get($payload, 'payment_method.type', 'bankcard'),
                    'payment_provider' => 'yookassa',
                ]
            );

            $transaction->update([
                'status' => $this->mapStatus(Arr::get($payload, 'status')),
                'external_id' => $externalId,
                'gateway_response' => $payload,
                'paid_at' => Arr::get($payload, 'status') === 'succeeded' ? now() : $transaction->paid_at,
            ]);

            $detail->fill([
                'payment_transaction_id' => $transaction->id,
                'yookassa_partner_merchant_id' => $merchant->id,
                'status' => Arr::get($payload, 'status'),
                'payload' => $payload,
            ]);

            $detail->save();

            return $detail;
        });
    }

    protected function mapStatus(?string $status): string
    {
        return match ($status) {
            'succeeded' => PaymentTransaction::STATUS_COMPLETED,
            'canceled' => PaymentTransaction::STATUS_CANCELLED,
            'waiting_for_capture', 'pending' => PaymentTransaction::STATUS_PENDING,
            default => PaymentTransaction::STATUS_PENDING,
        };
    }
}

