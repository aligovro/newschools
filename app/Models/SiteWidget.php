<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
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
        'position_slug',
        'widget_slug',
        'config',
        'settings',
        'order',
        'sort_order',
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

    /**
     * Отношение к конфигурациям виджета
     */
    public function configs(): HasMany
    {
        return $this->hasMany(SiteWidgetConfig::class);
    }

    /**
     * Отношение к слайдам hero виджета
     */
    public function heroSlides(): HasMany
    {
        return $this->hasMany(SiteWidgetHeroSlide::class)->ordered();
    }

    /**
     * Отношение к полям формы
     */
    public function formFields(): HasMany
    {
        return $this->hasMany(SiteWidgetFormField::class)->ordered();
    }

    /**
     * Отношение к элементам меню
     */
    public function menuItems(): HasMany
    {
        return $this->hasMany(SiteWidgetMenuItem::class)->ordered();
    }

    /**
     * Отношение к изображениям галереи
     */
    public function galleryImages(): HasMany
    {
        return $this->hasMany(SiteWidgetGalleryImage::class)->ordered();
    }

    /**
     * Отношение к настройкам пожертвований
     */
    public function donationSettings(): HasOne
    {
        return $this->hasOne(SiteWidgetDonationSettings::class);
    }

    /**
     * Отношение к настройкам рейтинга регионов
     */
    public function regionRatingSettings(): HasOne
    {
        return $this->hasOne(SiteWidgetRegionRatingSettings::class);
    }

    /**
     * Отношение к настройкам списка пожертвований
     */
    public function donationsListSettings(): HasOne
    {
        return $this->hasOne(SiteWidgetDonationsListSettings::class);
    }

    /**
     * Отношение к настройкам рейтинга по приглашениям
     */
    public function referralLeaderboardSettings(): HasOne
    {
        return $this->hasOne(SiteWidgetReferralLeaderboardSettings::class);
    }

    /**
     * Отношение к настройкам изображения
     */
    public function imageSettings(): HasOne
    {
        return $this->hasOne(SiteWidgetImageSettings::class);
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
        $config = $this->getRawOriginal('config');
        if (empty($config)) {
            return [];
        }

        $decoded = json_decode($config, true);
        return $decoded ?: [];
    }

    public function getSettingsAttribute(): array
    {
        $settings = $this->getRawOriginal('settings');
        if (empty($settings)) {
            return [];
        }

        $decoded = json_decode($settings, true);
        return $decoded ?: [];
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

    /**
     * Получить конфигурацию из нормализованных данных
     */
    public function getNormalizedConfig(): array
    {
        return $this->configs->mapWithKeys(function ($config) {
            return [$config->config_key => $config->typed_value];
        })->toArray();
    }

    /**
     * Получить настройки из нормализованных данных
     */
    public function getNormalizedSettings(): array
    {
        // Пока используем старый способ, позже добавим отдельную таблицу для настроек
        return $this->settings ?? [];
    }

    /**
     * Получить полные данные виджета для рендеринга
     */
    public function getFullRenderData(): array
    {
        $baseData = $this->getRenderData();

        // Добавляем нормализованные данные в зависимости от типа виджета
        switch ($this->widget_slug) {
            case 'hero':
                $baseData['slides'] = $this->heroSlides->map(function ($slide) {
                    return [
                        'id' => $slide->id,
                        'title' => $slide->title,
                        'subtitle' => $slide->subtitle,
                        'description' => $slide->description,
                        'buttonText' => $slide->button_text,
                        'buttonLink' => $slide->button_link,
                        'buttonLinkType' => $slide->button_link_type,
                        'buttonOpenInNewTab' => $slide->button_open_in_new_tab,
                        'backgroundImage' => $slide->safe_background_image,
                        'overlayColor' => $slide->overlay_color,
                        'overlayOpacity' => $slide->overlay_opacity,
                        'overlayGradient' => $slide->overlay_gradient,
                        'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
                        'overlayStyle' => $slide->overlay_style,
                    ];
                })->toArray();
                break;

            case 'form':
                $baseData['fields'] = $this->formFields->active()->map(function ($field) {
                    return [
                        'name' => $field->field_name,
                        'type' => $field->field_type,
                        'label' => $field->field_label,
                        'placeholder' => $field->field_placeholder,
                        'helpText' => $field->field_help_text,
                        'required' => $field->field_required,
                        'options' => $field->getOptions(),
                        'validation' => $field->getValidationRules(),
                        'styling' => $field->getStyles(),
                        'order' => $field->field_order,
                    ];
                })->toArray();
                break;
        }

        return $baseData;
    }

    /**
     * Синхронизировать конфигурацию с нормализованными данными
     */
    public function syncConfig(array $config): void
    {
        // Удаляем старые конфигурации
        $this->configs()->delete();

        // Создаем новые
        foreach ($config as $key => $value) {
            $this->configs()->create([
                'config_key' => $key,
                'config_value' => $value,
            ]);
        }
    }
}
