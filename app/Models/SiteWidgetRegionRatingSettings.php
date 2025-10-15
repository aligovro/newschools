<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetRegionRatingSettings extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'items_per_page',
    'title',
    'description',
    'sort_by',
    'sort_direction',
    'show_rating',
    'show_donations_count',
    'show_progress_bar',
    'display_options',
  ];

  protected $casts = [
    'items_per_page' => 'integer',
    'show_rating' => 'boolean',
    'show_donations_count' => 'boolean',
    'show_progress_bar' => 'boolean',
    'display_options' => 'array',
  ];

  /**
   * Отношение к виджету сайта
   */
  public function siteWidget(): BelongsTo
  {
    return $this->belongsTo(SiteWidget::class);
  }

  /**
   * Получить опции сортировки
   */
  public function getSortOptionsAttribute(): array
  {
    return [
      'by' => $this->sort_by,
      'direction' => $this->sort_direction,
    ];
  }

  /**
   * Получить опции отображения
   */
  public function getDisplayOptionsAttribute(): array
  {
    return $this->display_options ?? [
      'show_rating' => $this->show_rating,
      'show_donations_count' => $this->show_donations_count,
      'show_progress_bar' => $this->show_progress_bar,
    ];
  }
}
