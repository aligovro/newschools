<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\DonationStatus;
use App\Support\Money;

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

  protected $appends = [
    'funding',
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
    return $this->resolveFundingTargetMinor() / 100;
  }

  public function setTargetAmountRublesAttribute($value)
  {
    $this->attributes['target_amount'] = $value * 100;
    unset($this->attributes['__funding_target_minor']);
  }

  public function getCollectedAmountRublesAttribute(): float
  {
    return $this->resolveFundingCollectedMinor() / 100;
  }

  public function setCollectedAmountRublesAttribute($value)
  {
    $this->attributes['collected_amount'] = $value * 100;
    unset($this->attributes['__funding_collected_minor']);
  }

  public function getProgressPercentageAttribute(): float
  {
    return $this->funding['progress_percentage'];
  }

  public function getIsCompletedAttribute(): bool
  {
    return $this->funding['collected']['minor'] >= $this->funding['target']['minor']
      || $this->status === 'completed';
  }

  public function getIsActiveAttribute(): bool
  {
    return $this->status === 'active';
  }

  public function getIsPendingAttribute(): bool
  {
    return $this->status === 'pending';
  }

  public function getFundingAttribute(): array
  {
    [$targetMinor, $collectedMinor] = $this->resolveFundingTotals();

    $target = Money::toArray($targetMinor);
    $collected = Money::toArray($collectedMinor);

    $targetValue = $target['value'] ?? 0.0;
    $collectedValue = $collected['value'] ?? 0.0;

    $progress = $targetValue > 0
      ? min(100, ($collectedValue / $targetValue) * 100)
      : 0;

    return [
      'target' => $target,
      'collected' => $collected,
      'progress_percentage' => round($progress, 2),
    ];
  }

  protected function resolveFundingTotals(): array
  {
    return [
      $this->resolveFundingTargetMinor(),
      $this->resolveFundingCollectedMinor(),
    ];
  }

  protected function resolveFundingTargetMinor(): int
  {
    return max(0, (int) ($this->target_amount ?? 0));
  }

  protected function resolveFundingCollectedMinor(): int
  {
    $directValue = (int) ($this->collected_amount ?? 0);

    if ($directValue > 0) {
      return $directValue;
    }

    $sum = $this->memoizeComputed('__funding_collected_minor', function () {
      return (int) $this->donations()
        ->where('status', DonationStatus::Completed)
        ->whereNotNull('paid_at')
        ->sum('amount');
    });

    return max(0, $sum);
  }

  protected function memoizeComputed(string $key, callable $resolver): int
  {
    if (! array_key_exists($key, $this->attributes)) {
      $this->attributes[$key] = (int) $resolver();
    }

    return (int) $this->attributes[$key];
  }
}
