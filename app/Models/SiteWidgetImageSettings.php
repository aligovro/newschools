<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetImageSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_widget_id',
        'image_url',
        'alt_text',
        'title',
        'description',
        'link_url',
        'link_type',
        'open_in_new_tab',
        'alignment',
        'width',
        'height',
        'styling',
    ];

    protected $casts = [
        'open_in_new_tab' => 'boolean',
        'styling' => 'array',
    ];

    /**
     * Отношение к виджету сайта
     */
    public function siteWidget(): BelongsTo
    {
        return $this->belongsTo(SiteWidget::class);
    }

    /**
     * Проверить, является ли ссылка внешней
     */
    public function isExternalLink(): bool
    {
        return $this->link_type === 'external';
    }

    /**
     * Получить безопасный URL изображения
     */
    public function getSafeImageUrlAttribute(): string
    {
        if (!$this->image_url) {
            return '';
        }

        // Фильтруем blob URLs для неинтерактивного просмотра
        if (str_starts_with($this->image_url, 'blob:')) {
            return '';
        }

        return $this->image_url;
    }

    /**
     * Получить безопасный URL ссылки
     */
    public function getSafeLinkUrlAttribute(): string
    {
        if (!$this->link_url) {
            return '';
        }

        if ($this->isExternalLink()) {
            return $this->link_url;
        }

        // Для внутренних ссылок добавляем префикс если нужно
        if (!str_starts_with($this->link_url, '/')) {
            return '/' . ltrim($this->link_url, '/');
        }

        return $this->link_url;
    }

    /**
     * Получить стили для изображения
     */
    public function getImageStylesAttribute(): array
    {
        $styles = $this->styling ?? [];

        if ($this->width) {
            $styles['width'] = $this->width;
        }

        if ($this->height) {
            $styles['height'] = $this->height;
        }

        return $styles;
    }
}
