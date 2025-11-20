<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use App\Models\OrganizationSetting;
use App\Models\OrganizationType;
use App\Services\GlobalSettingsService;
use App\Services\Payment\PaymentSettingsNormalizer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;

class OrganizationSettingsService
{
    public function __construct(
        private readonly GlobalSettingsService $globalSettingsService,
        private readonly PaymentSettingsNormalizer $paymentSettingsNormalizer,
    ) {
    }

    /**
     * Получить настройки организации
     */
    public function getSettings(Organization $organization): array
    {
        return Cache::remember(
            "organization_settings_{$organization->id}",
            3600,
            function () use ($organization) {
                $settings = $organization->settings;

                if (!$settings) {
                    // Если настройки не существуют, создаем их с значениями по умолчанию
                    $settings = $this->createDefaultSettings($organization);
                }

                return [
                    'theme' => $settings->theme,
                    'primary_color' => $settings->primary_color,
                    'secondary_color' => $settings->secondary_color,
                    'accent_color' => $settings->accent_color,
                    'font_family' => $settings->font_family,
                    'dark_mode' => $settings->dark_mode,
                    'maintenance_mode' => $settings->maintenance_mode,
                    'maintenance_message' => $settings->maintenance_message,
                    'custom_css' => $settings->custom_css ?? [],
                    'layout_config' => $settings->layout_config ?? [],
                    'feature_flags' => $settings->feature_flags ?? [],
                    'integration_settings' => $settings->integration_settings ?? [],
                    'payment_settings' => is_array($settings->payment_settings)
                        ? $this->paymentSettingsNormalizer->normalize($settings->payment_settings)
                        : $this->resolveDefaultPaymentSettings(),
                    'notification_settings' => $settings->notification_settings ?? $this->getDefaultNotificationSettings(),
                    'advanced_layout_config' => $settings->advanced_layout_config ?? [],
                    'seo_settings' => $settings->seo_settings ?? [],
                    'social_media_settings' => $settings->social_media_settings ?? [],
                    'analytics_settings' => $settings->analytics_settings ?? [],
                    'security_settings' => $settings->security_settings ?? [],
                    'backup_settings' => $settings->backup_settings ?? [],
                    'external_integrations' => $settings->external_integrations ?? [],
                    'advanced_notification_settings' => $settings->advanced_notification_settings ?? [],
                    'theme_settings' => $settings->theme_settings ?? [],
                    'performance_settings' => $settings->performance_settings ?? [],
                    'settings_metadata' => $settings->settings_metadata ?? [],
                ];
            }
        );
    }

    /**
     * Получить типы организаций из базы данных
     */
    public function getOrganizationTypes(): array
    {
        return Cache::remember('organization_types', 3600, function () {
            // Получаем типы из базы данных
            $dbTypes = OrganizationType::active()->get();

            if ($dbTypes->isNotEmpty()) {
                $types = [];
                foreach ($dbTypes as $type) {
                    $types[] = [
                        'value' => $type->key,
                        'label' => $type->name,
                        'description' => $type->name . ' - ' . implode(', ', $type->features ?? []),
                        'features' => $type->features ?? [],
                        'categories' => $type->categories ?? [],
                        'member_type' => $type->member_type,
                        'member_name' => $type->member_name,
                        'member_plural' => $type->member_plural,
                        'domain_prefix' => $type->domain_prefix,
                    ];
                }
                return $types;
            }

            // Fallback на конфигурацию
            $configTypes = config('organizations.types', []);
            $types = [];
            foreach ($configTypes as $key => $type) {
                $types[] = [
                    'value' => $key,
                    'label' => $type['name'],
                    'description' => $type['name'] . ' - ' . implode(', ', $type['features']),
                    'features' => $type['features'] ?? [],
                    'categories' => $type['categories'] ?? [],
                    'member_type' => $type['member_type'] ?? 'member',
                    'member_name' => $type['member_name'] ?? 'Участник',
                    'member_plural' => $type['member_plural'] ?? 'Участники',
                    'domain_prefix' => $type['domain_prefix'] ?? $key . 's',
                ];
            }

            return $types;
        });
    }

    /**
     * Обновить настройки организации
     */
    public function updateSettings(Organization $organization, array $settings): OrganizationSetting
    {
        $organizationSetting = $organization->settings()->firstOrNew();

        // Обновляем только переданные настройки
        $allowedFields = [
            'theme',
            'primary_color',
            'secondary_color',
            'accent_color',
            'font_family',
            'dark_mode',
            'maintenance_mode',
            'maintenance_message',
            'custom_css',
            'layout_config',
            'feature_flags',
            'integration_settings',
            'payment_settings',
            'notification_settings',
            'advanced_layout_config',
            'seo_settings',
            'social_media_settings',
            'analytics_settings',
            'security_settings',
            'backup_settings',
            'external_integrations',
            'advanced_notification_settings',
            'theme_settings',
            'performance_settings',
            'settings_metadata'
        ];

        foreach ($allowedFields as $field) {
            if (isset($settings[$field])) {
                $organizationSetting->$field = $settings[$field];
            }
        }

        $organizationSetting->save();

        // Очищаем кеш
        Cache::forget("organization_settings_{$organization->id}");

        return $organizationSetting;
    }

