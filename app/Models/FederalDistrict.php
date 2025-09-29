<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FederalDistrict extends Model
{
    use HasFactory;

    protected $table = 'federal_districts';

    protected $fillable = [
        'name',
        'slug',
        'code',
        'center',
        'latitude',
        'longitude',
        'area',
        'population',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
    ];

    public function regions(): HasMany
    {
        return $this->hasMany(Region::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getOrganizationsCountAttribute(): int
    {
        return $this->regions()->withCount('organizations')->get()->sum('organizations_count');
    }
}
