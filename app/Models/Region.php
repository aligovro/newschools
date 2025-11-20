<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use HasFactory;

    protected $table = 'regions';

    protected $fillable = [
        'federal_district_id',
        'name',
        'slug',
        'code',
        'capital',
        'latitude',
        'longitude',
        'population',
        'area',
        'timezone',
        'type',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'population' => 'integer',
        'area' => 'integer',
        'is_active' => 'boolean',
    ];

    // Связи
    public function federalDistrict(): BelongsTo
    {
        return $this->belongsTo(FederalDistrict::class);
    }

    public function localities(): HasMany
    {
        return $this->hasMany(Locality::class);
    }

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class);
    }

    public function donations(): HasMany
    {
        return $this->hasMany(Donation::class);
    }

    /**
     * Получить пожертвования для конкретной организации
     */
    public function donationsForOrganization($organizationId)
    {
        return $this->donations()
            ->where('organization_id', $organizationId)
            ->where('status', 'completed');
    }

    /**
     * Получить статистику пожертвований для региона
     */
    public function getDonationStats($organizationId)
    {
        $donations = $this->donationsForOrganization($organizationId);

        return [
            'total_amount' => $donations->sum('amount'),
            'donation_count' => $donations->count(),
            'average_amount' => $donations->avg('amount'),
            'last_donation' => $donations->latest()->first(),
        ];
    }

    /**
     * Получить изменения за период
     */
    public function getChangesForPeriod($organizationId, $days = 30)
    {
        $donations = $this->donationsForOrganization($organizationId);

        $recentDonations = $donations->where('created_at', '>=', now()->subDays($days));
        $previousDonations = $donations->whereBetween('created_at', [
            now()->subDays($days * 2),
            now()->subDays($days)
        ]);

        return [
            'change_amount' => $recentDonations->sum('amount') - $previousDonations->sum('amount'),
            'change_count' => $recentDonations->count() - $previousDonations->count(),
        ];
    }

    // Скоупы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByFederalDistrict($query, $districtId)
    {
        return $query->where('federal_district_id', $districtId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }


    public function getOrganizationsCountAttribute(): int
    {
        return $this->organizations()->count();
    }

    public function getTotalDonationsAttribute(): int
    {
        return $this->organizations()->withSum('donations', 'amount')->sum('donations_sum_amount');
    }
}
