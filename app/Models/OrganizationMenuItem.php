<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationMenuItem extends Model
{
    use HasFactory;

    protected $table = 'organization_menu_items';

    protected $fillable = [
        'menu_id',
        'parent_id',
        'title',
        'url',
        'route_name',
        'page_id',
        'external_url',
        'icon',
        'css_classes',
        'sort_order',
        'is_active',
        'open_in_new_tab',
        'description',
        'meta_data',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'open_in_new_tab' => 'boolean',
        'css_classes' => 'array',
        'meta_data' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * Типы ссылок
     */
    const TYPE_INTERNAL = 'internal';
    const TYPE_EXTERNAL = 'external';
    const TYPE_PAGE = 'page';
    const TYPE_ROUTE = 'route';

    /**
     * Отношение к меню
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(OrganizationMenu::class, 'menu_id');
    }

    /**
     * Отношение к родительскому элементу
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(OrganizationMenuItem::class, 'parent_id');
    }

    /**
     * Дочерние элементы
     */
    public function children(): HasMany
    {
        return $this->hasMany(OrganizationMenuItem::class, 'parent_id')
            ->orderBy('sort_order');
    }

    /**
     * Отношение к странице
     */
    public function page(): BelongsTo
    {
        return $this->belongsTo(OrganizationPage::class, 'page_id');
    }

    /**
     * Получить финальный URL элемента меню
     */
    public function getFinalUrlAttribute(): string
    {
        // Если указан внешний URL
        if ($this->external_url) {
            return $this->external_url;
        }

        // Если указан прямой URL
        if ($this->url) {
            return $this->url;
        }

        // Если указан route_name
        if ($this->route_name) {
            try {
                return route($this->route_name, ['domain' => $this->menu->organization->slug]);
            } catch (\Exception $e) {
                return '#';
            }
        }

        // Если привязана страница
        if ($this->page_id && $this->page) {
            return $this->page->url;
        }

        return '#';
    }

    /**
     * Получить тип ссылки
     */
    public function getLinkTypeAttribute(): string
    {
        if ($this->external_url) {
            return self::TYPE_EXTERNAL;
        }

        if ($this->page_id) {
            return self::TYPE_PAGE;
        }

        if ($this->route_name) {
            return self::TYPE_ROUTE;
        }

        return self::TYPE_INTERNAL;
    }

    /**
     * Проверить, является ли элемент активным
     */
    public function isActive(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        // Проверяем, является ли текущий URL активным
        $currentUrl = request()->url();
        $itemUrl = $this->final_url;

        if ($itemUrl === '#') {
            return false;
        }

        // Для внутренних ссылок проверяем совпадение
        if ($this->link_type === self::TYPE_INTERNAL || $this->link_type === self::TYPE_PAGE) {
            return str_starts_with($currentUrl, $itemUrl);
        }

        return false;
    }

    /**
     * Получить HTML классы для элемента
     */
    public function getCssClassesStringAttribute(): string
    {
        $classes = is_array($this->css_classes) ? $this->css_classes : [];

        if ($this->isActive()) {
            $classes[] = 'active';
        }

        if ($this->children()->count() > 0) {
            $classes[] = 'has-children';
        }

        return implode(' ', array_filter($classes));
    }

    /**
     * Scope для активных элементов
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope для корневых элементов (без родителя)
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope для элементов определенного типа
     */
    public function scopeType($query, string $type)
    {
        switch ($type) {
            case self::TYPE_EXTERNAL:
                return $query->whereNotNull('external_url');
            case self::TYPE_PAGE:
                return $query->whereNotNull('page_id');
            case self::TYPE_ROUTE:
                return $query->whereNotNull('route_name');
            case self::TYPE_INTERNAL:
                return $query->whereNotNull('url')
                    ->whereNull('external_url')
                    ->whereNull('page_id')
                    ->whereNull('route_name');
            default:
                return $query;
        }
    }

    /**
     * Получить все доступные типы ссылок
     */
    public static function getAvailableTypes(): array
    {
        return [
            self::TYPE_INTERNAL => 'Внутренняя ссылка',
            self::TYPE_EXTERNAL => 'Внешняя ссылка',
            self::TYPE_PAGE => 'Страница сайта',
            self::TYPE_ROUTE => 'Маршрут приложения',
        ];
    }
}
