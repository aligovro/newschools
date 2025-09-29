<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OrganizationSitePage extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organization_site_pages';

    protected $fillable = [
        'site_id',
        'parent_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'template',
        'layout_config',
        'content_blocks',
        'seo_config',
        'featured_image',
        'status',
        'is_homepage',
        'is_public',
        'show_in_navigation',
        'sort_order',
        'published_at',
        'last_updated_at',
    ];

    protected $casts = [
        'layout_config' => 'array',
        'content_blocks' => 'array',
        'seo_config' => 'array',
        'is_homepage' => 'boolean',
        'is_public' => 'boolean',
        'show_in_navigation' => 'boolean',
        'published_at' => 'datetime',
        'last_updated_at' => 'datetime',
    ];

    // Связи
    public function site(): BelongsTo
    {
        return $this->belongsTo(OrganizationSite::class, 'site_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationSitePage::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(OrganizationSitePage::class, 'parent_id')->orderBy('sort_order');
    }

    public function publishedChildren(): HasMany
    {
        return $this->hasMany(OrganizationSitePage::class, 'parent_id')
            ->where('status', 'published')
            ->where('is_public', true)
            ->orderBy('sort_order');
    }

    // Скоупы
    public function scopePublished($query)
    {
        return $query->where('status', 'published')->where('is_public', true);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeHomepage($query)
    {
        return $query->where('is_homepage', true);
    }

    public function scopeInNavigation($query)
    {
        return $query->where('show_in_navigation', true);
    }

    public function scopeByTemplate($query, $template)
    {
        return $query->where('template', $template);
    }

    public function scopeBySite($query, $siteId)
    {
        return $query->where('site_id', $siteId);
    }

    public function scopeRootPages($query)
    {
        return $query->whereNull('parent_id');
    }

    // Методы
    public function getUrlAttribute(): string
    {
        $site = $this->site;
        if (!$site) {
            return '#';
        }

        $baseUrl = $site->full_url;

        if ($this->is_homepage) {
            return $baseUrl;
        }

        return $baseUrl . '/' . $this->slug;
    }

    public function getFullUrlAttribute(): string
    {
        return $this->url;
    }

    public function getTemplateConfigAttribute(): array
    {
        return config('sites.page_templates.' . $this->template, config('sites.page_templates.default'));
    }

    public function getTemplateNameAttribute(): string
    {
        return $this->template_config['name'] ?? 'Стандартная';
    }

    public function getDefaultLayoutConfigAttribute(): array
    {
        return $this->template_config['default_layout'] ?? [];
    }

    public function getMergedLayoutConfigAttribute(): array
    {
        return array_merge($this->default_layout_config, $this->layout_config ?? []);
    }

    public function getFeaturedImageUrlAttribute(): ?string
    {
        if (!$this->featured_image) {
            return null;
        }

        if (filter_var($this->featured_image, FILTER_VALIDATE_URL)) {
            return $this->featured_image;
        }

        return asset('storage/' . $this->featured_image);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->is_public;
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function isHomepage(): bool
    {
        return $this->is_homepage;
    }

    public function isPublic(): bool
    {
        return $this->is_public;
    }

    public function isInNavigation(): bool
    {
        return $this->show_in_navigation;
    }

    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    public function hasPublishedChildren(): bool
    {
        return $this->publishedChildren()->count() > 0;
    }

    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $current = $this;

        while ($current) {
            array_unshift($breadcrumbs, [
                'title' => $current->title,
                'url' => $current->url,
            ]);
            $current = $current->parent;
        }

        return $breadcrumbs;
    }

    public function getDepth(): int
    {
        $depth = 0;
        $current = $this->parent;

        while ($current) {
            $depth++;
            $current = $current->parent;
        }

        return $depth;
    }

    public function publish(): bool
    {
        return $this->update([
            'status' => 'published',
            'is_public' => true,
            'published_at' => now(),
            'last_updated_at' => now(),
        ]);
    }

    public function unpublish(): bool
    {
        return $this->update([
            'status' => 'draft',
            'is_public' => false,
        ]);
    }

    public function archive(): bool
    {
        return $this->update([
            'status' => 'archived',
            'is_public' => false,
        ]);
    }

    public function setAsHomepage(): bool
    {
        // Сначала убираем статус главной страницы у других страниц этого сайта
        $this->site->pages()->update(['is_homepage' => false]);

        // Устанавливаем текущую страницу как главную
        return $this->update([
            'is_homepage' => true,
            'status' => 'published',
            'is_public' => true,
            'published_at' => now(),
        ]);
    }

    // События модели
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title);
            }
        });

        static::updating(function ($page) {
            if ($page->isDirty(['content', 'layout_config', 'content_blocks'])) {
                $page->last_updated_at = now();
            }
        });
    }
}
