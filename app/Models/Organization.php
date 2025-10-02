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
  ];

  protected $casts = [
    'images' => 'array',
    'contacts' => 'array',
    'features' => 'array',
    'founded_at' => 'datetime',
    'latitude' => 'decimal:8',
    'longitude' => 'decimal:8',
    'is_public' => 'boolean',
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
    return $this->hasMany(OrganizationDomain::class);
  }

  public function primaryDomain(): HasOne
  {
    return $this->hasOne(OrganizationDomain::class)->where('is_primary', true);
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
    return $this->hasMany(OrganizationProject::class);
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
   * Отношение к страницам
   */
  public function pages(): HasMany
  {
    return $this->hasMany(OrganizationPage::class);
  }

  /**
   * Главная страница организации
   */
  public function homepage(): HasOne
  {
    return $this->hasOne(OrganizationPage::class)->where('is_homepage', true);
  }

  /**
   * Опубликованные страницы
   */
  public function publishedPages(): HasMany
  {
    return $this->hasMany(OrganizationPage::class)->published();
  }

  /**
   * Меню организации
   */
  public function menus(): HasMany
  {
    return $this->hasMany(OrganizationMenu::class);
  }

  /**
   * Активные меню
   */
  public function activeMenus(): HasMany
  {
    return $this->hasMany(OrganizationMenu::class)->active();
  }

  /**
   * Слайдеры организации
   */
  public function sliders(): HasMany
  {
    return $this->hasMany(OrganizationSlider::class);
  }

  /**
   * Активные слайдеры
   */
  public function activeSliders(): HasMany
  {
    return $this->hasMany(OrganizationSlider::class)->active();
  }

  /**
   * Слайдеры по позиции
   */
  public function slidersByPosition(string $position): HasMany
  {
    return $this->hasMany(OrganizationSlider::class)->active()->byPosition($position);
  }

  /**
   * Сайты организации
   */
  public function sites(): HasMany
  {
    return $this->hasMany(OrganizationSite::class);
  }

  /**
   * Публичные сайты
   */
  public function publicSites(): HasMany
  {
    return $this->hasMany(OrganizationSite::class)->published();
  }

  /**
   * Основной сайт организации
   */
  public function primarySite(): HasOne
  {
    return $this->hasOne(OrganizationSite::class)->where('is_primary', true);
  }

  /**
   * Меню по локации
   */
  public function menusByLocation(string $location): HasMany
  {
    return $this->hasMany(OrganizationMenu::class)->location($location)->active();
  }

  public function users(): BelongsToMany
  {
    return $this->belongsToMany(User::class, 'organization_users')
      ->withPivot(['role', 'status', 'permissions', 'joined_at', 'last_active_at'])
      ->withTimestamps();
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('status', 'active');
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
    return $this->donations()->where('status', 'completed')->sum('amount');
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
