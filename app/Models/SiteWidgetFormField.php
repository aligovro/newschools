<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SiteWidgetFormField extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_widget_id',
        'field_name',
        'field_type',
        'field_label',
        'field_placeholder',
        'field_help_text',
        'field_required',
        'field_options',
        'field_validation',
        'field_styling',
        'field_order',
        'is_active',
    ];

    protected $casts = [
        'field_required' => 'boolean',
        'field_options' => 'array',
        'field_validation' => 'array',
        'field_styling' => 'array',
        'field_order' => 'integer',
        'is_active' => 'boolean',
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
        return $query->orderBy('field_order');
    }

    /**
     * Scope для активных полей
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope для полей определенного типа
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('field_type', $type);
    }

    /**
     * Scope для обязательных полей
     */
    public function scopeRequired($query)
    {
        return $query->where('field_required', true);
    }

    /**
     * Проверить, является ли поле обязательным
     */
    public function isRequired(): bool
    {
        return $this->field_required;
    }

    /**
     * Проверить, является ли поле активным
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Получить опции для select/radio/checkbox полей
     */
    public function getOptions(): array
    {
        return $this->field_options ?? [];
    }

    /**
     * Получить правила валидации
     */
    public function getValidationRules(): array
    {
        $rules = $this->field_validation ?? [];

        // Добавляем базовые правила в зависимости от типа поля
        if ($this->field_required) {
            $rules[] = 'required';
        }

        return array_merge($rules, match ($this->field_type) {
            'email' => ['email'],
            'phone' => ['regex:/^[\+]?[0-9\s\-\(\)]+$/'],
            'textarea' => ['string', 'max:5000'],
            'text' => ['string', 'max:255'],
            default => ['string'],
        });
    }

    /**
     * Получить стили поля
     */
    public function getStyles(): array
    {
        return $this->field_styling ?? [];
    }

    /**
     * Проверить, поддерживает ли поле опции
     */
    public function supportsOptions(): bool
    {
        return in_array($this->field_type, ['select', 'radio', 'checkbox']);
    }

    /**
     * Проверить, является ли поле текстовым
     */
    public function isTextInput(): bool
    {
        return in_array($this->field_type, ['text', 'email', 'phone', 'textarea']);
    }
}
