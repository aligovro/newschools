<?php

namespace App\Models;

use App\Enums\SiteStatus;
use App\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Site extends Model
{
  use HasFactory, SoftDeletes, HasSlug;

  protected $table = 'sites';

  protected $fillable = [
    'organization_id',
    'domain_id',
    'name',
    'slug',
    'description',
    'template',
    'site_type',
    'layout_config',
    'theme_config',
    'content_blocks',
    'navigation_config',
    'seo_config',
    'payment_settings',
    'custom_settings',
    'logo',
    'favicon',
    'status',
    'is_public',
    'is_maintenance_mode',
    'maintenance_message',
    'published_at',
    'last_updated_at',
  ];

  protected $casts = [
    'layout_config' => 'array',
    'theme_config' => 'array',
    'content_blocks' => 'array',
    'navigation_config' => 'array',
    'seo_config' => 'array',
    'payment_settings' => 'array',
    'custom_settings' => 'array',
    'is_public' => 'boolean',
    'is_maintenance_mode' => 'boolean',
    'published_at' => 'datetime',
    'last_updated_at' => 'datetime',
    'status' => SiteStatus::class,
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function domain(): BelongsTo
  {
    return $this->belongsTo(Domain::class, 'domain_id');
  }

  public function pages(): HasMany
  {
    return $this->hasMany(SitePage::class, 'site_id');
  }

  public function publishedPages(): HasMany
  {
    return $this->hasMany(SitePage::class, 'site_id')->where('status', 'published');
  }

  public function widgets(): HasMany
  {
    return $this->hasMany(SiteWidget::class, 'site_id');
  }

  public function activeWidgets(): HasMany
  {
    return $this->hasMany(SiteWidget::class, 'site_id')->where('is_active', true);
  }

  public function visibleWidgets(): HasMany
  {
    return $this->hasMany(SiteWidget::class, 'site_id')->where('is_visible', true);
  }

  public function scopePublished($query)
  {
    return $query->where('status', SiteStatus::Published)->where('is_public', true);
  }

  public function scopeDraft($query)
  {
    return $query->where('status', SiteStatus::Draft);
  }

  public function scopeArchived($query)
  {
    return $query->where('status', SiteStatus::Archived);
  }

  public function scopePublic($query)
  {
    return $query->where('is_public', true);
  }

  public function scopeByTemplate($query, $template)
  {
    return $query->where('template', $template);
  }

  public function scopeByDomain($query, $domainId)
  {
    return $query->where('domain_id', $domainId);
  }

  public function getUrlAttribute(): string
  {
    $domain = $this->domain;
    if ($domain) {
      return ($domain->custom_domain ?? $domain->domain) . '/' . $this->slug;
    }
    return config('app.url') . '/sites/' . $this->slug;
  }

  public function getFullUrlAttribute(): string
  {
    $domain = $this->domain;
    if ($domain) {
      $protocol = $domain->is_ssl_enabled ? 'https://' : 'http://';
      return $protocol . ($domain->custom_domain ?? $domain->domain);
    }
    return config('app.url') . '/sites/' . $this->slug;
  }

  public function getTemplateConfigAttribute(): array
  {
    return config('sites.templates.' . $this->template, config('sites.templates.default'));
  }

  public function getTemplateNameAttribute(): string
  {
    return $this->template_config['name'] ?? 'Стандартный';
  }

  public function getDefaultLayoutConfigAttribute(): array
  {
    return $this->template_config['default_layout'] ?? [];
  }

  public function getMergedLayoutConfigAttribute(): array
  {
    return array_merge($this->default_layout_config, $this->layout_config ?? []);
  }

  public function getDefaultThemeConfigAttribute(): array
  {
    return $this->template_config['default_theme'] ?? [];
  }

  public function getMergedThemeConfigAttribute(): array
  {
    return array_merge($this->default_theme_config, $this->theme_config ?? []);
  }

  public function getLogoUrlAttribute(): ?string
  {
    if (!$this->logo) {
      return null;
    }

    if (filter_var($this->logo, FILTER_VALIDATE_URL)) {
      return $this->logo;
    }

    return asset('storage/' . $this->logo);
  }

  public function getFaviconUrlAttribute(): ?string
  {
    // Если у текущего сайта есть фавиконка, возвращаем её
    if ($this->favicon) {
      if (filter_var($this->favicon, FILTER_VALIDATE_URL)) {
        return $this->favicon;
      }
      return asset('storage/' . $this->favicon);
    }

    // Если это не главный сайт, пытаемся получить фавиконку главного сайта
    if ($this->site_type !== 'main') {
      // Кешируем запрос на главный сайт на 1 час
      $mainSiteFavicon = cache()->remember(
        'main_site_favicon',
        3600,
        function () {
          $mainSite = static::where('site_type', 'main')
            ->where('status', SiteStatus::Published)
            ->where('is_public', true)
            ->first();

          if ($mainSite && $mainSite->favicon) {
            if (filter_var($mainSite->favicon, FILTER_VALIDATE_URL)) {
              return $mainSite->favicon;
            }
            return asset('storage/' . $mainSite->favicon);
          }

          return null;
        }
      );

      if ($mainSiteFavicon) {
        return $mainSiteFavicon;
      }
    }

    // Если даже у главного сайта нет фавиконки, возвращаем дефолтную
    return asset('favicon.ico');
  }

  public function isPublished(): bool
  {
    return $this->status === SiteStatus::Published && $this->is_public;
  }

  public function isDraft(): bool
  {
    return $this->status === SiteStatus::Draft;
  }

  public function isArchived(): bool
  {
    return $this->status === SiteStatus::Archived;
  }

  public function isMaintenanceMode(): bool
  {
    return $this->is_maintenance_mode;
  }

  public function publish(): bool
  {
    return $this->update([
      'status' => SiteStatus::Published,
      'is_public' => true,
      'published_at' => now(),
      'last_updated_at' => now(),
    ]);
  }

  public function unpublish(): bool
  {
    return $this->update([
      'status' => SiteStatus::Draft,
      'is_public' => false,
    ]);
  }

  public function archive(): bool
  {
    return $this->update([
      'status' => SiteStatus::Archived,
      'is_public' => false,
    ]);
  }

  protected static function boot()
  {
    parent::boot();

    static::creating(function ($site) {
      if (empty($site->slug)) {
        $site->slug = Str::slug($site->name);
      }
    });

    static::updating(function ($site) {
      if ($site->isDirty(['layout_config', 'theme_config', 'content_blocks'])) {
        $site->last_updated_at = now();
      }
    });
  }
}
