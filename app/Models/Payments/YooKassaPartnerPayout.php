<?php

namespace App\Models\Payments;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YooKassaPartnerPayout extends Model
{
    use HasFactory;

    protected $table = 'yookassa_partner_payouts';

    protected $fillable = [
        'yookassa_partner_merchant_id',
        'external_payout_id',
        'status',
        'amount',
        'currency',
        'scheduled_at',
        'processed_at',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'scheduled_at' => 'datetime',
        'processed_at' => 'datetime',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(YooKassaPartnerMerchant::class, 'yookassa_partner_merchant_id');
    }
}

