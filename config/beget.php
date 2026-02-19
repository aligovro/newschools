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
    | ID сайта в Beget, к которому привязываются домены.
    | Получить: site/getList → result[*].id
    */
    'site_id' => env('BEGET_SITE_ID'),

    /*
    | ID основного домена для создания поддоменов (если потребуется).
    | Получить: domain/getList → result[*].id
    */
    'main_domain_id' => env('BEGET_MAIN_DOMAIN_ID'),

    'timeout' => env('BEGET_TIMEOUT', 30),
];
