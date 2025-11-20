<?php

namespace App\Services;

use App\Models\SiteWidget;
use App\Models\SiteWidgetConfig;
use App\Models\SiteWidgetHeroSlide;
use App\Models\SiteWidgetSliderSlide;
use App\Models\SiteWidgetFormField;
use App\Models\SiteWidgetMenuItem;
use App\Models\SiteWidgetGalleryImage;
use App\Models\SiteWidgetDonationSettings;
use App\Models\SiteWidgetRegionRatingSettings;
use App\Models\SiteWidgetDonationsListSettings;
use App\Models\SiteWidgetReferralLeaderboardSettings;
use App\Models\SiteWidgetImageSettings;
use App\Models\SiteWidgetSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class WidgetDataService
{
    /**
     * Сохранить конфигурацию виджета в нормализованном виде
     */
    public function saveWidgetConfig(SiteWidget $widget, array $config): void
    {
        DB::transaction(function () use ($widget, $config) {
            // Синхронизируем с нормализованными данными
            $this->syncConfigToNormalized($widget, $config);

            // Мигрируем специфичные данные в зависимости от типа виджета
            $widgetSlug = $widget->widget_slug ?? $widget->widget->widget_slug ?? 'unknown';
            Log::info("Widget slug: {$widgetSlug}");

            switch ($widgetSlug) {
                case 'hero':
                    $this->migrateHeroData($widget, $config);
                    break;
                case 'slider':
                    $this->migrateSliderData($widget, $config);
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
     * Сохранить настройки виджета
     */
    public function saveWidgetSettings(SiteWidget $widget, array $settings): void
    {
        // Пока настройки не имеют отдельной таблицы, ничего не делаем
        // TODO: Implement settings table when needed
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
                    'sort_order' => $index + 1,
                    'title' => $slide['title'] ?? null,
                    'subtitle' => $slide['subtitle'] ?? null,
                    'description' => $slide['description'] ?? null,
                    'button_text' => $slide['buttonText'] ?? null,
                    'button_link' => $slide['buttonLink'] ?? null,
                    'button_link_type' => $slide['buttonLinkType'] ?? 'internal',
                    'button_open_in_new_tab' => $slide['buttonOpenInNewTab'] ?? false,
                    'background_image' => $this->extractImagePathFromUrl($slide['backgroundImage'] ?? ''),
                    'overlay_color' => $slide['overlayColor'] ?? null,
                    'overlay_opacity' => $slide['overlayOpacity'] ?? 50,
                    'overlay_gradient' => $slide['overlayGradient'] ?? 'none',
                    'overlay_gradient_intensity' => $slide['overlayGradientIntensity'] ?? 50,
                ]);
            }
        });
    }

    /**
     * Сохранить слайды slider виджета
     */
    public function saveSliderSlides(SiteWidget $widget, array $slides): void
    {
        DB::transaction(function () use ($widget, $slides) {
            // Удаляем старые слайды
            $widget->sliderSlides()->delete();

            // Создаем новые слайды
            foreach ($slides as $index => $slide) {
                $widget->sliderSlides()->create([
                    'sort_order' => $index + 1,
                    'title' => $slide['title'] ?? null,
                    'subtitle' => $slide['subtitle'] ?? null,
                    'description' => $slide['description'] ?? null,
                    'button_text' => $slide['buttonText'] ?? null,
                    'button_link' => $slide['buttonLink'] ?? null,
                    'button_link_type' => $slide['buttonLinkType'] ?? 'internal',
                    'button_open_in_new_tab' => $slide['buttonOpenInNewTab'] ?? false,
                    'background_image' => $this->extractImagePathFromUrl($slide['backgroundImage'] ?? ''),
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
                    'sort_order' => $field['order'] ?? $index + 1,
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
            'sliderSlides',
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

        // Загружаем настройки видимости для всех виджетов одним запросом (с кешированием)
        $widgetIds = $widgets->pluck('id')->toArray();
        $allWidgetSettings = Cache::remember("site_widget_settings_{$siteId}", 300, function () use ($siteId) {
            return SiteWidgetSetting::where('site_id', $siteId)
                ->get()
                ->keyBy('widget_id');
        });
        // Фильтруем только нужные виджеты
        $widgetSettings = $allWidgetSettings->filter(function ($setting, $widgetId) use ($widgetIds) {
            return in_array($widgetId, $widgetIds);
        });

        $result = $widgets->map(function ($widget) use ($widgetSettings) {
            $data = $this->getWidgetRenderData($widget);
            // Добавляем настройки видимости если они есть
            $setting = $widgetSettings->get($widget->id);
            if ($setting) {
                $data['visibility_rules'] = $setting->visibility_rules;
            }
            return $data;
        })->toArray();

        return $result;
    }

    /**
     * Мигрировать данные из JSON в нормализованные таблицы
     */
    public function migrateWidgetData(SiteWidget $widget): void
    {
        // Получаем конфигурацию из нормализованных данных
        $config = $widget->getNormalizedConfig();

        Log::info("Widget {$widget->name} config: " . json_encode($config));
        Log::info("Config empty: " . (empty($config) ? 'YES' : 'NO'));
        Log::info("Config count: " . count($config));

        // Проверяем, есть ли реальные данные в конфигурации
        if (empty($config) || (is_array($config) && count($config) === 0)) {
            Log::info("Skipping widget {$widget->name} - empty config");
            return;
        }

        Log::info("Migrating widget {$widget->name} with config: " . json_encode($config));

        DB::transaction(function () use ($widget, $config) {
            // Мигрируем специфичные данные в зависимости от типа виджета
            $widgetSlug = $widget->widget_slug ?? $widget->widget->widget_slug ?? 'unknown';
            Log::info("Widget slug: {$widgetSlug}");

            switch ($widgetSlug) {
                case 'hero':
                    $this->migrateHeroData($widget, $config);
                    break;
                case 'slider':
                    $this->migrateSliderData($widget, $config);
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
        Log::info("Syncing config for widget {$widget->name}: " . json_encode($config));

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

            Log::info("Created config: {$key} = {$value} (type: {$type})");
        }
    }

    private function migrateHeroData(SiteWidget $widget, array $config): void
    {
        if (isset($config['slides']) && is_array($config['slides'])) {
            $this->saveHeroSlides($widget, $config['slides']);
        }

        if (isset($config['singleSlide']) && is_array($config['singleSlide'])) {
            $this->saveHeroSlides($widget, [$config['singleSlide']]);
        }
    }

    private function migrateSliderData(SiteWidget $widget, array $config): void
    {
        if (isset($config['slides']) && is_array($config['slides'])) {
            $this->saveSliderSlides($widget, $config['slides']);
        }

        if (isset($config['singleSlide']) && is_array($config['singleSlide'])) {
            $this->saveSliderSlides($widget, [$config['singleSlide']]);
        }
    }

    private function migrateFormData(SiteWidget $widget, array $config): void
    {
        if (isset($config['fields']) && is_array($config['fields'])) {
            $this->saveFormFields($widget, $config['fields']);
        }
    }

    private function migrateMenuData(SiteWidget $widget, array $config): void
    {
        if (isset($config['items']) && is_array($config['items'])) {
            $this->saveMenuItems($widget, $config['items']);
        }
    }

    private function migrateGalleryData(SiteWidget $widget, array $config): void
    {
        if (isset($config['images']) && is_array($config['images'])) {
            $this->saveGalleryImages($widget, $config['images']);
        }
    }

    private function migrateDonationData(SiteWidget $widget, array $config): void
    {
        if (!empty($config)) {
            $this->saveDonationSettings($widget, $config);
        }
    }

    private function migrateRegionRatingData(SiteWidget $widget, array $config): void
    {
        if (!empty($config)) {
            $this->saveRegionRatingSettings($widget, $config);
        }
    }

    private function migrateDonationsListData(SiteWidget $widget, array $config): void
    {
        if (!empty($config)) {
            $this->saveDonationsListSettings($widget, $config);
        }
    }

    private function migrateReferralLeaderboardData(SiteWidget $widget, array $config): void
    {
        if (!empty($config)) {
            $this->saveReferralLeaderboardSettings($widget, $config);
        }
    }

    private function migrateImageData(SiteWidget $widget, array $config): void
    {
        if (!empty($config)) {
            $this->saveImageSettings($widget, $config);
        }
    }

    public function getWidgetStats(int $siteId): array
    {
        $stats = DB::table('site_widgets')
            ->join('widgets', 'site_widgets.widget_id', '=', 'widgets.id')
            ->where('site_widgets.site_id', $siteId)
            ->selectRaw('widgets.widget_slug, COUNT(*) as count')
            ->groupBy('widgets.widget_slug')
            ->get()
            ->pluck('count', 'widget_slug')
            ->toArray();

        return $stats;
    }

    /**
     * Извлекает путь изображения из URL для сохранения в базу данных
     * Использует статический метод из SiteWidget для единообразия
     */
    private function extractImagePathFromUrl(string $url): string
    {
        return SiteWidget::extractImagePathFromUrl($url);
    }
}
