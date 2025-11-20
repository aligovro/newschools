<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\DonationStatus;
use App\Support\Money;
use Illuminate\Support\Facades\Cache;
use App\Models\Region;
use App\Models\Locality;
use App\Models\Organization;
use App\Http\Controllers\CitySupportersController;

class Donation extends Model
{
    use HasFactory;

    protected $table = 'donations';

    protected $fillable = [
        'organization_id',
        'region_id',
        'locality_id',
        'fundraiser_id',
        'project_id',
        'project_stage_id',
        'donor_id',
        'referrer_user_id',
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
        'status' => DonationStatus::class,
    ];

    protected $appends = [
        'amount_rubles',
        'formatted_amount',
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

    /**
     * Связь с населенным пунктом (locality).
     */
    public function locality(): BelongsTo
    {
        return $this->belongsTo(Locality::class);
    }

    public function fundraiser(): BelongsTo
    {
        return $this->belongsTo(Fundraiser::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function projectStage(): BelongsTo
    {
        return $this->belongsTo(ProjectStage::class);
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
        return $query->where('status', DonationStatus::Completed);
    }

    public function scopePending($query)
    {
        return $query->where('status', DonationStatus::Pending);
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
        return Money::toRubles($this->amount);
    }

    public function setAmountRublesAttribute($value)
    {
        $this->attributes['amount'] = Money::fromRubles($value);
    }

    public function getFormattedAmountAttribute(): string
    {
        return Money::format($this->amount, $this->currency ?? 'RUB');
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
        return $this->status === DonationStatus::Completed && $this->paid_at !== null;
    }

    public function getIsRefundedAttribute(): bool
    {
        return $this->status === DonationStatus::Refunded && $this->refunded_at !== null;
    }

    public function getReceiptEmailAttribute(): ?string
    {
        return $this->attributes['receipt_email'] ?? $this->donor_email;
    }

    // События модели
    protected static function boot()
    {
        parent::boot();

        // Автозаполнение region_id и locality_id из организации
        static::creating(function ($donation) {
            if ($donation->organization_id) {
                $organization = Organization::find($donation->organization_id);
                if ($organization) {
                    // Заполняем region_id из организации, если не указан
                    if (!$donation->region_id && $organization->region_id) {
                        $donation->region_id = $organization->region_id;
                    }

                    // Заполняем locality_id из организации, если не указан
                    if (!$donation->locality_id && $organization->locality_id) {
                        $donation->locality_id = $organization->locality_id;
                    } elseif (!$donation->locality_id && $donation->region_id) {
                        // Fallback: находим населённый пункт по региону (столицу региона)
                        $donation->locality_id = static::findLocalityByRegion($donation->region_id);
                    }
                }
            }
        });

        static::updating(function ($donation) {
            // Если изменилась организация, обновляем region_id и locality_id
            if ($donation->isDirty('organization_id')) {
                $organization = Organization::find($donation->organization_id);
                if ($organization) {
                    // Обновляем region_id, если не указан
                    if (!$donation->region_id && $organization->region_id) {
                        $donation->region_id = $organization->region_id;
                    }

                    // Обновляем locality_id, если не указан
                    if (!$donation->locality_id && $organization->locality_id) {
                        $donation->locality_id = $organization->locality_id;
                    } elseif (!$donation->locality_id && $donation->region_id) {
                        $donation->locality_id = static::findLocalityByRegion($donation->region_id);
                    }
                }
            }
        });

        static::saved(function ($donation) {
            Cache::forget('alumni_stats_all');

            $affectedOrganizationIds = collect([
                $donation->organization_id,
                $donation->getOriginal('organization_id'),
            ])->filter()->unique();

            foreach ($affectedOrganizationIds as $organizationId) {
                Cache::forget("alumni_stats_org_{$organizationId}");
                // Очищаем кеш city_supporters для организации
                // Используем метод контроллера для очистки
                CitySupportersController::clearCacheForOrganization($organizationId);
            }

            // Очищаем публичный кеш
            CitySupportersController::clearPublicCache();

            $shouldRefreshAggregates = $donation->status === DonationStatus::Completed
                && (
                    $donation->wasRecentlyCreated
                    || $donation->wasChanged('status')
                    || $donation->wasChanged('amount')
                    || $donation->wasChanged('organization_id')
                );

            if ($shouldRefreshAggregates) {
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

                if ($donation->projectStage) {
                    $donation->projectStage->update([
                        'collected_amount' => $donation->projectStage->donations()
                            ->completed()
                            ->sum('amount'),
                    ]);
                }
            }
        });

        static::deleted(function ($donation) {
            Cache::forget('alumni_stats_all');
            if ($donation->organization_id) {
                Cache::forget("alumni_stats_org_{$donation->organization_id}");
                // Очищаем кеш city_supporters для организации
                CitySupportersController::clearCacheForOrganization($donation->organization_id);
            }

            // Очищаем публичный кеш
            CitySupportersController::clearPublicCache();
        });
    }

    /**
     * Найти населённый пункт по региону (столица региона)
     */
    public static function findLocalityByRegion(?int $regionId): ?int
    {
        if (!$regionId) {
            return null;
        }

        $region = Region::find($regionId);
        if (!$region || !$region->capital) {
            return null;
        }

        // Ищем населённый пункт по столице региона
        $locality = Locality::where('region_id', $regionId)
            ->where(function ($query) use ($region) {
                $query->where('name', $region->capital)
                    ->orWhere('name', 'LIKE', $region->capital . '%')
                    ->orWhereRaw('? LIKE CONCAT(name, \'%\')', [$region->capital]);
            })
            ->first();

        return $locality?->id;
    }
}