    /**
     * Создать настройки по умолчанию
     */
    private function createDefaultSettings(Organization $organization): OrganizationSetting
    {
        return $organization->settings()->create([
            'theme' => 'default',
            'primary_color' => '#3B82F6',
            'secondary_color' => '#6B7280',
            'accent_color' => '#10B981',
            'font_family' => 'Inter',
            'dark_mode' => false,
            'maintenance_mode' => false,
            'maintenance_message' => 'Сайт временно недоступен. Мы работаем над улучшениями.',
            'custom_css' => [],
            'layout_config' => [
                'header' => [
                    'show_logo' => true,
                    'show_menu' => true,
                    'show_search' => false,
                ],
                'footer' => [
                    'show_links' => true,
                    'show_social' => true,
                    'show_copyright' => true,
                ],
                'sidebar' => [
                    'enabled' => false,
                    'position' => 'left',
                ],
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
                'telegram_bot_token' => null,
                'telegram_chat_id' => null,
            ],
            'payment_settings' => $this->resolveDefaultPaymentSettings(),
            'notification_settings' => $this->getDefaultNotificationSettings(),
            'advanced_layout_config' => [],
            'seo_settings' => [
                'meta_title_template' => '{name} - {type_name}',
                'meta_description_template' => '{description}',
                'sitemap_enabled' => true,
                'robots_default' => 'index,follow',
                'schema_markup_enabled' => true,
            ],
            'social_media_settings' => [],
            'analytics_settings' => [
                'google_analytics_id' => null,
                'yandex_metrica_id' => null,
                'facebook_pixel_id' => null,
            ],
            'security_settings' => [
                'two_factor_auth' => false,
                'ip_whitelist' => [],
                'rate_limiting' => true,
            ],
            'backup_settings' => [
                'auto_backup' => false,
                'backup_frequency' => 'daily',
                'retention_days' => 30,
            ],
            'external_integrations' => [],
            'advanced_notification_settings' => [
                'email_templates' => [],
                'sms_templates' => [],
                'push_templates' => [],
            ],
            'theme_settings' => [
                'custom_colors' => [],
                'custom_fonts' => [],
                'custom_styles' => [],
            ],
            'performance_settings' => [
                'cache_enabled' => true,
                'compression_enabled' => true,
                'minification_enabled' => true,
            ],
            'settings_metadata' => [
                'last_updated' => now()->toISOString(),
                'updated_by' => Auth::check() ? Auth::id() : null,
                'version' => '1.0.0',
            ],
        ]);
    }

    /**
     * Получить настройки платежей по умолчанию
     */
    public function getDefaultPaymentSettings(): array
    {
        return $this->resolveDefaultPaymentSettings();
    }

    private function resolveDefaultPaymentSettings(): array
    {
        $defaults = $this->globalSettingsService->getDefaultOrganizationSettings()['payment'] ?? [];

        if (!is_array($defaults) || empty($defaults)) {
            $defaults = [
                'enabled_gateways' => ['yookassa'],
                'currency' => 'RUB',
                'test_mode' => true,
                'donation_min_amount' => 100,
                'donation_max_amount' => 0,
                'credentials' => [],
            ];
        }

        $normalized = $this->paymentSettingsNormalizer->normalize($defaults);

        if (!isset($normalized['credentials']) || !is_array($normalized['credentials'])) {
            $normalized['credentials'] = [];
        }

        if (!isset($normalized['options']) || !is_array($normalized['options'])) {
            $normalized['options'] = [];
        }

        return $normalized;
    }

    /**
     * Получить настройки уведомлений по умолчанию
     */
    private function getDefaultNotificationSettings(): array
    {
        return [
            'email_notifications' => true,
            'telegram_notifications' => false,
            'donation_notifications' => true,
            'member_registration_notifications' => true,
            'project_update_notifications' => true,
            'news_notifications' => false,
            'sms_notifications' => false,
            'push_notifications' => true,
        ];
    }

    /**
     * Получить настройки по типу организации
     */
    public function getSettingsByType(string $type): array
    {
        $types = $this->getOrganizationTypes();
        $typeConfig = collect($types)->firstWhere('value', $type);

        if (!$typeConfig) {
            return $this->getDefaultSettingsByType();
        }

        return [
            'features' => $typeConfig['features'] ?? [],
            'categories' => $typeConfig['categories'] ?? [],
            'member_type' => $typeConfig['member_type'] ?? 'member',
            'member_name' => $typeConfig['member_name'] ?? 'Участник',
            'member_plural' => $typeConfig['member_plural'] ?? 'Участники',
            'domain_prefix' => $typeConfig['domain_prefix'] ?? $type . 's',
        ];
    }

    /**
     * Получить настройки по умолчанию для типа
     */
    private function getDefaultSettingsByType(): array
    {
        return [
            'features' => ['basic'],
            'categories' => ['general' => 'Общее'],
            'member_type' => 'member',
            'member_name' => 'Участник',
            'member_plural' => 'Участники',
            'domain_prefix' => 'organizations',
        ];
    }

    /**
     * Очистить кеш настроек
     */
    public function clearCache(Organization $organization): void
    {
        Cache::forget("organization_settings_{$organization->id}");
    }

    /**
     * Очистить весь кеш настроек
     */
    public function clearAllCache(): void
    {
        Cache::forget('organization_types');
    }
}
