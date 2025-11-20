<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuggestedOrganization extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    /**
     * @var array<int, string>
     */
    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
    ];

    /**
     * @var array<int, string>
     */
    public const SORTABLE_FIELDS = [
        'name',
        'created_at',
        'updated_at',
        'status',
    ];

    protected $fillable = [
        'name',
        'city_name',
        'city_id',
        'address',
        'latitude',
        'longitude',
        'status',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'reviewed_at' => 'datetime',
    ];

    /**
     * Связь с городом
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    /**
     * Связь с пользователем, который рассмотрел заявку
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Scope для получения ожидающих рассмотрения
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope для получения одобренных
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope для получения отклоненных
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Связь с просмотрами
     */
    public function views(): HasMany
    {
        return $this->hasMany(ViewedSuggestedOrganization::class);
    }

    /**
     * Проверка, просмотрено ли предложение пользователем
     */
    public function isViewedBy(?User $user): bool
    {
        if (!$user) {
            return false;
        }

        return $this->views()
            ->where('user_id', $user->id)
            ->exists();
    }
}
