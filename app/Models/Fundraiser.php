<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Fundraiser extends Model
{
  use HasFactory, SoftDeletes;

  protected $table = 'fundraisers';

  protected $fillable = [
    'organization_id',
    'project_id',
    'title',
    'slug',
    'description',
    'short_description',
    'image',
    'gallery',
    'target_amount',
    'collected_amount',
    'status',
    'type',
    'urgency',
    'start_date',
    'end_date',
    'payment_methods',
    'anonymous_donations',
    'show_progress',
    'show_donors',
    'min_donation',
    'max_donation',
    'thank_you_message',
    'seo_settings',
  ];

  protected $casts = [
    'gallery' => 'array',
    'payment_methods' => 'array',
    'thank_you_message' => 'array',
    'seo_settings' => 'array',
    'target_amount' => 'integer',
    'collected_amount' => 'integer',
    'start_date' => 'date',
    'end_date' => 'date',
    'anonymous_donations' => 'boolean',
    'show_progress' => 'boolean',
    'show_donors' => 'boolean',
  ];

  // Связи
  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function project(): BelongsTo
  {
    return $this->belongsTo(Project::class);
  }

  public function donations(): HasMany
  {
    return $this->hasMany(Donation::class);
  }

  // Методы для работы с копейками
  public function getTargetAmountRublesAttribute(): float
  {
    return $this->target_amount / 100;
  }

  public function getCollectedAmountRublesAttribute(): float
  {
    return $this->collected_amount / 100;
  }

  public function getMinDonationRublesAttribute(): float
  {
    return $this->min_donation / 100;
  }

  public function getMaxDonationRublesAttribute(): ?float
  {
    return $this->max_donation ? $this->max_donation / 100 : null;
  }

  public function getProgressPercentageAttribute(): float
  {
    if (!$this->target_amount || $this->target_amount <= 0) {
      return 0;
    }
    return min(100, ($this->collected_amount / $this->target_amount) * 100);
  }

  // События модели
  protected static function boot()
  {
    parent::boot();

    static::creating(function ($fundraiser) {
      if (empty($fundraiser->slug)) {
        $fundraiser->slug = Str::slug($fundraiser->title);
      }
    });
  }
}
