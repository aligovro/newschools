<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentTransactionResource extends JsonResource
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
            'transaction_id' => $this->transaction_id,
            'external_id' => $this->external_id,
            'status' => $this->status,
            'amount' => $this->amount,
            'amount_rubles' => $this->amount_rubles,
            'formatted_amount' => $this->formatted_amount,
            'currency' => $this->currency,
            'payment_method' => $this->whenLoaded('paymentMethod', function () {
                return [
                    'id' => $this->paymentMethod->id,
                    'name' => $this->paymentMethod->name,
                    'slug' => $this->payment_method_slug,
                ];
            }, [
                'slug' => $this->payment_method_slug,
            ]),
            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                ];
            }),
            'fundraiser' => $this->whenLoaded('fundraiser', function () {
                return [
                    'id' => $this->fundraiser->id,
                    'title' => $this->fundraiser->title,
                ];
            }),
            'project' => $this->whenLoaded('project', function () {
                return [
                    'id' => $this->project->id,
                    'title' => $this->project->title,
                ];
            }),
            'description' => $this->description,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'failed_at' => $this->failed_at?->toIso8601String(),
            'refunded_at' => $this->refunded_at?->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'is_expired' => $this->isExpired(),
            'masked_payment_details' => $this->masked_payment_details,
            'logs' => $this->whenLoaded('logs', fn () => $this->logs->map(function ($log) {
                return [
                    'action' => $log->action,
                    'level' => $log->level,
                    'message' => $log->message,
                    'context' => $log->context,
                    'created_at' => $log->created_at?->toIso8601String(),
                ];
            })),
        ];
    }
}


