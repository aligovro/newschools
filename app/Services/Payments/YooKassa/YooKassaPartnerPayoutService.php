<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Payments\YooKassaPartnerMerchant;
use App\Models\Payments\YooKassaPartnerPayout;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class YooKassaPartnerPayoutService
{
    public function __construct(
        protected YooKassaPartnerClientFactory $clientFactory
    ) {
    }

    public function syncMerchantPayouts(YooKassaPartnerMerchant $merchant, array $params = []): void
    {
        if (!$merchant->external_id) {
            return;
        }

        $client = $this->clientFactory->forOrganization($merchant->organization);
        $response = $client->listPayouts(array_merge([
            'merchant_id' => $merchant->external_id,
            'limit' => 50,
        ], $params));

        foreach (Arr::get($response, 'items', []) as $item) {
            $this->storePayout($merchant, $item);
        }
    }

    public function storePayout(YooKassaPartnerMerchant $merchant, array $payload): YooKassaPartnerPayout
    {
        return DB::transaction(function () use ($merchant, $payload) {
            $payout = YooKassaPartnerPayout::firstOrNew([
                'external_payout_id' => Arr::get($payload, 'id'),
            ]);

            $payout->fill([
                'yookassa_partner_merchant_id' => $merchant->id,
                'status' => Arr::get($payload, 'status'),
                'amount' => (int) round((float) Arr::get($payload, 'amount.value', 0) * 100),
                'currency' => Arr::get($payload, 'amount.currency', 'RUB'),
                'scheduled_at' => Arr::get($payload, 'scheduled_at'),
                'processed_at' => Arr::get($payload, 'processed_at'),
                'payload' => $payload,
            ]);

            $payout->save();

            return $payout;
        });
    }
}

