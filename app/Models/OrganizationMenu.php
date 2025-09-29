<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationMenu extends Model
{
    use HasFactory;

    protected $table = 'organization_menus';

    protected $fillable = [
        'organization_id',
        'name',
        'location',
        'is_active',
        'css_classes',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'css_classes' => 'array',
    ];

    /**
     * Локации меню
     */
    const LOCATION_HEADER = 'header';
    const LOCATION_FOOTER = 'footer';
    const LOCATION_SIDEBAR = 'sidebar';
    const LOCATION_MOBILE = 'mobile';

    /**
     * Отношение к организации
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Элементы меню
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrganizationMenuItem::class, 'menu_id')
            ->whereNull('parent_id')
            ->orderBy('sort_order');
    }

    /**
     * Все элементы меню (включая вложенные)
     */
    public function allItems(): HasMany
    {
        return $this->hasMany(OrganizationMenuItem::class, 'menu_id')
            ->orderBy('sort_order');
    }

    /**
     * Scope для активных меню
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope для меню определенной локации
     */
    public function scopeLocation($query, string $location)
    {
        return $query->where('location', $location);
    }

    /**
     * Получить все доступные локации
     */
    public static function getAvailableLocations(): array
    {
        return [
            self::LOCATION_HEADER => 'Шапка сайта',
            self::LOCATION_FOOTER => 'Подвал сайта',
            self::LOCATION_SIDEBAR => 'Боковая панель',
            self::LOCATION_MOBILE => 'Мобильное меню',
        ];
    }

    /**
     * Получить HTML классы для меню
     */
    public function getCssClassesStringAttribute(): string
    {
        return is_array($this->css_classes)
            ? implode(' ', $this->css_classes)
            : '';
    }
}
