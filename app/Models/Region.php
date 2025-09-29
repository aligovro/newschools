<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

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
        'is_active' => 'boolean',
    ];

    public function federalDistrict(): BelongsTo
    {
        return $this->belongsTo(FederalDistrict::class);
    }

    public function organizations(): HasMany
    {
        return $this->hasMany(Organization::class);
    }

    public function cities(): HasMany
    {
        return $this->hasMany(City::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(Settlement::class);
    }

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
