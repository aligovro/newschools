<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class SitePage extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'site_pages';

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
        'images',
        'image',
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
        'images' => 'array',
        'is_homepage' => 'boolean',
        'is_public' => 'boolean',
        'show_in_navigation' => 'boolean',
        'published_at' => 'datetime',
        'last_updated_at' => 'datetime',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(SitePage::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(SitePage::class, 'parent_id')->orderBy('sort_order');
    }

    public function publishedChildren(): HasMany
    {
        return $this->hasMany(SitePage::class, 'parent_id')
            ->where('status', 'published')
            ->where('is_public', true)
            ->orderBy('sort_order');
    }

    public function seo(): HasOne
    {
        return $this->hasOne(SitePageSeo::class, 'page_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')->where('is_public', true);
    }

    public function scopeHomepage($query)
    {
        return $query->where('is_homepage', true);
    }

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

        static::saved(function ($page) {
            // Сбрасываем кеш страницы при сохранении
            \Illuminate\Support\Facades\Cache::forget("site_page_{$page->site_id}_{$page->slug}");
        });

        static::deleted(function ($page) {
            // Сбрасываем кеш страницы при удалении
            \Illuminate\Support\Facades\Cache::forget("site_page_{$page->site_id}_{$page->slug}");
        });
    }



    /**
     * Проверить, является ли страница опубликованной
     */
    public function isPublished(): bool
    {
        return $this->status === 'published' &&
            ($this->published_at === null || $this->published_at->isPast());
    }

    /**
     * Проверить, является ли страница черновиком
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Получить хлебные крошки
     */
    public function getBreadcrumbs(): array
    {
        $breadcrumbs = [];
        $page = $this;

        while ($page) {
            array_unshift($breadcrumbs, [
                'title' => $page->title,
                'url' => $page->url,
                'slug' => $page->slug,
            ]);
            $page = $page->parent;
        }

        return $breadcrumbs;
    }


    /**
     * Scope для страниц определенного шаблона
     */
    public function scopeTemplate($query, string $template)
    {
        return $query->where('template', $template);
    }
}
