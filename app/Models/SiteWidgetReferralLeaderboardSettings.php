<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetReferralLeaderboardSettings extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'items_per_page',
    'title',
    'description',
    'sort_by',
    'sort_direction',
    'show_rank',
    'show_referrals_count',
    'show_total_donations',
    'show_avatar',
    'display_options',
  ];

  protected $casts = [
    'items_per_page' => 'integer',
    'show_rank' => 'boolean',
    'show_referrals_count' => 'boolean',
    'show_total_donations' => 'boolean',
    'show_avatar' => 'boolean',
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
      'show_rank' => $this->show_rank,
      'show_referrals_count' => $this->show_referrals_count,
      'show_total_donations' => $this->show_total_donations,
      'show_avatar' => $this->show_avatar,
    ];
  }
}
