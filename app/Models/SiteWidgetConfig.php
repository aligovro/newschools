<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetConfig extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_widget_id',
    'config_key',
    'config_value',
    'config_type',
  ];

  protected $casts = [
    'config_value' => 'string',
  ];

  /**
   * Получить значение конфигурации в правильном типе
   */
  public function getTypedValueAttribute()
  {
    return match ($this->config_type) {
      'boolean' => (bool) $this->config_value,
      'number' => is_numeric($this->config_value) ? (float) $this->config_value : 0,
      'json' => json_decode($this->config_value, true) ?? [],
      'text' => $this->config_value,
      default => $this->config_value,
    };
  }

  /**
   * Установить значение конфигурации с автоматическим определением типа
   */
  public function setTypedValue($value): void
  {
    $this->config_value = match (true) {
      is_bool($value) => $value ? '1' : '0',
      is_array($value) || is_object($value) => json_encode($value),
      is_numeric($value) => (string) $value,
      default => (string) $value,
    };

    $this->config_type = match (true) {
      is_bool($value) => 'boolean',
      is_array($value) || is_object($value) => 'json',
      is_numeric($value) => 'number',
      strlen($value) > 255 => 'text',
      default => 'string',
    };
  }

  /**
   * Отношение к виджету сайта
   */
  public function siteWidget(): BelongsTo
  {
    return $this->belongsTo(SiteWidget::class);
  }

  /**
   * Scope для поиска по ключу
   */
  public function scopeByKey($query, string $key)
  {
    return $query->where('config_key', $key);
  }

  /**
   * Scope для поиска по типу
   */
  public function scopeByType($query, string $type)
  {
    return $query->where('config_type', $type);
  }
}
