<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationDonationResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'amount' => (float) $this->amount,
      'currency' => $this->currency ?? 'UAH',
      'status' => $this->status,
      'member' => $this->whenLoaded('member', function () {
        return [
          'id' => $this->member->id,
          'name' => $this->member->name,
        ];
      }),
      'transaction' => $this->whenLoaded('paymentTransaction', function () {
        return [
          'id' => $this->paymentTransaction->id,
          'status' => $this->paymentTransaction->status,
          'provider' => $this->paymentTransaction->provider,
        ];
      }),
      'created_at' => optional($this->created_at)->toISOString(),
    ];
  }
}
