<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetMenuItem extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'item_id',
    'title',
    'url',
    'type',
    'open_in_new_tab',
    'sort_order',
    'is_active',
  ];

  protected $casts = [
    'open_in_new_tab' => 'boolean',
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
   * Scope для активных элементов
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Проверить, является ли ссылка внешней
   */
  public function isExternalLink(): bool
  {
    return $this->type === 'external';
  }

  /**
   * Получить безопасный URL
   */
  public function getSafeUrlAttribute(): string
  {
    if ($this->isExternalLink()) {
      return $this->url;
    }

    // Для внутренних ссылок добавляем префикс если нужно
    if (!str_starts_with($this->url, '/')) {
      return '/' . ltrim($this->url, '/');
    }

    return $this->url;
  }
}
