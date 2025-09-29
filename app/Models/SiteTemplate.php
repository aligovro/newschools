<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class SiteTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'preview_image',
        'layout_config',
        'theme_config',
        'available_blocks',
        'default_positions',
        'custom_settings',
        'is_active',
        'is_premium',
        'sort_order',
    ];

    protected $casts = [
        'layout_config' => 'array',
        'theme_config' => 'array',
        'available_blocks' => 'array',
        'default_positions' => 'array',
        'custom_settings' => 'array',
        'is_active' => 'boolean',
        'is_premium' => 'boolean',
    ];

    // Связи
    public function positions(): HasMany
    {
        return $this->hasMany(WidgetPosition::class, 'template_id');
    }

    public function activePositions(): HasMany
    {
        return $this->hasMany(WidgetPosition::class, 'template_id')->where('is_active', true);
    }

    // Скоупы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFree($query)
    {
        return $query->where('is_premium', false);
    }

    public function scopePremium($query)
    {
        return $query->where('is_premium', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name');
    }

    // Методы
    public function getPreviewImageUrlAttribute(): ?string
    {
        if (!$this->preview_image) {
            return null;
        }

        if (filter_var($this->preview_image, FILTER_VALIDATE_URL)) {
            return $this->preview_image;
        }

        return asset('storage/' . $this->preview_image);
    }

    public function getDefaultLayoutConfigAttribute(): array
    {
        return $this->layout_config ?? [
            'header' => [
                'type' => 'fixed',
                'background' => 'white',
                'show_logo' => true,
                'show_navigation' => true,
                'show_search' => false,
            ],
            'footer' => [
                'type' => 'default',
                'show_links' => true,
                'show_social' => true,
                'show_contact' => true,
            ],
            'sidebar' => [
                'enabled' => false,
                'position' => 'right',
            ],
        ];
    }

    public function getDefaultThemeConfigAttribute(): array
    {
        return $this->theme_config ?? [
            'primary_color' => '#3B82F6',
            'secondary_color' => '#6B7280',
            'accent_color' => '#F59E0B',
            'background_color' => '#FFFFFF',
            'text_color' => '#1F2937',
            'font_family' => 'Inter',
            'font_size' => '16px',
        ];
    }

    public function getAvailableBlocksAttribute(): array
    {
        return $this->available_blocks ?? [
            'hero',
            'text',
            'image',
            'gallery',
            'slider',
            'testimonials',
            'contact_form',
            'news',
            'projects',
        ];
    }

    public function createDefaultPositions(): void
    {
        $defaultPositions = [
            [
                'name' => 'Главный баннер',
                'slug' => 'hero',
                'description' => 'Главный баннер в верхней части страницы',
                'area' => 'header',
                'order' => 1,
                'is_required' => false,
                'allowed_widgets' => ['hero', 'slider'],
            ],
            [
                'name' => 'Основной контент',
                'slug' => 'content',
                'description' => 'Основная область контента',
                'area' => 'content',
                'order' => 1,
                'is_required' => true,
                'allowed_widgets' => ['text', 'image', 'gallery', 'projects', 'news'],
            ],
            [
                'name' => 'Боковая панель',
                'slug' => 'sidebar',
                'description' => 'Боковая панель с дополнительной информацией',
                'area' => 'sidebar',
                'order' => 1,
                'is_required' => false,
                'allowed_widgets' => ['text', 'contact_form', 'news'],
            ],
            [
                'name' => 'Подвал',
                'slug' => 'footer',
                'description' => 'Подвал страницы с контактной информацией',
                'area' => 'footer',
                'order' => 1,
                'is_required' => false,
                'allowed_widgets' => ['text', 'contact_form'],
            ],
        ];

        foreach ($defaultPositions as $positionData) {
            $this->positions()->create($positionData);
        }
    }

    // События модели
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($template) {
            if (empty($template->slug)) {
                $template->slug = Str::slug($template->name);
            }
        });

        static::created(function ($template) {
            // Создаем позиции по умолчанию для нового шаблона
            $template->createDefaultPositions();
        });
    }
}
