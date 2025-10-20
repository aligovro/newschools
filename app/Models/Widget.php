<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Widget extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'widget_slug',
    'description',
    'icon',
    'category',
    'fields_config',
    'settings_config',
    'component_name',
    'css_classes',
    'js_script',
    'is_active',
    'sort_order',
  ];

  protected $casts = [
    'fields_config' => 'array',
    'settings_config' => 'array',
    'is_active' => 'boolean',
  ];

  // Связи
  public function siteWidgets(): HasMany
  {
    return $this->hasMany(SiteWidget::class);
  }

  // Скоупы
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }


  public function scopeByCategory($query, $category)
  {
    return $query->where('category', $category);
  }

  public function scopeOrdered($query)
  {
    return $query->orderBy('sort_order')->orderBy('name');
  }

  // Методы
  public function getIconUrlAttribute(): ?string
  {
    if (!$this->icon) {
      return null;
    }

    if (filter_var($this->icon, FILTER_VALIDATE_URL)) {
      return $this->icon;
    }

    return asset('storage/' . $this->icon);
  }

  public function getFieldsConfigAttribute(): array
  {
    return $this->fields_config ?? [];
  }

  public function getSettingsConfigAttribute(): array
  {
    return $this->settings_config ?? [];
  }

  public function getDefaultFieldsConfig(): array
  {
    $defaultConfigs = [
      'hero' => [
        'title' => ['type' => 'text', 'required' => true, 'label' => 'Заголовок'],
        'subtitle' => ['type' => 'text', 'required' => false, 'label' => 'Подзаголовок'],
        'description' => ['type' => 'textarea', 'required' => false, 'label' => 'Описание'],
        'background_image' => ['type' => 'image', 'required' => false, 'label' => 'Фоновое изображение'],
        'button_text' => ['type' => 'text', 'required' => false, 'label' => 'Текст кнопки'],
        'button_url' => ['type' => 'url', 'required' => false, 'label' => 'Ссылка кнопки'],
        'button_style' => ['type' => 'select', 'required' => false, 'label' => 'Стиль кнопки', 'options' => ['primary', 'secondary', 'outline']],
      ],
      'text' => [
        'content' => ['type' => 'richtext', 'required' => true, 'label' => 'Содержимое'],
        'text_align' => ['type' => 'select', 'required' => false, 'label' => 'Выравнивание', 'options' => ['left', 'center', 'right']],
        'background_color' => ['type' => 'color', 'required' => false, 'label' => 'Цвет фона'],
        'text_color' => ['type' => 'color', 'required' => false, 'label' => 'Цвет текста'],
      ],
      'image' => [
        'image' => ['type' => 'image', 'required' => true, 'label' => 'Изображение'],
        'alt_text' => ['type' => 'text', 'required' => false, 'label' => 'Альтернативный текст'],
        'caption' => ['type' => 'text', 'required' => false, 'label' => 'Подпись'],
        'alignment' => ['type' => 'select', 'required' => false, 'label' => 'Выравнивание', 'options' => ['left', 'center', 'right']],
        'size' => ['type' => 'select', 'required' => false, 'label' => 'Размер', 'options' => ['small', 'medium', 'large', 'full']],
      ],
      'gallery' => [
        'images' => ['type' => 'images', 'required' => true, 'label' => 'Изображения'],
        'columns' => ['type' => 'number', 'required' => false, 'label' => 'Количество колонок', 'min' => 1, 'max' => 6, 'default' => 3],
        'show_captions' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать подписи', 'default' => false],
        'lightbox' => ['type' => 'checkbox', 'required' => false, 'label' => 'Лайтбокс', 'default' => true],
      ],
      'projects' => [
        'title' => ['type' => 'text', 'required' => false, 'label' => 'Заголовок', 'default' => 'Наши проекты'],
        'limit' => ['type' => 'number', 'required' => false, 'label' => 'Количество проектов', 'min' => 1, 'max' => 20, 'default' => 6],
        'columns' => ['type' => 'number', 'required' => false, 'label' => 'Количество колонок', 'min' => 1, 'max' => 4, 'default' => 3],
        'show_description' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать описание', 'default' => true],
        'show_progress' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать прогресс', 'default' => true],
        'show_image' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать изображение', 'default' => true],
      ],
    ];

    return $defaultConfigs[$this->widget_slug] ?? [];
  }

  public function getDefaultSettingsConfig(): array
  {
    $defaultConfigs = [
      'hero' => [
        'height' => ['type' => 'text', 'label' => 'Высота', 'default' => '400px'],
        'parallax' => ['type' => 'checkbox', 'label' => 'Параллакс эффект', 'default' => false],
        'overlay' => ['type' => 'checkbox', 'label' => 'Наложение', 'default' => true],
        'overlay_opacity' => ['type' => 'range', 'label' => 'Прозрачность наложения', 'min' => 0, 'max' => 100, 'default' => 50],
      ],
      'text' => [
        'padding' => ['type' => 'text', 'label' => 'Отступы', 'default' => '20px'],
        'margin' => ['type' => 'text', 'label' => 'Внешние отступы', 'default' => '0'],
        'border_radius' => ['type' => 'text', 'label' => 'Скругление углов', 'default' => '0'],
      ],
      'projects' => [
        'animation' => ['type' => 'select', 'label' => 'Анимация', 'options' => ['none', 'fade', 'slide', 'zoom'], 'default' => 'fade'],
        'hover_effect' => ['type' => 'select', 'label' => 'Эффект при наведении', 'options' => ['none', 'lift', 'shadow', 'scale'], 'default' => 'lift'],
      ],
    ];

    return $defaultConfigs[$this->widget_slug] ?? [];
  }

  // События модели
  protected static function boot()
  {
    parent::boot();

    static::creating(function ($widget) {
      if (empty($widget->widget_slug)) {
        $widget->widget_slug = Str::slug($widget->name);
      }

      // Устанавливаем конфигурацию полей по умолчанию если не задана
      if (empty($widget->fields_config)) {
        $widget->fields_config = $widget->getDefaultFieldsConfig();
      }

      // Устанавливаем конфигурацию настроек по умолчанию если не задана
      if (empty($widget->settings_config)) {
        $widget->settings_config = $widget->getDefaultSettingsConfig();
      }
    });
  }
}
