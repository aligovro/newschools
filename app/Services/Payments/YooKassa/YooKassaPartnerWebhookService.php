<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Payments\YooKassaPartnerEvent;
use App\Models\Payments\YooKassaPartnerMerchant;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class YooKassaPartnerWebhookService
{
    public function __construct(
        protected YooKassaPartnerMerchantService $merchantService,
        protected YooKassaPartnerPaymentService $paymentService,
    ) {
    }

    public function registerEvent(array $payload): YooKassaPartnerEvent
    {
        return YooKassaPartnerEvent::create([
            'event_type' => Arr::get($payload, 'event_type', 'unknown'),
            'object_id' => Arr::get($payload, 'object.id'),
            'object_type' => Arr::get($payload, 'object.type'),
            'payload' => $payload,
        ]);
    }

    public function handle(YooKassaPartnerEvent $event): void
    {
        if ($event->processing_status === YooKassaPartnerEvent::STATUS_PROCESSED) {
            return;
        }

        $event->update(['processing_status' => YooKassaPartnerEvent::STATUS_PROCESSING]);

        DB::beginTransaction();
        try {
            $objectType = $event->object_type;
            $payload = $event->payload ?? [];

            if ($objectType === 'merchant') {
                $this->handleMerchantEvent($payload);
            } elseif ($objectType === 'payment') {
                $this->handlePaymentEvent($payload);
            }

            $event->update([
                'processing_status' => YooKassaPartnerEvent::STATUS_PROCESSED,
                'processed_at' => now(),
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('YooKassa partner webhook processing failed', [
                'event_id' => $event->id,
                'error' => $e->getMessage(),
            ]);

            $event->update([
                'processing_status' => YooKassaPartnerEvent::STATUS_FAILED,
                'processing_error' => $e->getMessage(),
            ]);
        }
    }

    protected function handleMerchantEvent(array $payload): void
    {
        $externalId = Arr::get($payload, 'id');
        if (!$externalId) {
            return;
        }

        $merchant = YooKassaPartnerMerchant::where('external_id', $externalId)->first();

        if (!$merchant) {
            Log::warning('YooKassa merchant event received for unknown merchant', ['external_id' => $externalId]);
            return;
        }

        $merchant->update([
            'status' => Arr::get($payload, 'status', $merchant->status),
            'documents' => Arr::get($payload, 'documents', $merchant->documents),
            'payout_status' => Arr::get($payload, 'payout_account.status', $merchant->payout_status),
            'contract_id' => Arr::get($payload, 'contract_id', $merchant->contract_id),
            'activated_at' => Arr::get($payload, 'status') === YooKassaPartnerMerchant::STATUS_ACTIVE
                ? now()
                : $merchant->activated_at,
            'last_synced_at' => now(),
        ]);
    }

    protected function handlePaymentEvent(array $payload): void
    {
        $externalId = Arr::get($payload, 'merchant.id');
        if (!$externalId) {
            return;
        }

        $merchant = YooKassaPartnerMerchant::where('external_id', $externalId)->first();
        if (!$merchant) {
            Log::warning('YooKassa payment event for unknown merchant', ['external_id' => $externalId]);
            return;
        }

        $this->paymentService->storePayment($merchant, $payload);
    }
}

