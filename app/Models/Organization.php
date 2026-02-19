<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Traits\HasSlug;
use App\Enums\OrganizationStatus;
use App\Enums\DonationStatus;
use App\Models\OrganizationStaff;
use App\Models\OrganizationUser;
use App\Models\ProjectSponsor;
use App\Models\Payments\YooKassaPartnerMerchant;
use App\Support\Money;

class Organization extends Model
{
  use HasFactory, SoftDeletes, HasSlug;

  protected $table = 'organizations';

  protected $fillable = [
    'name',
    'slug',
    'description',
    'address',
    'phone',
    'email',
    'website',
    'region_id',
    'locality_id',
    'city_name',
    'latitude',
    'longitude',
    'logo',
    'yookassa_partner_merchant_id',
    'images',
    'contacts',
    'type',
    'status',
    'is_public',
    'features',
    'needs_target_amount',
    'needs_collected_amount',
    'founded_at',
  ];

  protected $casts = [
    'images' => 'array',
    'contacts' => 'array',
    'features' => 'array',
    'founded_at' => 'datetime',
    'latitude' => 'decimal:8',
    'longitude' => 'decimal:8',
    'is_public' => 'boolean',
    'status' => OrganizationStatus::class,
    'needs_target_amount' => 'integer',
    'needs_collected_amount' => 'integer',
  ];

  protected $appends = [
    'needs',
  ];

  // Связи
  public function region(): BelongsTo
  {
    return $this->belongsTo(Region::class);
  }

  /**
   * Универсальный населённый пункт (город/село/посёлок), связанный с организацией.
   */
  public function locality(): BelongsTo
  {
    return $this->belongsTo(Locality::class);
  }

  public function domains(): HasMany
  {
    return $this->hasMany(Domain::class);
  }

  public function primaryDomain(): HasOne
  {
    return $this->hasOne(Domain::class)->where('is_primary', true);
  }

  public function settings(): HasOne
  {
    return $this->hasOne(OrganizationSetting::class);
  }

  public function seo(): HasOne
  {
    return $this->hasOne(OrganizationSeo::class);
  }

  public function projects(): HasMany
  {
    return $this->hasMany(Project::class);
  }

  public function fundraisers(): HasMany
  {
    return $this->hasMany(Fundraiser::class);
  }

  public function organizationUsers(): HasMany
  {
    return $this->hasMany(OrganizationUser::class);
  }

  public function sponsorMemberships(): HasMany
  {
    return $this->organizationUsers()
      ->where('role', 'sponsor');
  }

  public function projectSponsors(): HasManyThrough
  {
    return $this->hasManyThrough(
      ProjectSponsor::class,
      OrganizationUser::class,
      'organization_id',
      'organization_user_id'
    );
  }

  public function members(): HasMany
  {
    return $this->hasMany(Member::class);
  }

  public function userProfiles(): HasMany
  {
    return $this->hasMany(OrganizationUserProfile::class);
  }

  public function donations(): HasMany
  {
    return $this->hasMany(Donation::class);
  }

  public function news(): HasMany
  {
    return $this->hasMany(OrganizationNews::class);
  }

  public function media(): HasMany
  {
    return $this->hasMany(OrganizationMedia::class);
  }

  public function statistics(): HasMany
  {
    return $this->hasMany(OrganizationStatistic::class);
  }

  public function reports(): HasMany
  {
    return $this->hasMany(Report::class);
  }

  public function reportRuns(): HasMany
  {
    return $this->hasMany(ReportRun::class);
  }

  /**
   * Сайты организации
   */
  public function sites(): HasMany
  {
    return $this->hasMany(Site::class);
  }

  public function yookassaPartnerMerchant(): BelongsTo
  {
    return $this->belongsTo(YooKassaPartnerMerchant::class, 'yookassa_partner_merchant_id');
  }

  /**
   * Публичные сайты
   */
  public function publicSites(): HasMany
  {
    return $this->hasMany(Site::class)->published();
  }

  /**
   * Основной сайт организации
   * Возвращает первый сайт организации (самый старый или можно использовать другой критерий)
   */
  public function primarySite(): HasOne
  {
    return $this->hasOne(Site::class)
      ->where('site_type', 'organization')
      ->orderBy('created_at', 'asc');
  }


  public function users(): BelongsToMany
  {
    return $this->belongsToMany(User::class, 'organization_users')
      ->withPivot(['role', 'status', 'permissions', 'joined_at', 'last_active_at'])
      ->withTimestamps();
  }

  public function staff(): HasMany
  {
    return $this->hasMany(OrganizationStaff::class);
  }

  public function director(): HasOne
  {
    return $this->hasOne(OrganizationStaff::class)
      ->where('position', OrganizationStaff::POSITION_DIRECTOR)
      ->whereNull('deleted_at');
  }

