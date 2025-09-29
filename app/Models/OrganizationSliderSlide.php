<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationSliderSlide extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organization_slider_slides';

    protected $fillable = [
        'slider_id',
        'title',
        'subtitle',
        'description',
        'image',
        'background_image',
        'button_text',
        'button_url',
        'button_style',
        'content_type',
        'content_data',
        'is_active',
        'sort_order',
        'display_from',
        'display_until',
    ];

    protected $casts = [
        'content_data' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'display_from' => 'datetime',
        'display_until' => 'datetime',
    ];

    // Связи
    public function slider(): BelongsTo
    {
        return $this->belongsTo(OrganizationSlider::class, 'slider_id');
    }

    // Скоупы
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVisible($query)
    {
        $now = now();
        return $query->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('display_from')
                    ->orWhere('display_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('display_until')
                    ->orWhere('display_until', '>=', $now);
            });
    }

    // Методы
    public function getIsVisibleAttribute(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $now = now();

        if ($this->display_from && $this->display_from > $now) {
            return false;
        }

        if ($this->display_until && $this->display_until < $now) {
            return false;
        }

        return true;
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        if (filter_var($this->image, FILTER_VALIDATE_URL)) {
            return $this->image;
        }

        return asset('storage/' . $this->image);
    }

    public function getBackgroundImageUrlAttribute(): ?string
    {
        if (!$this->background_image) {
            return null;
        }

        if (filter_var($this->background_image, FILTER_VALIDATE_URL)) {
            return $this->background_image;
        }

        return asset('storage/' . $this->background_image);
    }
}
