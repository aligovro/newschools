<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

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
    'order',
    'sort_order',
    'is_active',
    'is_visible',
    'wrapper_class',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'is_visible' => 'boolean',
  ];

  // Связи
  public function site(): BelongsTo
  {
    return $this->belongsTo(Site::class, 'site_id');
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
   * Отношение к слайдам slider виджета
   */
  public function sliderSlides(): HasMany
  {
    return $this->hasMany(SiteWidgetSliderSlide::class)->ordered();
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
    return $this->getNormalizedConfig();
  }

  public function getSettingsAttribute(): array
  {
    return $this->getNormalizedSettings();
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
    $config = $this->getNormalizedConfig();
    data_set($config, $key, $value);
    $this->syncConfig($config);
  }

  public function setSettingValue(string $key, $value): void
  {
    // Пока используем старый способ для настроек, позже добавим отдельную таблицу
    $settings = $this->getNormalizedSettings();
    data_set($settings, $key, $value);
    // TODO: Implement settings sync when settings table is created
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
      'widget_slug' => $this->widget->widget_slug,
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

  public function duplicate(Site $newSite): SiteWidget
  {
    $newWidget = $newSite->widgets()->create([
      'widget_id' => $this->widget_id,
      'position_id' => $this->position_id,
      'name' => $this->name,
      'position_name' => $this->position_name,
      'order' => $this->order,
      'is_active' => $this->is_active,
      'is_visible' => $this->is_visible,
    ]);

    // Копируем конфигурацию
    $config = $this->getNormalizedConfig();
    if (!empty($config)) {
      $newWidget->syncConfig($config);
    }

    return $newWidget;
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
    $config = $this->configs->mapWithKeys(function ($config) {
      return [$config->config_key => $config->typed_value];
    })->toArray();

    // Добавляем данные из специализированных таблиц
    $this->addSpecializedDataToConfig($config);

    return $config;
  }

  /**
   * Добавить данные из специализированных таблиц в конфигурацию
   */
  private function addSpecializedDataToConfig(array &$config): void
  {
    switch ($this->widget_slug) {
      case 'hero':
        // Добавляем слайды в конфигурацию для фронтенда
        $config['hero_slides'] = $this->heroSlides->map(function ($slide) {
          return [
            'id' => (string) $slide->id,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'description' => $slide->description,
            'buttonText' => $slide->button_text,
            'buttonLink' => $slide->button_link,
            'buttonLinkType' => $slide->button_link_type,
            'buttonOpenInNewTab' => $slide->button_open_in_new_tab,
            'backgroundImage' => $slide->background_image ? '/storage/' . $slide->background_image : '',
            'overlayColor' => $slide->overlay_color,
            'overlayOpacity' => $slide->overlay_opacity,
            'overlayGradient' => $slide->overlay_gradient,
            'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
            'sortOrder' => $slide->sort_order,
          ];
        })->toArray();
        break;

      case 'slider':
        // Добавляем слайды в конфигурацию для фронтенда
        $config['slider_slides'] = $this->sliderSlides->map(function ($slide) {
          return [
            'id' => (string) $slide->id,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'description' => $slide->description,
            'buttonText' => $slide->button_text,
            'buttonLink' => $slide->button_link,
            'buttonLinkType' => $slide->button_link_type,
            'buttonOpenInNewTab' => $slide->button_open_in_new_tab,
            'backgroundImage' => $slide->background_image ? '/storage/' . $slide->background_image : '',
            'overlayColor' => $slide->overlay_color,
            'overlayOpacity' => $slide->overlay_opacity,
            'overlayGradient' => $slide->overlay_gradient,
            'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
            'sortOrder' => $slide->sort_order,
            'isActive' => $slide->is_active,
          ];
        })->toArray();
        break;

      case 'form':
        $config['fields'] = $this->formFields->where('is_active', true)->map(function ($field) {
          return [
            'id' => $field->id,
            'name' => $field->field_name,
            'type' => $field->field_type,
            'label' => $field->field_label,
            'placeholder' => $field->field_placeholder,
            'help_text' => $field->field_help_text,
            'is_required' => $field->field_required,
            'validation' => $field->field_validation,
            'options' => $field->field_options,
            'styling' => $field->field_styling,
            'sort_order' => $field->sort_order,
            'is_active' => $field->is_active,
          ];
        })->toArray();
        break;

      case 'menu':
        $config['items'] = $this->menuItems->where('is_active', true)->map(function ($item) {
          return [
            'id' => $item->item_id,
            'title' => $item->title,
            'url' => $item->url,
            'type' => $item->type,
            'newTab' => $item->open_in_new_tab,
            'order' => $item->sort_order,
          ];
        })->toArray();
        break;

      case 'gallery':
        $config['images'] = $this->galleryImages->map(function ($image) {
          return [
            'id' => $image->id,
            'url' => $image->image_url,
            'alt' => $image->alt_text,
            'caption' => $image->caption,
            'order' => $image->sort_order,
          ];
        })->toArray();
        break;

      case 'donation':
        if ($this->donationSettings) {
          $config = array_merge($config, [
            'organizationId' => $this->donationSettings->organization_id,
            'amounts' => $this->donationSettings->amounts,
            'customAmountEnabled' => $this->donationSettings->custom_amount_enabled,
            'minimumAmount' => $this->donationSettings->minimum_amount,
            'maximumAmount' => $this->donationSettings->maximum_amount,
            'currency' => $this->donationSettings->currency,
            'paymentMethods' => $this->donationSettings->payment_methods,
            'recurringEnabled' => $this->donationSettings->recurring_enabled,
            'recurringOptions' => $this->donationSettings->recurring_options,
            'thankYouMessage' => $this->donationSettings->thank_you_message,
            'redirectUrl' => $this->donationSettings->redirect_url,
          ]);
        }
        break;

      case 'region_rating':
        if ($this->regionRatingSettings) {
          $config = array_merge($config, [
            'regionId' => $this->regionRatingSettings->region_id,
            'ratingType' => $this->regionRatingSettings->rating_type,
            'showRanking' => $this->regionRatingSettings->show_ranking,
            'showProgress' => $this->regionRatingSettings->show_progress,
            'showStats' => $this->regionRatingSettings->show_stats,
          ]);
        }
        break;

      case 'donations_list':
        if ($this->donationsListSettings) {
          $config = array_merge($config, [
            'organizationId' => $this->donationsListSettings->organization_id,
            'limit' => $this->donationsListSettings->limit,
            'showAmount' => $this->donationsListSettings->show_amount,
            'showDate' => $this->donationsListSettings->show_date,
            'showAnonymous' => $this->donationsListSettings->show_anonymous,
            'sortBy' => $this->donationsListSettings->sort_by,
            'sortOrder' => $this->donationsListSettings->sort_order,
          ]);
        }
        break;

      case 'referral_leaderboard':
        if ($this->referralLeaderboardSettings) {
          $config = array_merge($config, [
            'organizationId' => $this->referralLeaderboardSettings->organization_id,
            'limit' => $this->referralLeaderboardSettings->limit,
            'period' => $this->referralLeaderboardSettings->period,
            'showRanking' => $this->referralLeaderboardSettings->show_ranking,
            'showStats' => $this->referralLeaderboardSettings->show_stats,
          ]);
        }
        break;

      case 'image':
        if ($this->imageSettings) {
          $config = array_merge($config, [
            'image' => $this->imageSettings->image_url,
            'altText' => $this->imageSettings->alt_text,
            'caption' => $this->imageSettings->description,
            'alignment' => $this->imageSettings->alignment,
            'size' => $this->imageSettings->width ? 'custom' : 'medium', // Пока используем width как индикатор размера
            'linkUrl' => $this->imageSettings->link_url,
            'linkType' => $this->imageSettings->link_type,
            'openInNewTab' => $this->imageSettings->open_in_new_tab,
          ]);
        }
        break;
    }
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
        $heroSlides = $this->heroSlides->map(function ($slide) {
          $backgroundImage = '';
          if ($slide->background_image) {
            if (str_starts_with($slide->background_image, 'http')) {
              $backgroundImage = $slide->background_image;
            } elseif (str_starts_with($slide->background_image, '/storage/')) {
              $backgroundImage = $slide->background_image;
            } else {
              $backgroundImage = '/storage/' . $slide->background_image;
            }
          }

          return [
            'id' => (string) $slide->id,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'description' => $slide->description,
            'buttonText' => $slide->button_text,
            'buttonLink' => $slide->button_link,
            'buttonLinkType' => $slide->button_link_type,
            'buttonOpenInNewTab' => (bool) $slide->button_open_in_new_tab,
            'backgroundImage' => $backgroundImage,
            'overlayColor' => $slide->overlay_color,
            'overlayOpacity' => $slide->overlay_opacity,
            'overlayGradient' => $slide->overlay_gradient,
            'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
          ];
        })->toArray();
        $baseData['slides'] = $heroSlides;
        $baseData['hero_slides'] = $heroSlides;
        break;

      case 'slider':
        $sliderSlides = $this->sliderSlides->map(function ($slide) {
          $backgroundImage = '';
          if ($slide->background_image) {
            if (str_starts_with($slide->background_image, 'http')) {
              $backgroundImage = $slide->background_image;
            } elseif (str_starts_with($slide->background_image, '/storage/')) {
              $backgroundImage = $slide->background_image;
            } else {
              $backgroundImage = '/storage/' . $slide->background_image;
            }
          }

          return [
            'id' => (string) $slide->id,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'description' => $slide->description,
            'buttonText' => $slide->button_text,
            'buttonLink' => $slide->button_link,
            'buttonLinkType' => $slide->button_link_type,
            'buttonOpenInNewTab' => (bool) $slide->button_open_in_new_tab,
            'backgroundImage' => $backgroundImage,
            'overlayColor' => $slide->overlay_color,
            'overlayOpacity' => $slide->overlay_opacity,
            'overlayGradient' => $slide->overlay_gradient,
            'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
            'sortOrder' => $slide->sort_order,
            'isActive' => (bool) $slide->is_active,
          ];
        })->toArray();
        $baseData['slider_slides'] = $sliderSlides;
        break;

      case 'form':
        $baseData['fields'] = $this->formFields->active()->map(function ($field) {
          return [
            'name' => $field->field_name,
            'type' => $field->field_type,
            'label' => $field->field_label,
            'placeholder' => $field->field_placeholder,
            'help_text' => $field->field_help_text,
            'is_required' => $field->field_required,
            'options' => $field->field_options,
            'validation' => $field->field_validation,
            'styling' => $field->field_styling,
            'sort_order' => $field->sort_order,
            'is_active' => $field->is_active,
          ];
        })->toArray();
        break;
    }

    // Добавляем дополнительные поля для совместимости
    $baseData['id'] = $this->id;
    $baseData['widget_id'] = $this->widget_id;
    $baseData['name'] = $this->name;
    $baseData['widget_slug'] = $this->widget_slug;
    $baseData['position_name'] = $this->position_name;
    $baseData['position_slug'] = $this->position_slug;
    $baseData['order'] = $this->order;
    $baseData['is_active'] = $this->is_active;
    $baseData['is_visible'] = $this->is_visible;
    $baseData['wrapper_class'] = $this->wrapper_class;
    $baseData['created_at'] = $this->created_at;
    $baseData['updated_at'] = $this->updated_at;

    return $baseData;
  }

  /**
   * Синхронизировать конфигурацию с нормализованными данными
   */
  public function syncConfig(array $config): void
  {
    Log::info('SiteWidget::syncConfig called', [
      'widget_id' => $this->id,
      'widget_slug' => $this->widget_slug,
      'config_keys' => array_keys($config),
      'has_slides' => isset($config['slides']),
      'slides_count' => isset($config['slides']) ? count($config['slides']) : 0,
    ]);

    // Удаляем старые конфигурации
    $this->configs()->delete();

    // Обрабатываем специализированные данные в зависимости от типа виджета
    $specializedData = [];
    $generalConfig = [];

    switch ($this->widget_slug) {
      case 'hero':
        Log::info('Hero case in syncConfig', [
          'widget_id' => $this->id,
          'config_keys' => array_keys($config),
          'has_slides' => isset($config['slides']),
          'slides_count' => isset($config['slides']) ? count($config['slides']) : 0,
          'slides_is_array' => isset($config['slides']) ? is_array($config['slides']) : false,
        ]);

        if (isset($config['slides']) && is_array($config['slides'])) {
          $specializedData['slides'] = $config['slides'];
          unset($config['slides']);
          Log::info('Hero slides extracted for specialized storage', [
            'slides_count' => count($specializedData['slides']),
          ]);
        }
        break;

      case 'form':
        if (isset($config['fields'])) {
          $specializedData['fields'] = $config['fields'];
          unset($config['fields']);
        }
        break;

      case 'menu':
        if (isset($config['items'])) {
          $specializedData['items'] = $config['items'];
          unset($config['items']);
        }
        break;

      case 'gallery':
        if (isset($config['images'])) {
          $specializedData['images'] = $config['images'];
          unset($config['images']);
        }
        break;

      case 'image':
        // Для image виджета все данные сохраняем в специализированную таблицу
        $imageFields = ['image', 'altText', 'caption', 'alignment', 'size', 'linkUrl', 'linkType', 'openInNewTab'];
        foreach ($imageFields as $field) {
          if (isset($config[$field])) {
            $specializedData[$field] = $config[$field];
            unset($config[$field]);
          }
        }

        break;
    }

    Log::info('SiteWidget::syncConfig - Before syncSpecializedData', [
      'widget_id' => $this->id,
      'specialized_data_keys' => array_keys($specializedData),
      'remaining_config_keys' => array_keys($config),
    ]);

    // Сохраняем специализированные данные
    try {
      $this->syncSpecializedData($specializedData);
      Log::info('SiteWidget::syncConfig - syncSpecializedData completed successfully');
    } catch (\Exception $e) {
      Log::error('SiteWidget::syncConfig - Error in syncSpecializedData', [
        'widget_id' => $this->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }

    // Создаем новые конфигурации для общих данных
    try {
      foreach ($config as $key => $value) {
        $configRecord = $this->configs()->create([
          'config_key' => $key,
        ]);
        $configRecord->setTypedValue($value);
        $configRecord->save();
      }
      Log::info('SiteWidget::syncConfig - configs created successfully');
    } catch (\Exception $e) {
      Log::error('SiteWidget::syncConfig - Error creating configs', [
        'widget_id' => $this->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      throw $e;
    }

    Log::info('SiteWidget::syncConfig - Completed', [
      'widget_id' => $this->id,
      'configs_created' => count($config),
    ]);

    // Очищаем кеш виджетов для этого сайта
    if ($this->site_id) {
      Cache::forget("site_widgets_config_{$this->site_id}");
    }
  }

  /**
   * Извлечь путь к файлу из полного URL
   */
  private function extractImagePathFromUrl(string $url): string
  {
    Log::info('extractImagePathFromUrl called', [
      'input_url' => $url,
      'url_length' => strlen($url),
      'is_empty' => empty($url),
    ]);

    if (empty($url)) {
      Log::info('extractImagePathFromUrl - empty URL, returning empty string');
      return '';
    }

    // Если это полный URL, извлекаем путь после /storage/
    if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
      if (preg_match('/\/storage\/(.+)$/', $url, $matches)) {
        $extractedPath = $matches[1];
        // Очищаем от дублирующихся слешей
        $extractedPath = preg_replace('#/+#', '/', $extractedPath);
        Log::info('extractImagePathFromUrl - extracted and cleaned path from URL', [
          'original_url' => $url,
          'extracted_path' => $extractedPath,
        ]);
        return $extractedPath;
      }
      Log::info('extractImagePathFromUrl - full URL but no /storage/ match, returning as is', [
        'original_url' => $url
      ]);
      return $url;
    }

    // Просто убираем /storage/ если он есть в начале
    if (str_starts_with($url, '/storage/')) {
      $result = substr($url, 9);
      Log::info('extractImagePathFromUrl - removed /storage/ prefix', [
        'original_url' => $url,
        'result' => $result
      ]);
      return $result;
    }

    // Иначе возвращаем как есть
    Log::info('extractImagePathFromUrl - returning as is', [
      'original_url' => $url,
      'returned_path' => $url
    ]);
    return $url;
  }

  /**
   * Синхронизировать специализированные данные
   */
  private function syncSpecializedData(array $data): void
  {
    Log::info('SiteWidget::syncSpecializedData called', [
      'widget_id' => $this->id,
      'widget_slug' => $this->widget_slug,
      'data_keys' => array_keys($data),
    ]);

    switch ($this->widget_slug) {
      case 'hero':
        Log::info('Hero case in syncSpecializedData', [
          'widget_id' => $this->id,
          'data_keys' => array_keys($data),
          'has_slides' => isset($data['slides']),
          'slides_count' => isset($data['slides']) ? count($data['slides']) : 0,
        ]);

        if (isset($data['slides'])) {
          Log::info('Processing hero slides', [
            'slides_count' => count($data['slides']),
          ]);

          // Удаляем старые слайды
          $this->heroSlides()->delete();

          // Создаем новые слайды
          foreach ($data['slides'] as $index => $slideData) {
            Log::info('Creating hero slide', [
              'widget_id' => $this->id,
              'slide_index' => $index,
              'slide_data' => $slideData,
            ]);

            try {
              $originalImageUrl = $slideData['backgroundImage'] ?? $slideData['background_image'] ?? '';
              $extractedPath = $this->extractImagePathFromUrl($originalImageUrl);

              Log::info('Hero slide image processing', [
                'widget_id' => $this->id,
                'slide_index' => $index,
                'original_url' => $originalImageUrl,
                'extracted_path' => $extractedPath,
              ]);

              $slide = $this->heroSlides()->create([
                'title' => $slideData['title'] ?? '',
                'subtitle' => $slideData['subtitle'] ?? '',
                'description' => $slideData['description'] ?? '',
                'button_text' => $slideData['buttonText'] ?? '',
                'button_link' => $slideData['buttonLink'] ?? '',
                'button_link_type' => $slideData['buttonLinkType'] ?? 'internal',
                'button_open_in_new_tab' => $slideData['buttonOpenInNewTab'] ?? false,
                'background_image' => $extractedPath,
                'overlay_color' => $slideData['overlayColor'] ?? '#000000',
                'overlay_opacity' => $slideData['overlayOpacity'] ?? 30,
                'overlay_gradient' => $slideData['overlayGradient'] ?? 'none',
                'overlay_gradient_intensity' => $slideData['overlayGradientIntensity'] ?? 50,
                'sort_order' => $slideData['order'] ?? 1,
              ]);

              Log::info('Hero slide created successfully', [
                'slide_id' => $slide->id,
                'title' => $slide->title,
                'widget_id' => $this->id,
              ]);
            } catch (\Exception $e) {
              Log::error('Error creating hero slide', [
                'widget_id' => $this->id,
                'slide_index' => $index,
                'error' => $e->getMessage(),
                'slide_data' => $slideData,
              ]);
            }
          }

          Log::info('Hero slides processing completed', [
            'total_slides_created' => count($data['slides']),
            'widget_id' => $this->id,
          ]);

          // Проверяем, что слайды действительно сохранились
          $actualSlidesCount = $this->heroSlides()->count();
          Log::info('Hero slides verification', [
            'widget_id' => $this->id,
            'expected_count' => count($data['slides']),
            'actual_count' => $actualSlidesCount,
          ]);
        }
        break;

      case 'form':
        if (isset($data['fields'])) {
          // Удаляем старые поля
          $this->formFields()->delete();

          // Создаем новые поля
          foreach ($data['fields'] as $fieldData) {
            $this->formFields()->create([
              'field_name' => $fieldData['name'] ?? 'field_' . uniqid(),
              'field_type' => $fieldData['type'] ?? 'text',
              'field_label' => $fieldData['label'] ?? '',
              'field_placeholder' => $fieldData['placeholder'] ?? '',
              'field_help_text' => $fieldData['help_text'] ?? '',
              'field_required' => $fieldData['is_required'] ?? false,
              'field_options' => $fieldData['options'] ?? [],
              'field_validation' => $fieldData['validation'] ?? [],
              'field_styling' => $fieldData['styling'] ?? [],
              'sort_order' => $fieldData['sort_order'] ?? 1,
              'is_active' => $fieldData['is_active'] ?? true,
            ]);
          }
        }
        break;

      case 'menu':
        if (isset($data['items'])) {
          // Удаляем старые пункты меню
          $this->menuItems()->delete();

          // Создаем новые пункты меню
          foreach ($data['items'] as $itemData) {
            $this->menuItems()->create([
              'item_id' => $itemData['id'] ?? uniqid(),
              'title' => $itemData['title'] ?? '',
              'url' => $itemData['url'] ?? '',
              'type' => $itemData['type'] ?? 'internal',
              'open_in_new_tab' => $itemData['newTab'] ?? false,
              'sort_order' => $itemData['order'] ?? 1,
            ]);
          }
        }
        break;

      case 'gallery':
        if (isset($data['images'])) {
          // Удаляем старые изображения
          $this->galleryImages()->delete();

          // Создаем новые изображения
          foreach ($data['images'] as $imageData) {
            $this->galleryImages()->create([
              'image_url' => $imageData['url'] ?? '',
              'alt_text' => $imageData['alt'] ?? '',
              'caption' => $imageData['caption'] ?? '',
              'sort_order' => $imageData['order'] ?? 1,
            ]);
          }
        }
        break;

      case 'image':
        // Удаляем старые настройки изображения
        $this->imageSettings()->delete();

        // Создаем новые настройки изображения
        if (!empty($data)) {
          $imageSettingsData = [
            'image_url' => $data['image'] ?? '',
            'alt_text' => $data['altText'] ?? '',
            'description' => $data['caption'] ?? '',
            'alignment' => $data['alignment'] ?? 'center',
            'width' => ($data['size'] ?? 'medium') === 'custom' ? 'auto' : null,
            'height' => ($data['size'] ?? 'medium') === 'custom' ? 'auto' : null,
            'link_url' => $data['linkUrl'] ?? '',
            'link_type' => $data['linkType'] ?? 'internal',
            'open_in_new_tab' => $data['openInNewTab'] ?? false,
          ];


          $this->imageSettings()->create($imageSettingsData);
        }
        break;
    }
  }
}
