<?php

namespace App\Helpers;

use App\Services\GlobalSettingsService;

class DeclensionHelper
{
    private static $service;

    /**
     * Получить сервис настроек
     */
    private static function getService(): GlobalSettingsService
    {
        if (!self::$service) {
            self::$service = app(GlobalSettingsService::class);
        }

        return self::$service;
    }

    /**
     * Получить склонение организации
     */
    public static function organization(string $case, int $number = 1): string
    {
        $settings = self::getService()->getSettings();
        $isPlural = $number > 1;

        $prefix = $isPlural ? 'org_plural' : 'org_singular';

        return $settings->{"{$prefix}_{$case}"} ?? $settings->org_singular_nominative;
    }

    /**
     * Получить склонение участника
     */
    public static function member(string $case, int $number = 1): string
    {
        $settings = self::getService()->getSettings();
        $isPlural = $number > 1;

        $prefix = $isPlural ? 'member_plural' : 'member_singular';

        return $settings->{"{$prefix}_{$case}"} ?? $settings->member_singular_nominative;
    }

    /**
     * Получить правильную форму слова для числа
     */
    public static function getPluralForm(int $count, array $forms): string
    {
        $cases = [2, 0, 1, 1, 1, 2];
        $case = $cases[($count % 100 > 4 && $count % 100 < 20) ? 2 : $cases[min($count % 10, 5)]];

        return $forms[$case] ?? $forms[1];
    }

    /**
     * Получить правильную форму организации для числа
     */
    public static function organizationByNumber(int $count): string
    {
        $settings = self::getService()->getSettings();

        return self::getPluralForm($count, [
            2 => $settings->org_plural_nominative, // школы
            0 => $settings->org_plural_genitive,   // школ
            1 => $settings->org_singular_nominative, // школа
        ]);
    }

    /**
     * Получить правильную форму участника для числа
     */
    public static function memberByNumber(int $count): string
    {
        $settings = self::getService()->getSettings();

        return self::getPluralForm($count, [
            2 => $settings->member_plural_nominative, // выпускники
            0 => $settings->member_plural_genitive,   // выпускников
            1 => $settings->member_singular_nominative, // выпускник
        ]);
    }

    /**
     * Получить текст с правильными склонениями
     */
    public static function text(string $key, array $params = []): string
    {
        $settings = self::getService()->getSettings();

        $texts = [
            // Организации
            'organizations_page_title' => "Управление " . $settings->org_plural_instrumental,
            'organizations_page_description' => "Управляйте " . $settings->org_plural_instrumental . " в системе",
            'create_organization' => "Создать " . $settings->org_singular_accusative,
            'organization_created' => $settings->org_singular_nominative . " успешно создана",
            'organization_updated' => $settings->org_singular_nominative . " успешно обновлена",
            'organization_deleted' => $settings->org_singular_nominative . " успешно удалена",
            'no_organizations' => $settings->org_plural_nominative . " не найдены",

            // Члены
            'members_page_title' => "Управление " . $settings->member_plural_instrumental,
            'members_page_description' => "Управляйте " . $settings->member_plural_instrumental . " в системе",
            'member_registered' => $settings->member_singular_nominative . " зарегистрирован",

            // Действия
            'join_organization' => $settings->action_join . " в " . $settings->org_singular_accusative,
            'leave_organization' => $settings->action_leave . " из " . $settings->org_plural_genitive,
            'support_organization' => $settings->action_support . " " . $settings->org_singular_accusative,

            // Система
            'system_name' => $settings->system_name,
            'system_description' => $settings->system_description,
            'dashboard_title' => "Панель управления " . $settings->system_name,

            // Статистика
            'total_organizations' => "Всего " . $settings->org_plural_genitive,
            'total_members' => "Всего " . $settings->member_plural_genitive,
            'recent_organizations' => "Последние " . $settings->org_plural_nominative,
            'recent_members' => "Последние " . $settings->member_plural_nominative,
        ];

        $text = $texts[$key] ?? $key;

        // Заменяем параметры
        foreach ($params as $param => $value) {
            $text = str_replace("{{$param}}", $value, $text);
        }

        return $text;
    }

    /**
     * Быстрые методы для часто используемых склонений
     */

    // Организации
    public static function orgNominative(int $number = 1): string
    {
        return self::organization('nominative', $number);
    }

    public static function orgGenitive(int $number = 1): string
    {
        return self::organization('genitive', $number);
    }

    public static function orgDative(int $number = 1): string
    {
        return self::organization('dative', $number);
    }

    public static function orgAccusative(int $number = 1): string
    {
        return self::organization('accusative', $number);
    }

    public static function orgInstrumental(int $number = 1): string
    {
        return self::organization('instrumental', $number);
    }

    public static function orgPrepositional(int $number = 1): string
    {
        return self::organization('prepositional', $number);
    }

    // Участники
    public static function memberNominative(int $number = 1): string
    {
        return self::member('nominative', $number);
    }

    public static function memberGenitive(int $number = 1): string
    {
        return self::member('genitive', $number);
    }

    public static function memberDative(int $number = 1): string
    {
        return self::member('dative', $number);
    }

    public static function memberAccusative(int $number = 1): string
    {
        return self::member('accusative', $number);
    }

    public static function memberInstrumental(int $number = 1): string
    {
        return self::member('instrumental', $number);
    }

    public static function memberPrepositional(int $number = 1): string
    {
        return self::member('prepositional', $number);
    }
}
