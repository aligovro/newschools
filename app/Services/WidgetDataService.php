<?php

namespace App\Services;

use App\Models\SiteWidget;
use App\Models\SiteWidgetConfig;
use App\Models\SiteWidgetHeroSlide;
use App\Models\SiteWidgetFormField;
use App\Models\SiteWidgetMenuItem;
use App\Models\SiteWidgetGalleryImage;
use App\Models\SiteWidgetDonationSettings;
use App\Models\SiteWidgetRegionRatingSettings;
use App\Models\SiteWidgetDonationsListSettings;
use App\Models\SiteWidgetReferralLeaderboardSettings;
use App\Models\SiteWidgetImageSettings;
use Illuminate\Support\Facades\DB;

class WidgetDataService
{
  /**
   * Сохранить конфигурацию виджета в нормализованном виде
   */
  public function saveWidgetConfig(SiteWidget $widget, array $config): void
  {
    DB::transaction(function () use ($widget, $config) {
      // Сохраняем в JSON поле для обратной совместимости
      $widget->update(['config' => $config]);

      // Синхронизируем с нормализованными данными
      $this->syncConfigToNormalized($widget, $config);
    });
  }

  /**
   * Сохранить настройки виджета
   */
  public function saveWidgetSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Сохраняем в JSON поле для обратной совместимости
      $widget->update(['settings' => $settings]);

