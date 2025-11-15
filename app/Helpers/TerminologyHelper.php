<?php

namespace App\Helpers;

use App\Services\GlobalSettingsService;

class TerminologyHelper
{
    private static $service;

    /**
     * Безопасно получить термин из указанного раздела с фолбэками
     */
    private static function getTerm(string $section, array $keys, string $default): string
    {
        $terminology = self::terminology();
        $sectionData = $terminology[$section] ?? [];

        foreach ($keys as $key) {
            if (array_key_exists($key, $sectionData) && $sectionData[$key] !== null && $sectionData[$key] !== '') {
                return $sectionData[$key];
            }
        }

        return $default;
    }

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
     * Получить текст с правильной терминологией
     */
    public static function text(string $key, array $params = []): string
    {
        return self::getService()->getText($key, $params);
    }

    /**
     * Получить правильную форму организации для числа
     */
    public static function organization(int $count): string
    {
        return self::getService()->getOrganizationForm($count);
    }

    /**
     * Получить правильную форму члена для числа
     */
    public static function member(int $count): string
    {
        return self::getService()->getMemberForm($count);
    }

    /**
     * Получить терминологию
     */
    public static function terminology(): array
    {
        return self::getService()->getTerminology();
    }

    /**
     * Получить настройки системы
     */
    public static function system(): array
    {
        return self::getService()->getSystemSettings();
    }

    /**
     * Проверить включена ли функция
     */
    public static function isFeatureEnabled(string $feature): bool
    {
        return self::getService()->isFeatureEnabled($feature);
    }

    /**
     * Получить настройку системы
     */
    public static function systemSetting(string $key, $default = null)
    {
        return self::getService()->getSystemSetting($key, $default);
    }

    /**
     * Быстрые методы для часто используемых терминов
     */
    public static function orgSingular(): string
    {
        return self::getTerm('organization', ['singular_nominative', 'singular'], 'Организация');
    }

    public static function orgPlural(): string
    {
        return self::getTerm('organization', ['plural_nominative', 'plural'], 'Организации');
    }

    public static function orgGenitive(): string
    {
        return self::getTerm(
            'organization',
            ['plural_genitive', 'singular_genitive', 'genitive'],
            'организаций'
        );
    }

    public static function memberSingular(): string
    {
        return self::getTerm('member', ['singular_nominative', 'singular'], 'участник');
    }

    public static function memberPlural(): string
    {
        return self::getTerm('member', ['plural_nominative', 'plural'], 'участники');
    }

    public static function memberGenitive(): string
    {
        return self::getTerm('member', ['plural_genitive', 'singular_genitive', 'genitive'], 'участников');
    }

    public static function actionJoin(): string
    {
        return self::getTerm('actions', ['join'], 'Присоединиться');
    }

    public static function actionLeave(): string
    {
        return self::getTerm('actions', ['leave'], 'Покинуть');
    }

    public static function actionSupport(): string
    {
        return self::getTerm('actions', ['support'], 'Поддержать');
    }

    /**
     * Получить название системы
     */
    public static function systemName(): string
    {
        return self::system()['name'];
    }

    /**
     * Получить описание системы
     */
    public static function systemDescription(): string
    {
        return self::system()['description'];
    }
}
