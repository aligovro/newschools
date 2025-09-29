<?php

namespace App\Services;

use App\Models\GlobalSettings;
use Illuminate\Support\Facades\Cache;

class GlobalSettingsService
{
    /**
     * Получить глобальные настройки
     */
    public function getSettings(): GlobalSettings
    {
        return Cache::remember('global_settings', 86400, function () { // Кеш на 24 часа
            return GlobalSettings::instance();
        });
    }

    /**
     * Очистить кеш настроек
     */
    public function clearCache(): void
    {
        Cache::forget('global_settings');
    }

    /**
     * Получить терминологию
     */
    public function getTerminology(): array
    {
        $settings = $this->getSettings();

        return [
            'organization' => [
                // Единственное число
                'singular_nominative' => $settings->org_singular_nominative,
                'singular_genitive' => $settings->org_singular_genitive,
                'singular_dative' => $settings->org_singular_dative,
                'singular_accusative' => $settings->org_singular_accusative,
                'singular_instrumental' => $settings->org_singular_instrumental,
                'singular_prepositional' => $settings->org_singular_prepositional,

                // Множественное число
                'plural_nominative' => $settings->org_plural_nominative,
                'plural_genitive' => $settings->org_plural_genitive,
                'plural_dative' => $settings->org_plural_dative,
                'plural_accusative' => $settings->org_plural_accusative,
                'plural_instrumental' => $settings->org_plural_instrumental,
                'plural_prepositional' => $settings->org_plural_prepositional,
            ],
            'member' => [
                // Единственное число
                'singular_nominative' => $settings->member_singular_nominative,
                'singular_genitive' => $settings->member_singular_genitive,
                'singular_dative' => $settings->member_singular_dative,
                'singular_accusative' => $settings->member_singular_accusative,
                'singular_instrumental' => $settings->member_singular_instrumental,
                'singular_prepositional' => $settings->member_singular_prepositional,

                // Множественное число
                'plural_nominative' => $settings->member_plural_nominative,
                'plural_genitive' => $settings->member_plural_genitive,
                'plural_dative' => $settings->member_plural_dative,
                'plural_accusative' => $settings->member_plural_accusative,
                'plural_instrumental' => $settings->member_plural_instrumental,
                'plural_prepositional' => $settings->member_plural_prepositional,
            ],
            'actions' => [
                'join' => $settings->action_join,
                'leave' => $settings->action_leave,
                'support' => $settings->action_support,
            ],
        ];
    }

    /**
     * Получить настройки системы
     */
    public function getSystemSettings(): array
    {
        $settings = $this->getSettings();

        return [
            'name' => $settings->system_name,
            'description' => $settings->system_description,
            'language' => $settings->default_language,
            'timezone' => $settings->default_timezone,
            'currency' => $settings->default_currency,
            'settings' => $settings->system_settings ?? [],
            'feature_flags' => $settings->feature_flags ?? [],
            'integrations' => $settings->integration_settings ?? [],
        ];
    }

    /**
     * Получить настройки по умолчанию для новых организаций
     */
    public function getDefaultOrganizationSettings(): array
    {
        $settings = $this->getSettings();

        return [
            'organization' => $settings->default_organization_settings ?? [],
            'payment' => $settings->default_payment_settings ?? [],
            'notification' => $settings->default_notification_settings ?? [],
            'seo' => $settings->default_seo_settings ?? [],
        ];
    }

    /**
     * Обновить глобальные настройки
     */
    public function updateSettings(array $data): GlobalSettings
    {
        $settings = $this->getSettings();

        // Обновляем только переданные поля
        $allowedFields = [
            'organization_singular',
            'organization_plural',
            'organization_genitive',
            'organization_dative',
            'organization_instrumental',
            'member_singular',
            'member_plural',
            'member_genitive',
            'action_join',
            'action_leave',
            'action_support',
            'system_name',
            'system_description',
            'default_language',
            'default_timezone',
            'default_currency',
            'default_organization_settings',
            'default_payment_settings',
            'default_notification_settings',
            'system_settings',
            'feature_flags',
            'integration_settings',
            'default_seo_settings',
            'metadata'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $settings->$field = $data[$field];
            }
        }

        $settings->save();

        // Очищаем кеш
        $this->clearCache();

