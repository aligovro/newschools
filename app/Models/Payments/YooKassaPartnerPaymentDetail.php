<?php

namespace App\Models\Payments;

use App\Models\PaymentTransaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class YooKassaPartnerPaymentDetail extends Model
{
    use HasFactory;

    protected $table = 'yookassa_partner_payment_details';

    protected $fillable = [
        'payment_transaction_id',
        'yookassa_partner_merchant_id',
        'external_payment_id',
        'status',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
    ];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class, 'payment_transaction_id');
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(YooKassaPartnerMerchant::class, 'yookassa_partner_merchant_id');
    }
}

