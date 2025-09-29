<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationSlider extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organization_sliders';

    protected $fillable = [
        'organization_id',
        'name',
        'type',
        'settings',
        'is_active',
        'sort_order',
        'position',
        'display_conditions',
    ];

    protected $casts = [
        'settings' => 'array',
        'display_conditions' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Связи
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function slides(): HasMany
    {
        return $this->hasMany(OrganizationSliderSlide::class, 'slider_id');
    }

    public function activeSlides(): HasMany
    {
        return $this->hasMany(OrganizationSliderSlide::class, 'slider_id')->where('is_active', true)->orderBy('sort_order');
    }

    // Скоупы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPosition($query, $position)
    {
        return $query->where('position', $position);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Методы
    public function getTypeConfigAttribute(): array
    {
        return config('sliders.types.' . $this->type, []);
    }

    public function getTypeNameAttribute(): string
    {
        return $this->type_config['name'] ?? 'Слайдер';
    }

    public function getDefaultSettingsAttribute(): array
    {
        return $this->type_config['default_settings'] ?? [];
    }

    public function getMergedSettingsAttribute(): array
    {
        return array_merge($this->default_settings, $this->settings ?? []);
    }
}
