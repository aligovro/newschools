<?php

namespace App\Models\Payments;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class YooKassaPartnerMerchant extends Model
{
  use HasFactory;

  protected $table = 'yookassa_partner_merchants';

  protected $fillable = [
    'organization_id',
    'status',
    'external_id',
    'onboarding_id',
    'contract_id',
    'payout_account_id',
    'payout_status',
    'credentials',
    'settings',
    'documents',
    'activated_at',
    'last_synced_at',
  ];

  protected $casts = [
    'credentials' => 'array',
    'settings' => 'array',
    'documents' => 'array',
    'activated_at' => 'datetime',
    'last_synced_at' => 'datetime',
  ];

  public const STATUS_DRAFT = 'draft';
  public const STATUS_PENDING = 'pending';
  public const STATUS_ACTIVE = 'active';
  public const STATUS_REJECTED = 'rejected';
  public const STATUS_BLOCKED = 'blocked';

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function paymentDetails(): HasMany
  {
    return $this->hasMany(YooKassaPartnerPaymentDetail::class, 'yookassa_partner_merchant_id');
  }

  public function payouts(): HasMany
  {
    return $this->hasMany(YooKassaPartnerPayout::class, 'yookassa_partner_merchant_id');
  }

  public function scopeActive($query)
  {
    return $query->where('status', self::STATUS_ACTIVE);
  }
}
