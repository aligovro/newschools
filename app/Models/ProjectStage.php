<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectStage extends Model
{
  protected $fillable = [
    'project_id',
    'title',
    'description',
    'image',
    'gallery',
    'target_amount',
    'collected_amount',
    'order',
    'status',
    'start_date',
    'end_date',
  ];

  protected $casts = [
    'gallery' => 'array',
    'target_amount' => 'integer',
    'collected_amount' => 'integer',
    'order' => 'integer',
    'start_date' => 'date',
    'end_date' => 'date',
  ];

  // Связи
  public function project(): BelongsTo
  {
    return $this->belongsTo(Project::class);
  }

  public function reports(): HasMany
  {
    return $this->hasMany(Report::class);
  }

  public function reportRuns(): HasMany
  {
    return $this->hasMany(ReportRun::class);
  }

  public function donations(): HasMany
  {
    return $this->hasMany(Donation::class);
  }

  // Методы для работы с суммами
  public function getTargetAmountRublesAttribute(): float
  {
    return $this->target_amount / 100;
  }

  public function setTargetAmountRublesAttribute($value)
  {
    $this->attributes['target_amount'] = $value * 100;
  }

  public function getCollectedAmountRublesAttribute(): float
  {
    return $this->collected_amount / 100;
  }

  public function setCollectedAmountRublesAttribute($value)
  {
    $this->attributes['collected_amount'] = $value * 100;
  }

  public function getProgressPercentageAttribute(): float
  {
    if (!$this->target_amount || $this->target_amount <= 0) {
      return 0;
    }
    return min(100, ($this->collected_amount / $this->target_amount) * 100);
  }

  public function getIsCompletedAttribute(): bool
  {
    return $this->collected_amount >= $this->target_amount || $this->status === 'completed';
  }

  public function getIsActiveAttribute(): bool
  {
    return $this->status === 'active';
  }

  public function getIsPendingAttribute(): bool
  {
    return $this->status === 'pending';
  }
}
