<?php

use App\Helpers\DeclensionHelper;
use App\Helpers\TerminologyHelper;

if (!function_exists('__t')) {
    /**
     * Получить текст с правильной терминологией
     */
    function __t(string $key, array $params = []): string
    {
        return DeclensionHelper::text($key, $params);
    }
}

if (!function_exists('org')) {
    /**
     * Получить правильную форму организации для числа
     */
    function org(int $count): string
    {
        return DeclensionHelper::organizationByNumber($count);
    }
}

if (!function_exists('member')) {
    /**
     * Получить правильную форму члена для числа
     */
    function member(int $count): string
    {
        return DeclensionHelper::memberByNumber($count);
    }
}

// Организации - склонения
if (!function_exists('org_nominative')) {
    function org_nominative(int $number = 1): string
    {
        return DeclensionHelper::orgNominative($number);
    }
}

if (!function_exists('org_genitive')) {
    function org_genitive(int $number = 1): string
    {
        return DeclensionHelper::orgGenitive($number);
    }
}

if (!function_exists('org_dative')) {
    function org_dative(int $number = 1): string
    {
        return DeclensionHelper::orgDative($number);
    }
}

if (!function_exists('org_accusative')) {
    function org_accusative(int $number = 1): string
    {
        return DeclensionHelper::orgAccusative($number);
    }
}

if (!function_exists('org_instrumental')) {
    function org_instrumental(int $number = 1): string
    {
        return DeclensionHelper::orgInstrumental($number);
    }
}

if (!function_exists('org_prepositional')) {
    function org_prepositional(int $number = 1): string
    {
        return DeclensionHelper::orgPrepositional($number);
    }
}

// Участники - склонения
if (!function_exists('member_nominative')) {
    function member_nominative(int $number = 1): string
    {
        return DeclensionHelper::memberNominative($number);
    }
}

if (!function_exists('member_genitive')) {
    function member_genitive(int $number = 1): string
    {
        return DeclensionHelper::memberGenitive($number);
    }
}

if (!function_exists('member_dative')) {
    function member_dative(int $number = 1): string
    {
        return DeclensionHelper::memberDative($number);
    }
}

if (!function_exists('member_accusative')) {
    function member_accusative(int $number = 1): string
    {
        return DeclensionHelper::memberAccusative($number);
    }
}

if (!function_exists('member_instrumental')) {
    function member_instrumental(int $number = 1): string
    {
        return DeclensionHelper::memberInstrumental($number);
    }
}

if (!function_exists('member_prepositional')) {
    function member_prepositional(int $number = 1): string
    {
        return DeclensionHelper::memberPrepositional($number);
    }
}

// Обратная совместимость
if (!function_exists('org_singular')) {
    function org_singular(): string
    {
        return org_nominative(1);
    }
}

if (!function_exists('org_plural')) {
    function org_plural(): string
    {
        return org_nominative(2);
    }
}

if (!function_exists('member_singular')) {
    function member_singular(): string
    {
        return member_nominative(1);
    }
}

if (!function_exists('member_plural')) {
    function member_plural(): string
    {
        return member_nominative(2);
    }
}

if (!function_exists('system_name')) {
    /**
     * Получить название системы
     */
    function system_name(): string
    {
        return TerminologyHelper::systemName();
    }
}

if (!function_exists('feature_enabled')) {
    /**
     * Проверить включена ли функция
     */
    function feature_enabled(string $feature): bool
    {
        return TerminologyHelper::isFeatureEnabled($feature);
    }
}
