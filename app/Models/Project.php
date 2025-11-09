<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Project extends Model
{
  use HasFactory, SoftDeletes;

  protected $table = 'projects';

  protected $fillable = [
    'organization_id',
    'title',
    'slug',
    'description',
    'short_description',
    'image',
    'gallery',
    'target_amount',
    'collected_amount',
    'status',
    'category',
    'tags',
    'start_date',
    'end_date',
    'beneficiaries',
    'progress_updates',
    'featured',
    'views_count',
    'donations_count',
    'seo_settings',
    'payment_settings',
    'has_stages',
  ];

  protected $casts = [
    'gallery' => 'array',
    'tags' => 'array',
    'beneficiaries' => 'array',
    'progress_updates' => 'array',
    'seo_settings' => 'array',
    'target_amount' => 'integer',
    'collected_amount' => 'integer',
    'start_date' => 'date',
    'end_date' => 'date',
    'featured' => 'boolean',
    'has_stages' => 'boolean',
    'payment_settings' => 'array',
  ];

  // Связи
  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function fundraisers(): HasMany
  {
    return $this->hasMany(Fundraiser::class);
  }

  public function donations(): HasMany
  {
    return $this->hasMany(Donation::class);
  }

  public function media(): MorphMany
  {
    return $this->morphMany(OrganizationMedia::class, 'mediaable');
  }

  public function stages(): HasMany
  {
    return $this->hasMany(ProjectStage::class)->orderBy('order');
  }

  public function reports(): HasMany
  {
    return $this->hasMany(Report::class);
  }

  public function reportRuns(): HasMany
  {
    return $this->hasMany(ReportRun::class);
  }

  public function categories(): BelongsToMany
  {
    return $this->belongsToMany(ProjectCategory::class, 'project_project_category')
      ->withTimestamps();
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('status', 'active');
  }

  public function scopeFeatured($query)
  {
    return $query->where('featured', true);
  }

  public function scopeByCategory($query, $category)
  {
    return $query->where('category', $category);
  }

  public function scopeByStatus($query, $status)
  {
    return $query->where('status', $status);
  }

  // Методы для работы с копейками
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

  public function getFormattedTargetAmountAttribute(): string
  {
    return number_format($this->target_amount_rubles, 0, '.', ' ') . ' ₽';
  }

  public function getFormattedCollectedAmountAttribute(): string
  {
    return number_format($this->collected_amount_rubles, 0, '.', ' ') . ' ₽';
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
    return $this->status === 'completed' ||
      ($this->target_amount && $this->collected_amount >= $this->target_amount);
  }

  public function getIsActiveAttribute(): bool
  {
    return $this->status === 'active' &&
      (!$this->end_date || $this->end_date >= now()->toDateString());
  }

  public function getDaysLeftAttribute(): ?int
  {
    if (!$this->end_date) {
      return null;
    }
    $days = now()->diffInDays($this->end_date, false);
    return $days > 0 ? $days : 0;
  }

  public function getUrlAttribute(): string
  {
    return $this->organization->domain_url . '/projects/' . $this->slug;
  }

  public function getCategoryNameAttribute(): string
  {
    $typeConfig = $this->organization->type_config;
    return $typeConfig['categories'][$this->category] ?? $this->category;
  }

  /**
   * Получить полный URL изображения
   */
  public function getImageUrlAttribute(): string
  {
    if (!$this->image) {
      return '';
    }

    // Если уже полный URL (http/https) или уже с /storage/
    if (str_starts_with($this->image, 'http') || str_starts_with($this->image, '/storage/')) {
      return $this->image;
    }

    // Добавляем /storage/ для относительных путей
    return '/storage/' . $this->image;
  }

  // События модели
  protected static function boot()
  {
    parent::boot();

    static::creating(function ($project) {
      if (empty($project->slug)) {
        $project->slug = Str::slug($project->title);
      }
    });

    static::saving(function ($project) {
      // Автоматически обновляем статус при достижении цели
      if (
        $project->target_amount &&
        $project->collected_amount >= $project->target_amount &&
        $project->status === 'active'
      ) {
        $project->status = 'completed';
      }
    });
  }
}
