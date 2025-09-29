<?php

namespace App\Services;

use App\Models\MainSiteSetting;
use Illuminate\Support\Facades\Cache;

class MainSiteSettingsService
{
  /**
   * Получить настройки главного сайта
   */
  public function getSettings(): MainSiteSetting
  {
    return Cache::remember('main_site_settings', 86400, function () { // Кеш на 24 часа
      return MainSiteSetting::instance();
    });
  }

  /**
   * Очистить кеш настроек
   */
  public function clearCache(): void
  {
    Cache::forget('main_site_settings');
  }

  /**
   * Обновить основные настройки
   */
  public function updateBasicSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'site_name' => $data['site_name'],
      'site_description' => $data['site_description'],
      'site_logo' => $data['site_logo'] ?? null,
      'site_favicon' => $data['site_favicon'] ?? null,
      'site_theme' => $data['site_theme'],
      'primary_color' => $data['primary_color'],
      'secondary_color' => $data['secondary_color'],
      'dark_mode' => $data['dark_mode'] ?? false,
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить SEO настройки
   */
  public function updateSeoSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'meta_title' => $data['meta_title'],
      'meta_description' => $data['meta_description'],
      'meta_keywords' => $data['meta_keywords'],
      'og_title' => $data['og_title'],
      'og_description' => $data['og_description'],
      'og_image' => $data['og_image'] ?? null,
      'og_type' => $data['og_type'],
      'twitter_card' => $data['twitter_card'],
      'twitter_title' => $data['twitter_title'],
      'twitter_description' => $data['twitter_description'],
      'twitter_image' => $data['twitter_image'] ?? null,
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить контактную информацию
   */
  public function updateContactSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'contact_email' => $data['contact_email'],
      'contact_phone' => $data['contact_phone'],
      'contact_address' => $data['contact_address'],
      'contact_telegram' => $data['contact_telegram'] ?? null,
      'contact_vk' => $data['contact_vk'] ?? null,
      'social_links' => $data['social_links'] ?? [],
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить настройки аналитики
   */
  public function updateAnalyticsSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'google_analytics_id' => $data['google_analytics_id'],
      'yandex_metrika_id' => $data['yandex_metrika_id'],
      'custom_head_code' => $data['custom_head_code'],
      'custom_body_code' => $data['custom_body_code'],
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить настройки платежей
   */
  public function updatePaymentSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'payment_settings' => $data['payment_settings'],
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить настройки уведомлений
   */
  public function updateNotificationSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'notification_settings' => $data['notification_settings'],
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Обновить настройки интеграций
   */
  public function updateIntegrationSettings(array $data): MainSiteSetting
  {
    $settings = $this->getSettings();

    $settings->update([
      'integration_settings' => $data['integration_settings'],
    ]);

    $this->clearCache();
    return $settings;
  }

  /**
   * Получить SEO данные для главной страницы
   */
  public function getSeoData(): array
  {
    $settings = $this->getSettings();
    $globalSettings = app(GlobalSettingsService::class)->getSettings();

    // Используем терминологию из глобальных настроек
    $orgPlural = $globalSettings->org_plural_nominative;
    $orgGenitive = $globalSettings->org_plural_genitive;

    return [
      'title' => $settings->meta_title ?: $settings->site_name . ' - Поддерживай ' . mb_strtolower($orgPlural),
      'description' => $settings->meta_description ?: 'Поддерживай ' . mb_strtolower($orgPlural) . ' города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
      'keywords' => $settings->meta_keywords ?: implode(', ', [
        mb_strtolower($orgPlural),
        mb_strtolower($orgGenitive),
        'поддержка',
        'пожертвования',
        'проекты',
        'организации'
      ]),
      'og_title' => $settings->og_title ?: $settings->site_name . ' - Поддерживай ' . mb_strtolower($orgPlural),
      'og_description' => $settings->og_description ?: 'Поддерживай ' . mb_strtolower($orgPlural) . ' города — укрепляй будущее',
      'og_type' => $settings->og_type,
      'og_image' => $settings->og_image ?: asset('images/og-image.jpg'),
      'twitter_card' => $settings->twitter_card,
      'twitter_title' => $settings->twitter_title ?: $settings->site_name . ' - Поддерживай ' . mb_strtolower($orgPlural),
      'twitter_description' => $settings->twitter_description ?: 'Поддерживай ' . mb_strtolower($orgPlural) . ' города — укрепляй будущее',
      'twitter_image' => $settings->twitter_image ?: asset('images/twitter-image.jpg'),
    ];
  }

  /**
   * Сбросить настройки к значениям по умолчанию
   */
  public function resetToDefaults(): MainSiteSetting
  {
    // Удаляем текущие настройки
    MainSiteSetting::truncate();

    // Очищаем кеш
    $this->clearCache();

    // Создаем новые настройки по умолчанию
    return MainSiteSetting::createDefault();
  }
}
