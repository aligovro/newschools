<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Organization;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Arr;

class YooKassaPartnerClientFactory
{
    public function __construct(
        protected HttpFactory $http
    ) {
    }

    public function forOrganization(Organization $organization): YooKassaPartnerClient
    {
        $settings = $this->resolveSettings($organization);

        return new YooKassaPartnerClient($this->http, $settings);
    }

    public function forSettings(array $settings): YooKassaPartnerClient
    {
        return new YooKassaPartnerClient($this->http, $settings);
    }

    protected function resolveSettings(Organization $organization): array
    {
        $merchant = $organization->yookassaPartnerMerchant;
        $credentials = $merchant?->credentials;

        if (!$credentials) {
            $orgSettings = $organization->settings?->payment_settings ?? [];
            $credentials = Arr::get($orgSettings, 'credentials.yookassa_partner');
        }

        if (!$credentials) {
            $globalSettings = app(\App\Services\GlobalPaymentSettingsService::class)->getNormalizedSettings();
            $credentials = Arr::get($globalSettings, 'credentials.yookassa_partner');
        }

        return [
            'base_url' => Arr::get($credentials, 'base_url', config('services.yookassa_partner.base_url')),
            'client_id' => Arr::get($credentials, 'client_id', config('services.yookassa_partner.client_id')),
            'secret_key' => Arr::get($credentials, 'secret_key', config('services.yookassa_partner.secret_key')),
            'account_id' => Arr::get($credentials, 'account_id'),
        ];
    }
}

