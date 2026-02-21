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
    $donorName = $this->donor_name ?? ($this->donor?->name ?? null);
    return [
      'id' => $this->id,
      'amount' => (int) $this->amount,
      'amount_rubles' => (float) ($this->amount / 100),
      'currency' => $this->currency ?? 'RUB',
      'status' => $this->status,
      'donor_name' => $donorName,
      'donor_phone' => $this->donor_phone,
      'member' => $this->whenLoaded('donor', fn () => [
        'id' => $this->donor->id,
        'name' => $this->donor->name ?? $donorName,
      ]),
      'transaction' => $this->whenLoaded('paymentTransaction', function () {
        return [
          'id' => $this->paymentTransaction->id,
          'status' => $this->paymentTransaction->status,
          'provider' => $this->paymentTransaction->payment_provider ?? null,
          'transaction_id' => $this->paymentTransaction->transaction_id ?? null,
        ];
      }),
      'paid_at' => optional($this->paid_at)->toISOString(),
      'created_at' => optional($this->created_at)->toISOString(),
    ];
  }
}
