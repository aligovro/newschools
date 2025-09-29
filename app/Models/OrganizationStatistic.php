<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationStatistic extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'date',
        'page_views',
        'unique_visitors',
        'new_donations',
        'donation_amount',
        'new_projects',
        'new_members',
        'new_news',
        'traffic_sources',
        'popular_pages',
        'device_stats',
    ];

    protected $casts = [
        'date' => 'date',
        'donation_amount' => 'integer',
        'traffic_sources' => 'array',
        'popular_pages' => 'array',
        'device_stats' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function getDonationAmountRublesAttribute(): float
    {
        return $this->donation_amount / 100;
    }
}
