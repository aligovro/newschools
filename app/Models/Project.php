<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Enums\DonationStatus;
use App\Support\Money;
use App\Models\ProjectSponsor;

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

    protected $appends = [
        'funding',
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

    public function projectSponsors(): HasMany
    {
        return $this->hasMany(ProjectSponsor::class);
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

    /**
     * Фильтр по категории проекта через связь many-to-many.
     * Принимает slug категории из таблицы project_categories.
     */
    public function scopeByCategory($query, string $categorySlug)
    {
        return $query->whereHas('categories', function ($q) use ($categorySlug) {
            $q->where('project_categories.slug', $categorySlug);
        });
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Методы для работы с копейками
    public function getTargetAmountRublesAttribute(): float
    {
        return $this->resolveFundingTargetMinor() / 100;
    }
    public function getCollectedAmountRublesAttribute(): float
    {
        return $this->resolveFundingCollectedMinor() / 100;
    }

    public function getFormattedTargetAmountAttribute(): string
    {
        return number_format($this->target_amount_rubles, 0, '.', ' ') . ' ₽';
    }

    public function getFormattedCollectedAmountAttribute(): string
    {
        return $this->funding['collected']['formatted'];
    }

    public function getProgressPercentageAttribute(): float
    {
        return $this->funding['progress_percentage'];
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
        if ($this->relationLoaded('categories') && $this->categories->isNotEmpty()) {
            return (string) ($this->categories->first()->name ?? '');
        }

        return '';
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

        $result = [
            'target' => $target,
            'collected' => $collected,
            'progress_percentage' => round($progress, 2),
        ];

        $monthlyGoal = (is_array($this->payment_settings) ? $this->payment_settings : [])['monthly_goal'] ?? null;
        if ($monthlyGoal !== null && (int) $monthlyGoal > 0) {
            $result['monthly_goal'] = \App\Support\Money::toArray((int) $monthlyGoal);
        }

        return $result;
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
        $directValue = (int) ($this->target_amount ?? 0);

        if ($directValue > 0) {
            return $directValue;
        }

        $sum = $this->memoizeComputed('__funding_target_minor', function () {
            $stages = $this->sumActiveStages('target_amount');

            if ($stages > 0) {
                return $stages;
            }

            return 0;
        });

        return max(0, $sum);
    }

    protected function resolveFundingCollectedMinor(): int
    {
        $directValue = (int) ($this->collected_amount ?? 0);

        if ($directValue > 0) {
            return $directValue;
        }

        $sum = $this->memoizeComputed('__funding_collected_minor', function () {
            $stages = $this->sumActiveStages('collected_amount');

            if ($stages > 0) {
                return $stages;
            }

            return (int) $this->donations()
                ->where('status', DonationStatus::Completed)
                ->whereNotNull('paid_at')
                ->sum('amount');
        });

        return max(0, $sum);
    }

    protected function sumActiveStages(string $column): int
    {
        $statuses = ['active', 'pending', 'completed'];

        if ($this->relationLoaded('stages')) {
            return (int) $this->stages
                ->whereIn('status', $statuses)
                ->sum($column);
        }

        return (int) $this->stages()
            ->whereIn('status', $statuses)
            ->sum($column);
    }

    protected function memoizeComputed(string $key, callable $resolver): int
    {
        if (! array_key_exists($key, $this->attributes)) {
            $this->attributes[$key] = (int) $resolver();
        }

        return (int) $this->attributes[$key];
    }

    public function setTargetAmountRublesAttribute($value)
    {
        $this->attributes['target_amount'] = $value * 100;
        unset($this->attributes['__funding_target_minor']);
    }

    public function setCollectedAmountRublesAttribute($value)
    {
        $this->attributes['collected_amount'] = $value * 100;
        unset($this->attributes['__funding_collected_minor']);
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

        static::saved(function ($project) {
            if (
                $project->wasRecentlyCreated
                || $project->wasChanged('status')
                || $project->wasChanged('organization_id')
            ) {
                Cache::forget('alumni_stats_all');

                collect([
                    $project->organization_id,
                    $project->getOriginal('organization_id'),
                ])->filter()->unique()->each(function ($organizationId) {
                    Cache::forget("alumni_stats_org_{$organizationId}");
                });
            }
        });

        static::deleted(function ($project) {
            Cache::forget('alumni_stats_all');
            if ($project->organization_id) {
                Cache::forget("alumni_stats_org_{$project->organization_id}");
            }
        });
    }
}
