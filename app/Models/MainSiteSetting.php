<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MainSiteSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'site_name',
        'site_description',
        'site_logo',
        'site_favicon',
        'site_theme',
        'primary_color',
        'secondary_color',
        'dark_mode',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'twitter_card',
        'twitter_title',
        'twitter_description',
        'twitter_image',
        'contact_email',
        'contact_phone',
        'contact_address',
        'contact_telegram',
        'contact_vk',
        'social_links',
        'google_analytics_id',
        'yandex_metrika_id',
        'custom_head_code',
        'custom_body_code',
        'payment_settings',
        'notification_settings',
        'integration_settings',
        'metadata',
    ];

    protected $casts = [
        'dark_mode' => 'boolean',
        'social_links' => 'array',
        'payment_settings' => 'array',
        'notification_settings' => 'array',
        'integration_settings' => 'array',
        'metadata' => 'array',
    ];

    /**
     * Получить единственный экземпляр настроек (Singleton)
     */
    public static function instance(): self
    {
        $settings = static::first();

        if (!$settings) {
            $settings = static::createDefault();
        }

        return $settings;
    }

    /**
     * Создать настройки по умолчанию
     */
    public static function createDefault(): self
    {
        return static::create([
            'site_name' => 'Платформа поддержки школ',
            'site_description' => 'Поддерживай школы города — укрепляй будущее. Подписывайся на организации, поддерживай их финансирование, отслеживай прогресс сборов.',
            'site_theme' => 'default',
            'primary_color' => '#3B82F6',
            'secondary_color' => '#6B7280',
            'dark_mode' => false,
            'og_type' => 'website',
            'twitter_card' => 'summary_large_image',
            'social_links' => [],
            'payment_settings' => [
                'enabled_methods' => ['yookassa', 'tinkoff'],
                'min_amount' => 100,
                'max_amount' => 100000000,
                'currency' => 'RUB',
                'auto_approve' => true,
            ],
            'notification_settings' => [
                'email_notifications' => true,
                'telegram_notifications' => false,
                'donation_notifications' => true,
            ],
            'integration_settings' => [
                'yookassa_test_mode' => true,
                'telegram_bot_enabled' => false,
            ],
            'metadata' => [
                'version' => '1.0.0',
                'created_at' => now()->toISOString(),
            ],
        ]);
    }
}
