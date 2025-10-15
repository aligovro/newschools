<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetGalleryImage extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'image_url',
    'alt_text',
    'title',
    'description',
    'sort_order',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'sort_order' => 'integer',
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
    return $query->orderBy('sort_order');
  }

  /**
   * Scope для активных изображений
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
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
   * Получить alt текст или заголовок
   */
  public function getDisplayAltTextAttribute(): string
  {
    return $this->alt_text ?: $this->title ?: 'Изображение галереи';
  }
}
