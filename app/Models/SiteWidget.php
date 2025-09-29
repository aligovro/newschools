<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class SiteWidget extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'site_id',
    'widget_id',
    'position_id',
    'name',
    'position_name',
    'config',
    'settings',
    'order',
    'is_active',
    'is_visible',
  ];

  protected $casts = [
    'config' => 'array',
    'settings' => 'array',
    'is_active' => 'boolean',
    'is_visible' => 'boolean',
  ];

  // Связи
  public function site(): BelongsTo
  {
    return $this->belongsTo(OrganizationSite::class, 'site_id');
  }

  public function widget(): BelongsTo
  {
    return $this->belongsTo(Widget::class);
  }

  public function position(): BelongsTo
  {
    return $this->belongsTo(WidgetPosition::class, 'position_id');
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeVisible($query)
  {
    return $query->where('is_visible', true);
  }

  public function scopeByPosition($query, $positionName)
  {
    return $query->where('position_name', $positionName);
  }

  public function scopeByArea($query, $area)
  {
    return $query->whereHas('position', function ($q) use ($area) {
      $q->where('area', $area);
    });
  }

  public function scopeOrdered($query)
  {
    return $query->orderBy('position_name')->orderBy('order');
  }

  // Методы
  public function getConfigAttribute(): array
  {
    return $this->config ?? [];
  }

  public function getSettingsAttribute(): array
  {
    return $this->settings ?? [];
  }

  public function getConfigValue(string $key, $default = null)
  {
    return data_get($this->config, $key, $default);
  }

  public function getSettingValue(string $key, $default = null)
  {
    return data_get($this->settings, $key, $default);
  }

  public function setConfigValue(string $key, $value): void
  {
    $config = $this->config;
    data_set($config, $key, $value);
    $this->config = $config;
  }

  public function setSettingValue(string $key, $value): void
  {
    $settings = $this->settings;
    data_set($settings, $key, $value);
    $this->settings = $settings;
  }

  public function getMergedConfig(): array
  {
    $widgetConfig = $this->widget->fields_config ?? [];
    $siteConfig = $this->config ?? [];

    // Объединяем конфигурации, приоритет у настроек сайта
    return array_merge($widgetConfig, $siteConfig);
  }

  public function getMergedSettings(): array
  {
    $widgetSettings = $this->widget->settings_config ?? [];
    $siteSettings = $this->settings ?? [];

    // Объединяем настройки, приоритет у настроек сайта
    return array_merge($widgetSettings, $siteSettings);
  }

  public function getRenderData(): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'widget' => $this->widget->slug,
      'component' => $this->widget->component_name,
      'config' => $this->getMergedConfig(),
      'settings' => $this->getMergedSettings(),
      'css_classes' => $this->widget->css_classes,
      'position' => $this->position_name,
      'order' => $this->order,
      'is_active' => $this->is_active,
      'is_visible' => $this->is_visible,
    ];
  }

  public function duplicate(OrganizationSite $newSite): SiteWidget
  {
    return $newSite->widgets()->create([
      'widget_id' => $this->widget_id,
      'position_id' => $this->position_id,
      'name' => $this->name,
      'position_name' => $this->position_name,
      'config' => $this->config,
      'settings' => $this->settings,
      'order' => $this->order,
      'is_active' => $this->is_active,
      'is_visible' => $this->is_visible,
    ]);
  }

  public function isInArea(string $area): bool
  {
    return $this->position && $this->position->area === $area;
  }

  public function getArea(): ?string
  {
    return $this->position?->area;
  }
}
