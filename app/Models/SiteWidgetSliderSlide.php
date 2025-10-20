<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetSliderSlide extends Model
{
    use HasFactory;

    protected $table = 'site_widget_slider_slides';

    protected $fillable = [
        'site_widget_id',
        'slide_order',
        'title',
        'subtitle',
        'description',
        'button_text',
        'button_link',
        'button_link_type',
        'button_open_in_new_tab',
        'background_image',
        'overlay_color',
        'overlay_opacity',
        'overlay_gradient',
        'overlay_gradient_intensity',
    ];

    protected $casts = [
        'button_open_in_new_tab' => 'boolean',
        'overlay_opacity' => 'integer',
        'overlay_gradient_intensity' => 'integer',
        'slide_order' => 'integer',
    ];

    /**
     * Отношение к виджету сайта
     */
    public function siteWidget(): BelongsTo
    {
        return $this->belongsTo(SiteWidget::class);
    }

    /**
     * Scope для сортировки по порядку
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('slide_order');
    }

    /**
     * Scope для активных слайдов
     */
    public function scopeActive($query)
    {
        return $query->whereNotNull('title')
            ->where('title', '!=', '');
    }

    /**
     * Получить стиль наложения
     */
    public function getOverlayStyleAttribute(): string
    {
        if ($this->overlay_gradient === 'none' || !$this->overlay_color) {
            return '';
        }

        $opacity = $this->overlay_opacity / 100;
        $intensity = $this->overlay_gradient_intensity / 100;

        return match ($this->overlay_gradient) {
            'left' => "linear-gradient(to right, {$this->overlay_color}{$opacity} {$intensity}%, transparent)",
            'right' => "linear-gradient(to left, {$this->overlay_color}{$opacity} {$intensity}%, transparent)",
            'top' => "linear-gradient(to bottom, {$this->overlay_color}{$opacity} {$intensity}%, transparent)",
            'bottom' => "linear-gradient(to top, {$this->overlay_color}{$opacity} {$intensity}%, transparent)",
            'center' => "radial-gradient(circle, {$this->overlay_color}{$opacity} {$intensity}%, transparent)",
            default => '',
        };
    }

    /**
     * Проверить, является ли ссылка внешней
     */
    public function isExternalLink(): bool
    {
        return $this->button_link_type === 'external';
    }

    /**
     * Получить безопасный URL изображения
     */
    public function getSafeBackgroundImageAttribute(): string
    {
        if (!$this->background_image) {
            return '';
        }

        // Фильтруем blob URLs для неинтерактивного просмотра
        if (str_starts_with($this->background_image, 'blob:')) {
            return '';
        }

        return $this->background_image;
    }
}
