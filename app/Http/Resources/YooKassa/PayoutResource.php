<?php

namespace App\Http\Resources\YooKassa;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Money;

class PayoutResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'external_id' => $this->external_payout_id,
            'status' => $this->status,
            'amount' => $this->amount,
            'amount_rubles' => Money::toRubles($this->amount),
            'formatted_amount' => Money::format($this->amount, $this->currency ?? 'RUB'),
            'currency' => $this->currency,
            'merchant' => [
                'id' => $this->merchant->id,
                'status' => $this->merchant->status,
                'organization' => [
                    'id' => $this->merchant->organization->id,
                    'name' => $this->merchant->organization->name,
                ],
            ],
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'processed_at' => $this->processed_at?->toIso8601String(),
            'payload' => $request->boolean('include_payload') ? $this->payload : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
