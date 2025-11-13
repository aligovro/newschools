<?php

namespace App\Http\Controllers\Dashboard\YooKassa;

use App\Http\Controllers\Controller;
use App\Http\Requests\YooKassa\UpdateSettingsRequest;
use App\Http\Resources\YooKassa\SettingsResource;
use App\Services\GlobalPaymentSettingsService;

class SettingsController extends Controller
{
    public function __construct(
        protected GlobalPaymentSettingsService $settingsService
    ) {
        $this->middleware(['auth', 'verified']);
    }

    public function show()
    {
        $settings = $this->settingsService->getNormalizedSettings();

        return SettingsResource::make([
            'credentials' => $settings['credentials']['yookassa_partner'] ?? [],
            'options' => $settings['options']['yookassa_partner'] ?? [],
            'webhook' => $settings['webhook']['yookassa_partner'] ?? [],
        ]);
    }

    public function update(UpdateSettingsRequest $request)
    {
        $settings = $this->settingsService->getNormalizedSettings();

        $payload = $settings;
        $payload['credentials']['yookassa_partner'] = $request->validated()['credentials'];
        $payload['options']['yookassa_partner'] = $request->validated()['options'] ?? [];
        $payload['webhook']['yookassa_partner'] = $request->validated()['webhook'] ?? [];

        $this->settingsService->update($payload);

        return SettingsResource::make([
            'credentials' => $payload['credentials']['yookassa_partner'],
            'options' => $payload['options']['yookassa_partner'],
            'webhook' => $payload['webhook']['yookassa_partner'],
        ]);
    }
}

