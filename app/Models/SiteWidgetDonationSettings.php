<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetDonationSettings extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'title',
    'description',
    'min_amount',
    'max_amount',
    'suggested_amounts',
    'currency',
    'show_amount_input',
    'show_anonymous_option',
    'button_text',
    'success_message',
    'payment_methods',
  ];

  protected $casts = [
    'min_amount' => 'decimal:2',
    'max_amount' => 'decimal:2',
    'suggested_amounts' => 'array',
    'show_amount_input' => 'boolean',
    'show_anonymous_option' => 'boolean',
    'payment_methods' => 'array',
  ];

  /**
   * Отношение к виджету сайта
   */
  public function siteWidget(): BelongsTo
  {
    return $this->belongsTo(SiteWidget::class);
  }

  /**
   * Получить отформатированные суммы
   */
  public function getFormattedSuggestedAmountsAttribute(): array
  {
    $amounts = $this->suggested_amounts ?? [];
    return array_map(function ($amount) {
      return number_format($amount, 0, ',', ' ') . ' ' . $this->currency;
    }, $amounts);
  }

  /**
   * Проверить, есть ли ограничения по сумме
   */
  public function hasAmountLimits(): bool
  {
    return $this->min_amount !== null || $this->max_amount !== null;
  }

  /**
   * Получить валидную сумму
   */
  public function validateAmount(float $amount): bool
  {
    if ($this->min_amount !== null && $amount < $this->min_amount) {
      return false;
    }

    if ($this->max_amount !== null && $amount > $this->max_amount) {
      return false;
    }

    return true;
  }
}
