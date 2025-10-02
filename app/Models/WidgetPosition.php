<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WidgetPosition extends Model
{
  use HasFactory;

  protected $fillable = [
    'template_id',
    'name',
    'slug',
    'description',
    'area',
    'order',
    'allowed_widgets',
    'layout_config',
    'is_required',
    'is_active',
  ];

  protected $casts = [
    'allowed_widgets' => 'array',
    'layout_config' => 'array',
    'is_required' => 'boolean',
    'is_active' => 'boolean',
  ];

  // Связи
  public function template(): BelongsTo
  {
    return $this->belongsTo(SiteTemplate::class, 'template_id');
  }

  public function siteWidgets(): HasMany
  {
    return $this->hasMany(SiteWidget::class, 'position_id');
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeByArea($query, $area)
  {
    return $query->where('area', $area);
  }

  public function scopeOrdered($query)
  {
    return $query->orderBy('order');
  }

  public function scopeRequired($query)
  {
    return $query->where('is_required', true);
  }

  // Методы
  public function getAllowedWidgetsAttribute(): array
  {
    return $this->allowed_widgets ?? [];
  }

  public function getLayoutConfigAttribute(): array
  {
    return $this->layout_config ?? [
      'width' => 'full',
      'alignment' => 'center',
      'padding' => '20px',
      'margin' => '0',
    ];
  }

  public function isWidgetAllowed(string $widgetSlug): bool
  {
    $allowedWidgets = $this->allowed_widgets ?? [];

    // Если список пустой, разрешены все виджеты
    if (empty($allowedWidgets)) {
      return true;
    }

    return in_array($widgetSlug, $allowedWidgets);
  }

  public function getAvailableWidgets()
  {
    $allowedSlugs = $this->allowed_widgets ?? [];

    if (empty($allowedSlugs)) {
      return Widget::active()->ordered()->get();
    }

    return Widget::active()
      ->whereIn('slug', $allowedSlugs)
      ->ordered()
      ->get();
  }

  public function getAreaDisplayName(): string
  {
    $areaNames = [
      'header' => 'Шапка',
      'content' => 'Контент',
      'sidebar' => 'Боковая панель',
      'footer' => 'Подвал',
    ];

    return $areaNames[$this->area] ?? ucfirst($this->area);
  }
}
