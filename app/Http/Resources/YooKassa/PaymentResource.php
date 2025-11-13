<?php

namespace App\Http\Resources\YooKassa;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Support\Money;

class PaymentResource extends JsonResource
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
            'external_id' => $this->external_payment_id,
            'status' => $this->status,
            'amount' => $this->transaction?->amount,
            'amount_rubles' => $this->transaction ? Money::toRubles($this->transaction->amount) : null,
            'formatted_amount' => $this->transaction ? Money::format($this->transaction->amount, $this->transaction->currency ?? 'RUB') : null,
            'currency' => $this->transaction?->currency,
            'merchant' => $this->merchant ? [
                'id' => $this->merchant->id,
                'status' => $this->merchant->status,
                'organization' => [
                    'id' => $this->merchant->organization->id,
                    'name' => $this->merchant->organization->name,
                ],
            ] : null,
            'transaction' => $this->transaction ? [
                'id' => $this->transaction->id,
                'transaction_id' => $this->transaction->transaction_id,
                'status' => $this->transaction->status,
                'paid_at' => $this->transaction->paid_at?->toIso8601String(),
            ] : null,
            'payload' => $request->boolean('include_payload') ? $this->payload : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
