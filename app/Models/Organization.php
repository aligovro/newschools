<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use App\Traits\HasSlug;
use App\Enums\OrganizationStatus;

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
    'city_id',
    'settlement_id',
    'city_name',
    'latitude',
    'longitude',
    'logo',
    'images',
    'contacts',
    'type',
    'status',
    'is_public',
    'features',
    'founded_at',
    'admin_user_id',
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
  ];

  // Связи
  public function region(): BelongsTo
  {
    return $this->belongsTo(Region::class);
  }

  public function city(): BelongsTo
  {
    return $this->belongsTo(City::class);
  }

  public function settlement(): BelongsTo
  {
    return $this->belongsTo(Settlement::class);
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

  public function members(): HasMany
  {
    return $this->hasMany(Member::class);
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


  /**
   * Сайты организации
   */
  public function sites(): HasMany
  {
    return $this->hasMany(Site::class);
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
   */
  public function primarySite(): HasOne
  {
    return $this->hasOne(Site::class)->where('is_primary', true);
  }


  public function users(): BelongsToMany
  {
    return $this->belongsToMany(User::class, 'organization_users')
      ->withPivot(['role', 'status', 'permissions', 'joined_at', 'last_active_at'])
      ->withTimestamps();
  }

  public function adminUser(): BelongsTo
  {
    return $this->belongsTo(User::class, 'admin_user_id');
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

  public function scopeByCity($query, $city)
  {
    return $query->where('city', $city);
  }

  public function scopeByType($query, $type)
  {
    return $query->where('type', $type);
  }

  // Методы
  public function getTotalDonationsAttribute(): int
  {
    return $this->donations()->where('status', \App\Enums\DonationStatus::Completed)->sum('amount');
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
