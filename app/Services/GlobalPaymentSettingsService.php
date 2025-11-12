<?php

namespace App\Services;

use App\Models\GlobalPaymentSettings;
use App\Services\Payment\PaymentSettingsNormalizer;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class GlobalPaymentSettingsService
{
    public function __construct(
        private readonly PaymentSettingsNormalizer $paymentSettingsNormalizer,
    ) {
    }

    public function getModel(): GlobalPaymentSettings
    {
        return Cache::remember('global_payment_settings:instance', 3600, function () {
            return GlobalPaymentSettings::instance();
        });
    }

    public function getSettings(): array
    {
        $model = $this->getModel();

        return is_array($model->settings) ? $model->settings : [];
    }

    public function getNormalizedSettings(): array
    {
        $settings = $this->getSettings();

        if (!is_array($settings)) {
            $settings = [];
        }

        return $this->paymentSettingsNormalizer->normalize($settings);
    }

    public function update(array $settings): GlobalPaymentSettings
    {
        $normalized = $this->paymentSettingsNormalizer->normalize($settings);

        $model = GlobalPaymentSettings::instance();
        $model->settings = $normalized;
        $model->save();

        Cache::forget('global_payment_settings:instance');

        return $model;
    }
}

