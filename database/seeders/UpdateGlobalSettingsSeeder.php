<?php

namespace Database\Seeders;

use App\Models\GlobalSettings;
use Illuminate\Database\Seeder;

class UpdateGlobalSettingsSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Удаляем старые настройки
    GlobalSettings::truncate();

    // Создаем новые настройки с полной системой склонений
    GlobalSettings::create([
      // Организации (единственное число)
      'org_singular_nominative' => 'школа',
      'org_singular_genitive' => 'школы',
      'org_singular_dative' => 'школе',
      'org_singular_accusative' => 'школу',
      'org_singular_instrumental' => 'школой',
      'org_singular_prepositional' => 'школе',

      // Организации (множественное число)
      'org_plural_nominative' => 'школы',
      'org_plural_genitive' => 'школ',
      'org_plural_dative' => 'школам',
      'org_plural_accusative' => 'школы',
      'org_plural_instrumental' => 'школами',
      'org_plural_prepositional' => 'школах',

      // Участники (единственное число)
      'member_singular_nominative' => 'выпускник',
      'member_singular_genitive' => 'выпускника',
      'member_singular_dative' => 'выпускнику',
      'member_singular_accusative' => 'выпускника',
      'member_singular_instrumental' => 'выпускником',
      'member_singular_prepositional' => 'выпускнике',

      // Участники (множественное число)
      'member_plural_nominative' => 'выпускники',
      'member_plural_genitive' => 'выпускников',
      'member_plural_dative' => 'выпускникам',
      'member_plural_accusative' => 'выпускников',
      'member_plural_instrumental' => 'выпускниками',
      'member_plural_prepositional' => 'выпускниках',

      // Действия
      'action_join' => 'поступить',
      'action_leave' => 'выпуститься',
      'action_support' => 'поддержать',

      // Системные настройки
      'system_name' => 'Система управления школами',
      'system_description' => 'Платформа для управления школами и выпускниками',
      'default_language' => 'ru',
      'default_timezone' => 'Europe/Moscow',
      'default_currency' => 'RUB',
      'default_organization_settings' => [
        'theme' => 'default',
        'primary_color' => '#3B82F6',
        'secondary_color' => '#6B7280',
        'accent_color' => '#10B981',
        'font_family' => 'Inter',
        'dark_mode' => false,
      ],
      'default_notification_settings' => [
        'email_notifications' => true,
        'telegram_notifications' => false,
        'donation_notifications' => true,
        'member_registration_notifications' => true,
      ],
      'system_settings' => [
        'maintenance_mode' => false,
        'registration_enabled' => true,
        'auto_approve_organizations' => false,
      ],
      'feature_flags' => [
        'donations_enabled' => true,
        'members_enabled' => true,
        'projects_enabled' => true,
        'news_enabled' => true,
        'gallery_enabled' => true,
        'slider_enabled' => true,
      ],
      'integration_settings' => [
        'yookassa_test_mode' => true,
        'telegram_bot_enabled' => false,
      ],
      'default_seo_settings' => [
        'meta_title_template' => '{name} - {type_name}',
        'meta_description_template' => '{description}',
        'sitemap_enabled' => true,
        'robots_default' => 'index,follow',
      ],
      'metadata' => [
        'version' => '1.0.0',
        'created_at' => now()->toISOString(),
      ],
    ]);

    echo "Global settings updated with new declension system!\n";
  }
}