        return $settings;
    }

    /**
     * Получить текст с правильной терминологией
     */
    public function getText(string $key, array $params = []): string
    {
        $terminology = $this->getTerminology();
        $systemSettings = $this->getSystemSettings();

        $texts = [
            // Организации
            'organizations_page_title' => "Управление {$terminology['organization']['plural_instrumental']}",
            'organizations_page_description' => "Управляйте {$terminology['organization']['plural_instrumental']} в системе",
            'create_organization' => "Создать {$terminology['organization']['singular_accusative']}",
            'organization_created' => "{$terminology['organization']['singular_nominative']} успешно создана",
            'organization_updated' => "{$terminology['organization']['singular_nominative']} успешно обновлена",
            'organization_deleted' => "{$terminology['organization']['singular_nominative']} успешно удалена",
            'no_organizations' => "{$terminology['organization']['plural_nominative']} не найдены",

            // Члены
            'members_page_title' => "Управление {$terminology['member']['plural_instrumental']}",
            'members_page_description' => "Управляйте {$terminology['member']['plural_instrumental']} в системе",
            'member_registered' => "{$terminology['member']['singular_nominative']} зарегистрирован",

            // Действия
            'join_organization' => "{$terminology['actions']['join']} в {$terminology['organization']['singular_accusative']}",
            'leave_organization' => "{$terminology['actions']['leave']} из {$terminology['organization']['plural_genitive']}",
            'support_organization' => "{$terminology['actions']['support']} {$terminology['organization']['singular_accusative']}",

            // Система
            'system_name' => $systemSettings['name'],
            'system_description' => $systemSettings['description'],
            'dashboard_title' => "Панель управления {$systemSettings['name']}",

            // Статистика
            'total_organizations' => "Всего {$terminology['organization']['plural_genitive']}",
            'total_members' => "Всего {$terminology['member']['plural_genitive']}",
            'recent_organizations' => "Последние {$terminology['organization']['plural_nominative']}",
            'recent_members' => "Последние {$terminology['member']['plural_nominative']}",
        ];

        $text = $texts[$key] ?? $key;

        // Заменяем параметры
        foreach ($params as $param => $value) {
            $text = str_replace("{{$param}}", $value, $text);
        }

        return $text;
    }

    /**
     * Получить правильную форму слова для числа
     */
    public function getPluralForm(int $count, array $forms): string
    {
        $terminology = $this->getTerminology();

        $cases = [2, 0, 1, 1, 1, 2];
        $case = $cases[($count % 100 > 4 && $count % 100 < 20) ? 2 : $cases[min($count % 10, 5)]];

        return $forms[$case] ?? $forms[1];
    }

    /**
     * Получить правильную форму организации для числа
     */
    public function getOrganizationForm(int $count): string
    {
        $terminology = $this->getTerminology();

        return $this->getPluralForm($count, [
            2 => $terminology['organization']['plural'], // школы
            0 => $terminology['organization']['genitive'], // школ
            1 => $terminology['organization']['singular'], // школа
        ]);
    }

    /**
     * Получить правильную форму члена для числа
     */
    public function getMemberForm(int $count): string
    {
        $terminology = $this->getTerminology();

        return $this->getPluralForm($count, [
            2 => $terminology['member']['plural'], // выпускники
            0 => $terminology['member']['genitive'], // выпускников
            1 => $terminology['member']['singular'], // выпускник
        ]);
    }

    /**
     * Проверить включена ли функция
     */
    public function isFeatureEnabled(string $feature): bool
    {
        $settings = $this->getSettings();
        $featureFlags = $settings->feature_flags ?? [];

        return $featureFlags[$feature] ?? false;
    }

    /**
     * Получить настройку системы
     */
    public function getSystemSetting(string $key, $default = null)
    {
        $settings = $this->getSettings();
        $systemSettings = $settings->system_settings ?? [];

        return $systemSettings[$key] ?? $default;
    }

    /**
     * Сбросить настройки к значениям по умолчанию
     */
    public function resetToDefaults(): GlobalSettings
    {
        // Удаляем текущие настройки
        GlobalSettings::truncate();

        // Очищаем кеш
        $this->clearCache();

        // Создаем новые настройки по умолчанию
        return GlobalSettings::createDefault();
    }
}