      // Пока настройки остаются в JSON, позже можно добавить отдельную таблицу
    });
  }

  /**
   * Сохранить слайды hero виджета
   */
  public function saveHeroSlides(SiteWidget $widget, array $slides): void
  {
    DB::transaction(function () use ($widget, $slides) {
      // Удаляем старые слайды
      $widget->heroSlides()->delete();

      // Создаем новые слайды
      foreach ($slides as $index => $slide) {
        $widget->heroSlides()->create([
          'slide_order' => $index + 1,
          'title' => $slide['title'] ?? null,
          'subtitle' => $slide['subtitle'] ?? null,
          'description' => $slide['description'] ?? null,
          'button_text' => $slide['buttonText'] ?? null,
          'button_link' => $slide['buttonLink'] ?? null,
          'button_link_type' => $slide['buttonLinkType'] ?? 'internal',
          'button_open_in_new_tab' => $slide['buttonOpenInNewTab'] ?? false,
          'background_image' => $slide['backgroundImage'] ?? null,
          'overlay_color' => $slide['overlayColor'] ?? null,
          'overlay_opacity' => $slide['overlayOpacity'] ?? 50,
          'overlay_gradient' => $slide['overlayGradient'] ?? 'none',
          'overlay_gradient_intensity' => $slide['overlayGradientIntensity'] ?? 50,
        ]);
      }
    });
  }

  /**
   * Сохранить поля формы
   */
  public function saveFormFields(SiteWidget $widget, array $fields): void
  {
    DB::transaction(function () use ($widget, $fields) {
      // Удаляем старые поля
      $widget->formFields()->delete();

      // Создаем новые поля
      foreach ($fields as $index => $field) {
        $widget->formFields()->create([
          'field_name' => $field['name'] ?? "field_{$index}",
          'field_type' => $field['type'] ?? 'text',
          'field_label' => $field['label'] ?? null,
          'field_placeholder' => $field['placeholder'] ?? null,
          'field_help_text' => $field['helpText'] ?? null,
          'field_required' => $field['required'] ?? false,
          'field_options' => $field['options'] ?? null,
          'field_validation' => $field['validation'] ?? null,
          'field_styling' => $field['styling'] ?? null,
          'field_order' => $field['order'] ?? $index + 1,
          'is_active' => $field['is_active'] ?? true,
        ]);
      }
    });
  }

  /**
   * Сохранить элементы меню
   */
  public function saveMenuItems(SiteWidget $widget, array $items): void
  {
    DB::transaction(function () use ($widget, $items) {
      // Удаляем старые элементы
      $widget->menuItems()->delete();

      // Создаем новые элементы
      foreach ($items as $index => $item) {
        $widget->menuItems()->create([
          'item_id' => $item['id'] ?? "item_{$index}",
          'title' => $item['title'] ?? '',
          'url' => $item['url'] ?? '#',
          'type' => $item['type'] ?? 'internal',
          'open_in_new_tab' => $item['openInNewTab'] ?? false,
          'sort_order' => $item['order'] ?? $index + 1,
          'is_active' => $item['is_active'] ?? true,
        ]);
      }
    });
  }

  /**
   * Сохранить изображения галереи
   */
  public function saveGalleryImages(SiteWidget $widget, array $images): void
  {
    DB::transaction(function () use ($widget, $images) {
      // Удаляем старые изображения
      $widget->galleryImages()->delete();

      // Создаем новые изображения
      foreach ($images as $index => $image) {
        $widget->galleryImages()->create([
          'image_url' => $image['url'] ?? $image['image_url'] ?? '',
          'alt_text' => $image['alt'] ?? $image['alt_text'] ?? null,
          'title' => $image['title'] ?? null,
          'description' => $image['description'] ?? null,
          'sort_order' => $image['order'] ?? $index + 1,
          'is_active' => $image['is_active'] ?? true,
        ]);
      }
    });
  }

  /**
   * Сохранить настройки пожертвований
   */
  public function saveDonationSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Удаляем старые настройки
      $widget->donationSettings()->delete();

      // Создаем новые настройки
      $widget->donationSettings()->create([
        'title' => $settings['title'] ?? null,
        'description' => $settings['description'] ?? null,
        'min_amount' => $settings['minAmount'] ?? null,
        'max_amount' => $settings['maxAmount'] ?? null,
        'suggested_amounts' => $settings['suggestedAmounts'] ?? null,
        'currency' => $settings['currency'] ?? 'RUB',
        'show_amount_input' => $settings['showAmountInput'] ?? true,
        'show_anonymous_option' => $settings['showAnonymousOption'] ?? true,
        'button_text' => $settings['buttonText'] ?? 'Пожертвовать',
        'success_message' => $settings['successMessage'] ?? null,
        'payment_methods' => $settings['paymentMethods'] ?? null,
      ]);
    });
  }

  /**
   * Сохранить настройки рейтинга регионов
   */
  public function saveRegionRatingSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Удаляем старые настройки
      $widget->regionRatingSettings()->delete();

      // Создаем новые настройки
      $widget->regionRatingSettings()->create([
        'items_per_page' => $settings['items_per_page'] ?? 10,
        'title' => $settings['title'] ?? null,
        'description' => $settings['description'] ?? null,
        'sort_by' => $settings['sort_by'] ?? 'rating',
        'sort_direction' => $settings['sort_direction'] ?? 'desc',
        'show_rating' => $settings['show_rating'] ?? true,
        'show_donations_count' => $settings['show_donations_count'] ?? true,
        'show_progress_bar' => $settings['show_progress_bar'] ?? true,
        'display_options' => $settings['display_options'] ?? null,
      ]);
    });
  }

  /**
   * Сохранить настройки списка пожертвований
   */
  public function saveDonationsListSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Удаляем старые настройки
      $widget->donationsListSettings()->delete();

      // Создаем новые настройки
      $widget->donationsListSettings()->create([
        'items_per_page' => $settings['items_per_page'] ?? 10,
        'title' => $settings['title'] ?? null,
        'description' => $settings['description'] ?? null,
        'sort_by' => $settings['sort_by'] ?? 'created_at',
        'sort_direction' => $settings['sort_direction'] ?? 'desc',
        'show_amount' => $settings['show_amount'] ?? true,
        'show_donor_name' => $settings['show_donor_name'] ?? true,
        'show_date' => $settings['show_date'] ?? true,
        'show_message' => $settings['show_message'] ?? false,
        'show_anonymous' => $settings['show_anonymous'] ?? true,
        'display_options' => $settings['display_options'] ?? null,
      ]);
    });
  }

  /**
   * Сохранить настройки рейтинга по приглашениям
   */
  public function saveReferralLeaderboardSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Удаляем старые настройки
      $widget->referralLeaderboardSettings()->delete();

      // Создаем новые настройки
      $widget->referralLeaderboardSettings()->create([
        'items_per_page' => $settings['items_per_page'] ?? 10,
        'title' => $settings['title'] ?? null,
        'description' => $settings['description'] ?? null,
        'sort_by' => $settings['sort_by'] ?? 'referrals_count',
        'sort_direction' => $settings['sort_direction'] ?? 'desc',
        'show_rank' => $settings['show_rank'] ?? true,
        'show_referrals_count' => $settings['show_referrals_count'] ?? true,
        'show_total_donations' => $settings['show_total_donations'] ?? true,
        'show_avatar' => $settings['show_avatar'] ?? true,
        'display_options' => $settings['display_options'] ?? null,
      ]);
    });
  }

  /**
   * Сохранить настройки изображения
   */
  public function saveImageSettings(SiteWidget $widget, array $settings): void
  {
    DB::transaction(function () use ($widget, $settings) {
      // Удаляем старые настройки
      $widget->imageSettings()->delete();

      // Создаем новые настройки
      $widget->imageSettings()->create([
        'image_url' => $settings['image_url'] ?? $settings['url'] ?? '',
        'alt_text' => $settings['alt_text'] ?? $settings['alt'] ?? null,
        'title' => $settings['title'] ?? null,
        'description' => $settings['description'] ?? null,
        'link_url' => $settings['link_url'] ?? $settings['link'] ?? null,
        'link_type' => $settings['link_type'] ?? 'internal',
        'open_in_new_tab' => $settings['open_in_new_tab'] ?? false,
        'alignment' => $settings['alignment'] ?? 'center',
        'width' => $settings['width'] ?? null,
        'height' => $settings['height'] ?? null,
        'styling' => $settings['styling'] ?? null,
      ]);
    });
  }

  /**
   * Получить полные данные виджета для рендеринга
   */
  public function getWidgetRenderData(SiteWidget $widget): array
  {
    return $widget->getFullRenderData();
  }

  /**
   * Получить все виджеты сайта с нормализованными данными
   */
  public function getSiteWidgetsWithData(int $siteId): array
  {
    $widgets = SiteWidget::with([
      'configs',
      'heroSlides',
      'formFields',
      'menuItems',
      'galleryImages',
      'donationSettings',
      'regionRatingSettings',
      'donationsListSettings',
      'referralLeaderboardSettings',
      'imageSettings',
      'widget',
      'position'
    ])
      ->where('site_id', $siteId)
      ->active()
      ->visible()
      ->ordered()
      ->get();

    return $widgets->map(function ($widget) {
      return $this->getWidgetRenderData($widget);
    })->toArray();
  }

  /**
   * Мигрировать данные из JSON в нормализованные таблицы
   */
  public function migrateWidgetData(SiteWidget $widget): void
  {
    $config = $widget->config ?? [];

    \Log::info("Widget {$widget->name} config: " . json_encode($config));
    \Log::info("Config empty: " . (empty($config) ? 'YES' : 'NO'));
    \Log::info("Config count: " . count($config));

    // Проверяем, есть ли реальные данные в конфигурации
    if (empty($config) || (is_array($config) && count($config) === 0)) {
      \Log::info("Skipping widget {$widget->name} - empty config");
      return;
    }

    \Log::info("Migrating widget {$widget->name} with config: " . json_encode($config));

    DB::transaction(function () use ($widget, $config) {
      // Синхронизируем конфигурацию
      $this->syncConfigToNormalized($widget, $config);

      // Мигрируем специфичные данные в зависимости от типа виджета
      $widgetSlug = $widget->widget_slug ?? $widget->widget->slug ?? 'unknown';
      \Log::info("Widget slug: {$widgetSlug}");

      switch ($widgetSlug) {
        case 'hero':
          $this->migrateHeroData($widget, $config);
          break;
        case 'form':
          $this->migrateFormData($widget, $config);
          break;
        case 'menu':
          $this->migrateMenuData($widget, $config);
          break;
        case 'gallery':
          $this->migrateGalleryData($widget, $config);
          break;
        case 'donation':
          $this->migrateDonationData($widget, $config);
          break;
        case 'region_rating':
          $this->migrateRegionRatingData($widget, $config);
          break;
        case 'donations_list':
          $this->migrateDonationsListData($widget, $config);
          break;
        case 'referral_leaderboard':
          $this->migrateReferralLeaderboardData($widget, $config);
          break;
        case 'image':
          $this->migrateImageData($widget, $config);
          break;
      }
    });
  }

  /**
   * Синхронизировать конфигурацию с нормализованными данными
   */
  private function syncConfigToNormalized(SiteWidget $widget, array $config): void
  {
    \Log::info("Syncing config for widget {$widget->name}: " . json_encode($config));

    // Удаляем старые конфигурации
    $widget->configs()->delete();

    // Создаем новые
    foreach ($config as $key => $value) {
      if (is_array($value) || is_object($value)) {
        $value = json_encode($value);
        $type = 'json';
      } elseif (is_bool($value)) {
        $value = $value ? '1' : '0';
        $type = 'boolean';
      } elseif (is_numeric($value)) {
        $type = 'number';
      } elseif (strlen($value) > 255) {
        $type = 'text';
      } else {
        $type = 'string';
      }

      $widget->configs()->create([
        'config_key' => $key,
        'config_value' => (string) $value,
        'config_type' => $type,
      ]);

      \Log::info("Created config: {$key} = {$value} (type: {$type})");
    }
  }

  /**
   * Мигрировать данные hero виджета
   */
  private function migrateHeroData(SiteWidget $widget, array $config): void
  {
    if (isset($config['slides']) && is_array($config['slides'])) {
      $this->saveHeroSlides($widget, $config['slides']);
    }

    // Также мигрируем singleSlide если есть
    if (isset($config['singleSlide']) && is_array($config['singleSlide'])) {
      $this->saveHeroSlides($widget, [$config['singleSlide']]);
    }
  }

  /**
   * Мигрировать данные формы
   */
  private function migrateFormData(SiteWidget $widget, array $config): void
  {
    if (isset($config['fields']) && is_array($config['fields'])) {
      $this->saveFormFields($widget, $config['fields']);
    }
  }

  /**
   * Мигрировать данные меню
   */
  private function migrateMenuData(SiteWidget $widget, array $config): void
  {
    if (isset($config['items']) && is_array($config['items'])) {
      $this->saveMenuItems($widget, $config['items']);
    }
  }

  /**
   * Мигрировать данные галереи
   */
  private function migrateGalleryData(SiteWidget $widget, array $config): void
  {
    if (isset($config['images']) && is_array($config['images'])) {
      $this->saveGalleryImages($widget, $config['images']);
    }
  }

  /**
   * Мигрировать данные пожертвований
   */
  private function migrateDonationData(SiteWidget $widget, array $config): void
  {
    if (!empty($config)) {
      $this->saveDonationSettings($widget, $config);
    }
  }

  /**
   * Мигрировать данные рейтинга регионов
   */
  private function migrateRegionRatingData(SiteWidget $widget, array $config): void
  {
    if (!empty($config)) {
      $this->saveRegionRatingSettings($widget, $config);
    }
  }

  /**
   * Мигрировать данные списка пожертвований
   */
  private function migrateDonationsListData(SiteWidget $widget, array $config): void
  {
    if (!empty($config)) {
      $this->saveDonationsListSettings($widget, $config);
    }
  }

  /**
   * Мигрировать данные рейтинга по приглашениям
   */
  private function migrateReferralLeaderboardData(SiteWidget $widget, array $config): void
  {
    if (!empty($config)) {
      $this->saveReferralLeaderboardSettings($widget, $config);
    }
  }

  /**
   * Мигрировать данные изображения
   */
  private function migrateImageData(SiteWidget $widget, array $config): void
  {
    if (!empty($config)) {
      $this->saveImageSettings($widget, $config);
    }
  }

  /**
   * Получить статистику по виджетам
   */
  public function getWidgetStats(int $siteId): array
  {
    $stats = DB::table('site_widgets')
      ->join('widgets', 'site_widgets.widget_id', '=', 'widgets.id')
      ->where('site_widgets.site_id', $siteId)
      ->selectRaw('widgets.slug, COUNT(*) as count')
      ->groupBy('widgets.slug')
      ->get()
      ->pluck('count', 'slug')
      ->toArray();

    return $stats;
  }
}
