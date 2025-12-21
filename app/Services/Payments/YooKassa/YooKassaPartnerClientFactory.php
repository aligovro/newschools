<?php

namespace App\Services\Payments\YooKassa;

use App\Models\Organization;
use App\Services\GlobalPaymentSettingsService;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Arr;

class YooKassaPartnerClientFactory
{
    public function __construct(
        protected HttpFactory $http
  ) {}

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
            $globalSettings = app(GlobalPaymentSettingsService::class)->getNormalizedSettings();
            $credentials = Arr::get($globalSettings, 'credentials.yookassa_partner');
        }

    // Если есть OAuth токен, используем его
    $accessToken = Arr::get($credentials, 'access_token');
    $accountId = Arr::get($credentials, 'account_id') ?? $merchant?->external_id;

        return [
      'base_url' => Arr::get($credentials, 'base_url', config('services.yookassa_partner.base_url', 'https://api.yookassa.ru')),
            'client_id' => Arr::get($credentials, 'client_id', config('services.yookassa_partner.client_id')),
            'secret_key' => Arr::get($credentials, 'secret_key', config('services.yookassa_partner.secret_key')),
      'access_token' => $accessToken,
      'account_id' => $accountId,
        ];
    }
}