  public function getNeedsAttribute(): array
  {
    [$targetMinor, $collectedMinor] = $this->resolveNeedTotals();

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

  protected function resolveNeedTotals(): array
  {
    return [
      $this->resolveTargetMinor(),
      $this->resolveCollectedMinor(),
    ];
  }

  protected function resolveTargetMinor(): int
  {
    $directValue = (int) ($this->needs_target_amount ?? 0);

    if ($directValue > 0) {
      return $directValue;
    }

    $sum = $this->memoizeComputed('__needs_target_minor', function () {
      $projects = $this->sumActiveProjects('target_amount');

      if ($projects > 0) {
        return $projects;
      }

      return $this->sumActiveFundraisers('target_amount');
    });

    return max(0, $sum);
  }

  protected function resolveCollectedMinor(): int
  {
    $directValue = (int) ($this->needs_collected_amount ?? 0);

    if ($directValue > 0) {
      return $directValue;
    }

    $sum = $this->memoizeComputed('__needs_collected_minor', function () {
      $projects = $this->sumActiveProjects('collected_amount');

      if ($projects > 0) {
        return $projects;
      }

      $fundraisers = $this->sumActiveFundraisers('collected_amount');

      if ($fundraisers > 0) {
        return $fundraisers;
      }

      return (int) $this->donations()
        ->where('status', DonationStatus::Completed)
        ->whereNotNull('paid_at')
        ->sum('amount');
    });

    return max(0, $sum);
  }

  protected function sumActiveProjects(string $column): int
  {
    if ($this->relationLoaded('projects')) {
      return (int) $this->projects
        ->where('status', 'active')
        ->sum($column);
    }

    return (int) $this->projects()
      ->where('status', 'active')
      ->sum($column);
  }

  protected function sumActiveFundraisers(string $column): int
  {
    if ($this->relationLoaded('fundraisers')) {
      return (int) $this->fundraisers
        ->where('status', 'active')
        ->sum($column);
    }

    return (int) $this->fundraisers()
      ->where('status', 'active')
      ->sum($column);
  }

  protected function memoizeComputed(string $key, callable $resolver): int
  {
    if (! array_key_exists($key, $this->attributes)) {
      $this->attributes[$key] = (int) $resolver();
    }

    return (int) $this->attributes[$key];
  }

  /**
   * Получить администратора организации из organization_users
   */
  public function adminUser()
  {
    // Используем wherePivot для правильной работы с pivot таблицей
    return $this->users()
      ->wherePivot('role', 'organization_admin')
      ->first();
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('status', OrganizationStatus::Active);
  }

  public function scopePublic($query)
  {
    return $query->where('is_public', true);
  }

  public function scopeByRegion($query, $regionId)
  {
    return $query->where('region_id', $regionId);
  }

  public function scopeByCity($query, $cityId)
  {
    return $query->where('locality_id', $cityId);
  }

  public function scopeByType($query, $type)
  {
    return $query->where('type', $type);
  }

  public function scopeSearch($query, string $search)
  {
    return $query->where(function ($q) use ($search) {
      $q->where('name', 'like', "%{$search}%")
        ->orWhere('description', 'like', "%{$search}%")
        ->orWhere('email', 'like', "%{$search}%");
    });
  }

  // Методы
  public function getTotalDonationsAttribute(): int
  {
    return $this->donations()->where('status', DonationStatus::Completed)->sum('amount');
  }

  public function getTotalDonationsRublesAttribute(): float
  {
    return $this->total_donations / 100;
  }

  public function getActiveProjectsCountAttribute(): int
  {
    return $this->projects()->where('status', 'active')->count();
  }

  public function getMembersCountAttribute(): int
  {
    return $this->members()->where('is_public', true)->count();
  }

  public function getDomainUrlAttribute(): string
  {
    $primaryDomain = $this->primaryDomain;
    if ($primaryDomain) {
      return $primaryDomain->custom_domain ?? $primaryDomain->domain;
    }
    return config('app.url') . '/organizations/' . $this->slug;
  }

  public function getTypeConfigAttribute(): array
  {
    return config('organizations.types.' . $this->type, config('organizations.types.school'));
  }

  public function getTypeNameAttribute(): string
  {
    return $this->type_config['name'] ?? 'Организация';
  }

  public function getMemberTypeNameAttribute(): string
  {
    return $this->type_config['member_name'] ?? 'Участник';
  }

  // События модели
  protected static function boot()
  {
    parent::boot();

    static::created(function ($organization) {
      // Создаем настройки по умолчанию
      $organization->settings()->create([]);
      $organization->seo()->create([]);
    });
  }
}
