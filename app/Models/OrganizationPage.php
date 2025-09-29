<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationPage extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'title',
        'slug',
        'content',
        'excerpt',
        'status',
        'template',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'seo_image',
        'featured_image',
        'sort_order',
        'parent_id',
        'is_homepage',
        'published_at',
        'meta_data',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'meta_data' => 'array',
        'is_homepage' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Статусы страниц
     */
    const STATUS_DRAFT = 'draft';
    const STATUS_PUBLISHED = 'published';
    const STATUS_PRIVATE = 'private';
    const STATUS_SCHEDULED = 'scheduled';

    /**
     * Шаблоны страниц
     */
    const TEMPLATE_DEFAULT = 'default';
    const TEMPLATE_FULL_WIDTH = 'full-width';
    const TEMPLATE_LANDING = 'landing';
    const TEMPLATE_BLOG = 'blog';
    const TEMPLATE_CONTACT = 'contact';
    const TEMPLATE_ABOUT = 'about';

    /**
     * Отношение к организации
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Отношение к родительской странице
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationPage::class, 'parent_id');
    }

    /**
     * Дочерние страницы
     */
    public function children()
    {
        return $this->hasMany(OrganizationPage::class, 'parent_id')->orderBy('sort_order');
    }

    /**
     * Получить URL страницы
     */
    public function getUrlAttribute(): string
    {
        if ($this->is_homepage) {
            return route('site.home', ['domain' => $this->organization->domain]);
        }

        return route('site.page', [
            'domain' => $this->organization->domain,
            'slug' => $this->slug
        ]);
    }

    /**
     * Получить полный путь страницы (включая родительские)
     */
    public function getFullPathAttribute(): string
    {
        $path = [];
        $page = $this;

        while ($page) {
            array_unshift($path, $page->slug);
            $page = $page->parent;
        }

        return implode('/', $path);
    }

    /**
     * Проверить, является ли страница опубликованной
     */
    public function isPublished(): bool
    {
        return $this->status === self::STATUS_PUBLISHED &&
            ($this->published_at === null || $this->published_at->isPast());
    }

    /**
     * Проверить, является ли страница черновиком
     */
    public function isDraft(): bool
    {
        return $this->status === self::STATUS_DRAFT;
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
     * Scope для опубликованных страниц
     */
    public function scopePublished($query)
    {
        return $query->where('status', self::STATUS_PUBLISHED)
            ->where(function ($q) {
                $q->whereNull('published_at')
                    ->orWhere('published_at', '<=', now());
            });
    }

    /**
     * Scope для страниц определенного шаблона
     */
    public function scopeTemplate($query, string $template)
    {
        return $query->where('template', $template);
    }

    /**
     * Scope для главной страницы
     */
    public function scopeHomepage($query)
    {
        return $query->where('is_homepage', true);
    }

    /**
     * Получить все доступные шаблоны
     */
    public static function getAvailableTemplates(): array
    {
        return [
            self::TEMPLATE_DEFAULT => 'Обычная страница',
            self::TEMPLATE_FULL_WIDTH => 'Полная ширина',
            self::TEMPLATE_LANDING => 'Лендинг',
            self::TEMPLATE_BLOG => 'Блог',
            self::TEMPLATE_CONTACT => 'Контакты',
            self::TEMPLATE_ABOUT => 'О нас',
        ];
    }

    /**
     * Получить все доступные статусы
     */
    public static function getAvailableStatuses(): array
    {
        return [
            self::STATUS_DRAFT => 'Черновик',
            self::STATUS_PUBLISHED => 'Опубликовано',
            self::STATUS_PRIVATE => 'Приватная',
            self::STATUS_SCHEDULED => 'Запланировано',
        ];
    }
}
