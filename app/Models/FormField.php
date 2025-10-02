<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormField extends Model
{
  use HasFactory;

  protected $fillable = [
    'form_widget_id',
    'name',
    'label',
    'type',
    'placeholder',
    'help_text',
    'options',
    'validation',
    'styling',
    'is_required',
    'is_active',
    'sort_order',
  ];

  protected $casts = [
    'options' => 'array',
    'validation' => 'array',
    'styling' => 'array',
    'is_required' => 'boolean',
    'is_active' => 'boolean',
  ];

  public function formWidget(): BelongsTo
  {
    return $this->belongsTo(FormWidget::class);
  }

  // Получить правила валидации для Laravel
  public function getValidationRules(): array
  {
    $rules = [];

    if ($this->is_required) {
      $rules[$this->name] = 'required';
    } else {
      $rules[$this->name] = 'nullable';
    }

    // Добавляем специфичные правила для типа поля
    switch ($this->type) {
      case 'email':
        $rules[$this->name] .= '|email';
        break;
      case 'phone':
        $rules[$this->name] .= '|regex:/^[\+]?[0-9\s\-\(\)]+$/';
        break;
      case 'number':
        $rules[$this->name] .= '|numeric';
        break;
      case 'url':
        $rules[$this->name] .= '|url';
        break;
      case 'file':
        $rules[$this->name] .= '|file';
        break;
      case 'image':
        $rules[$this->name] .= '|image';
        break;
    }

    // Добавляем кастомные правила валидации
    if ($this->validation) {
      foreach ($this->validation as $rule) {
        $rules[$this->name] .= '|' . $rule;
      }
    }

    return $rules;
  }

  // Получить HTML атрибуты для поля
  public function getHtmlAttributes(): array
  {
    $attributes = [
      'id' => $this->name,
      'name' => $this->name,
      'placeholder' => $this->placeholder,
      'class' => 'form-control',
    ];

    if ($this->is_required) {
      $attributes['required'] = true;
    }

    if ($this->type === 'email') {
      $attributes['type'] = 'email';
    } elseif ($this->type === 'phone') {
      $attributes['type'] = 'tel';
    } elseif ($this->type === 'number') {
      $attributes['type'] = 'number';
    } elseif ($this->type === 'url') {
      $attributes['type'] = 'url';
    }

    return $attributes;
  }
}
