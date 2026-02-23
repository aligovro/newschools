<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Beget API Configuration
    |--------------------------------------------------------------------------
    |
    | Настройки для интеграции с Beget API (домены, привязка к сайту).
    | API-пароль настраивается в панели Beget: Настройки → Доступ к API.
    |
    */

    'base_url' => env('BEGET_API_URL', 'https://api.beget.com/api'),
    'login' => env('BEGET_LOGIN'),
    'password' => env('BEGET_PASSWORD'),

    /*
    | ID сайта в Beget (только для хостинга). На VPS оставьте пустым — привязка только в БД, nginx вручную.
    | Получить на хостинге: php artisan beget:status (site/getList).
    */
    'site_id' => env('BEGET_SITE_ID'),

    /*
    | ID основного домена для создания поддоменов (если потребуется).
    | Получить: domain/getList → result[*].id
    */
    'main_domain_id' => env('BEGET_MAIN_DOMAIN_ID'),

    'timeout' => env('BEGET_TIMEOUT', 30),

    /*
    | Проверять SSL при запросах к api.beget.com.
    | На Windows без настроенного CA-буфера можно отключить (false) только для локальной разработки.
    */
    'verify_ssl' => filter_var(env('BEGET_VERIFY_SSL', true), FILTER_VALIDATE_BOOLEAN),

    /*
    | Включена ли интеграция (есть логин и пароль).
    */
    'enabled' => (bool) (env('BEGET_LOGIN') && env('BEGET_PASSWORD')),

    /*
    | Домены, которые не показывать в выборе для привязки к сайту (например главный домен системы).
    | По умолчанию берётся хост из APP_URL; при необходимости задайте через env BEGET_EXCLUDE_DOMAINS (через запятую).
    */
    'exclude_domains' => array_filter(array_map('trim', explode(',', env('BEGET_EXCLUDE_DOMAINS', '')))),
    'exclude_main_domain_from_app_url' => filter_var(env('BEGET_EXCLUDE_MAIN_DOMAIN', true), FILTER_VALIDATE_BOOLEAN),

    /*
    | Сообщения для дашборда (без хардкода в коде).
    */
    'messages' => [
        'not_configured' => 'Beget API не настроен. Укажите BEGET_LOGIN и BEGET_PASSWORD в .env.',
        'unavailable' => 'Beget API недоступен. Проверьте учётные данные и доступ к API.',
        'vps_hint' => 'Режим VPS: привязка только в БД. Настройте nginx на сервере для выбранного домена вручную.',
    ],
];
