<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Organization;
use App\Models\Payments\YooKassaPartnerMerchant;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class YooKassaPartnerMerchantService
{
    public function __construct(
        protected YooKassaPartnerClientFactory $clientFactory
    ) {}

    public function createDraft(Organization $organization, array $payload = []): YooKassaPartnerMerchant
    {
        return DB::transaction(function () use ($organization, $payload) {
            $merchant = $organization->yookassaPartnerMerchant()->firstOrNew([]);

            $merchant->fill([
                'status' => YooKassaPartnerMerchant::STATUS_DRAFT,
                'settings' => array_merge($merchant->settings ?? [], Arr::get($payload, 'settings', [])),
            ]);
            $merchant->save();

            $organization->update(['yookassa_partner_merchant_id' => $merchant->id]);

            return $merchant;
        });
    }

    public function submitOnboarding(YooKassaPartnerMerchant $merchant, array $data): YooKassaPartnerMerchant
    {
        $client = $this->clientFactory->forOrganization($merchant->organization);

        $response = $client->createMerchant($data);

        $merchant->update([
            'status' => Arr::get($response, 'status', YooKassaPartnerMerchant::STATUS_PENDING),
            'external_id' => Arr::get($response, 'id'),
            'onboarding_id' => Arr::get($response, 'onboarding_id'),
            'credentials' => $this->mergeCredentials($merchant->credentials, Arr::get($response, 'credentials', [])),
            'documents' => Arr::get($response, 'documents'),
            'last_synced_at' => now(),
        ]);

        return $merchant;
    }

    public function sync(YooKassaPartnerMerchant $merchant): YooKassaPartnerMerchant
    {
        if (!$merchant->external_id) {
            throw new RuntimeException('Merchant does not have external_id. Submit onboarding first.');
        }

        $client = $this->clientFactory->forOrganization($merchant->organization);
        $response = $client->getMerchant($merchant->external_id);

        $merchant->update([
            'status' => Arr::get($response, 'status', $merchant->status),
            'contract_id' => Arr::get($response, 'contract_id', $merchant->contract_id),
            'payout_account_id' => Arr::get($response, 'payout_account.id', $merchant->payout_account_id),
            'payout_status' => Arr::get($response, 'payout_account.status', $merchant->payout_status),
            'credentials' => $this->mergeCredentials($merchant->credentials, Arr::get($response, 'credentials', [])),
            'documents' => Arr::get($response, 'documents', $merchant->documents),
            'activated_at' => Arr::get($response, 'activated_at') ? now() : $merchant->activated_at,
            'last_synced_at' => now(),
        ]);

        return $merchant;
    }

    public function deactivate(YooKassaPartnerMerchant $merchant, string $reason = null): YooKassaPartnerMerchant
    {
        $merchant->update([
            'status' => YooKassaPartnerMerchant::STATUS_BLOCKED,
            'settings' => array_merge($merchant->settings ?? [], ['blocked_reason' => $reason]),
        ]);

        Log::warning('YooKassa partner merchant deactivated', [
            'merchant_id' => $merchant->id,
            'reason' => $reason,
        ]);

        return $merchant;
    }

    protected function mergeCredentials(?array $existing, array $incoming): array
    {
        $existing = $existing ?? [];

        if (!$incoming) {
            return $existing;
        }

        return array_merge($existing, array_filter($incoming));
    }
}
