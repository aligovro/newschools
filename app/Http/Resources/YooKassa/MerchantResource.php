<?php

namespace App\Http\Resources\YooKassa;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    $credentials = $this->credentials ?? [];
    $settings = $this->settings ?? [];
    $isOAuthAuthorized = !empty($credentials['access_token']) &&
      (!empty($credentials['oauth_authorized_at']) || ($settings['oauth_authorized'] ?? false));

    return [
      'id' => $this->id,
      'organization' => $this->organization ? [
        'id' => $this->organization->id,
        'name' => $this->organization->name,
      ] : null,
      'status' => $this->status,
      'external_id' => $this->external_id,
      'onboarding_id' => $this->onboarding_id,
      'contract_id' => $this->contract_id,
      'payout_account_id' => $this->payout_account_id,
      'payout_status' => $this->payout_status,
      'credentials' => $this->when($request->user()?->can('payments.manage'), $this->credentials),
      'settings' => $this->settings,
      'documents' => $this->documents,
      'activated_at' => $this->activated_at?->toIso8601String(),
      'last_synced_at' => $this->last_synced_at?->toIso8601String(),
      'created_at' => $this->created_at?->toIso8601String(),
      'updated_at' => $this->updated_at?->toIso8601String(),
      'oauth' => [
        'authorized' => $isOAuthAuthorized,
        'authorized_at' => $credentials['oauth_authorized_at'] ?? $settings['oauth_authorized_at'] ?? null,
      ],
    ];
  }
}
