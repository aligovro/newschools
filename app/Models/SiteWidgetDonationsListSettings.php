<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetDonationsListSettings extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'items_per_page',
    'title',
    'description',
    'sort_by',
    'sort_direction',
    'show_amount',
    'show_donor_name',
    'show_date',
    'show_message',
    'show_anonymous',
    'display_options',
  ];

  protected $casts = [
    'items_per_page' => 'integer',
    'show_amount' => 'boolean',
    'show_donor_name' => 'boolean',
    'show_date' => 'boolean',
    'show_message' => 'boolean',
    'show_anonymous' => 'boolean',
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
      'show_amount' => $this->show_amount,
      'show_donor_name' => $this->show_donor_name,
      'show_date' => $this->show_date,
      'show_message' => $this->show_message,
      'show_anonymous' => $this->show_anonymous,
    ];
  }
}
