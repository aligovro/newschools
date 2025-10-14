<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Donation extends Model
{
    use HasFactory;

    protected $table = 'donations';

    protected $fillable = [
        'organization_id',
        'region_id',
        'fundraiser_id',
        'project_id',
        'donor_id',
        'payment_transaction_id',
        'amount',
        'currency',
        'status',
        'payment_method',
        'payment_id',
        'transaction_id',
        'is_anonymous',
        'donor_name',
        'donor_email',
        'donor_phone',
        'donor_message',
        'send_receipt',
        'receipt_email',
        'payment_details',
        'webhook_data',
        'paid_at',
        'refunded_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'is_anonymous' => 'boolean',
        'send_receipt' => 'boolean',
        'payment_details' => 'array',
        'webhook_data' => 'array',
        'paid_at' => 'datetime',
        'refunded_at' => 'datetime',
    ];

    // Связи
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function fundraiser(): BelongsTo
    {
        return $this->belongsTo(Fundraiser::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(OrganizationProject::class);
    }

    public function donor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    public function paymentTransaction(): BelongsTo
    {
        return $this->belongsTo(PaymentTransaction::class);
    }

    // Скоупы
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeByOrganization($query, $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeByProject($query, $projectId)
    {
        return $query->where('project_id', $projectId);
    }

    public function scopeByFundraiser($query, $fundraiserId)
    {
        return $query->where('fundraiser_id', $fundraiserId);
    }

    public function scopeAnonymous($query)
    {
        return $query->where('is_anonymous', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_anonymous', false);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Методы для работы с копейками
    public function getAmountRublesAttribute(): float
    {
        return $this->amount / 100;
    }

    public function setAmountRublesAttribute($value)
    {
        $this->attributes['amount'] = $value * 100;
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount_rubles, 0, '.', ' ') . ' ' . $this->currency;
    }

    public function getDonorDisplayNameAttribute(): string
    {
        if ($this->is_anonymous) {
            return 'Анонимный донор';
        }

        return $this->donor_name ?? ($this->donor ? $this->donor->name : 'Неизвестный донор');
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->status === 'completed' && $this->paid_at !== null;
    }

    public function getIsRefundedAttribute(): bool
    {
        return $this->status === 'refunded' && $this->refunded_at !== null;
    }

    public function getReceiptEmailAttribute(): ?string
    {
        return $this->attributes['receipt_email'] ?? $this->donor_email;
    }

    // События модели
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($donation) {
            if ($donation->wasChanged('status') && $donation->status === 'completed') {
                // Обновляем собранную сумму в проекте/сборе
                if ($donation->project) {
                    $donation->project->update([
                        'collected_amount' => $donation->project->donations()
                            ->completed()
                            ->sum('amount'),
                        'donations_count' => $donation->project->donations()
                            ->completed()
                            ->count(),
                    ]);
                }

                if ($donation->fundraiser) {
                    $donation->fundraiser->update([
                        'collected_amount' => $donation->fundraiser->donations()
                            ->completed()
                            ->sum('amount'),
                    ]);
                }
            }
        });
    }
}
