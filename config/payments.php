<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Payment Settings
    |--------------------------------------------------------------------------
    |
    | These options control the default behavior of the payment system.
    |
    */

    'default_currency' => env('PAYMENT_DEFAULT_CURRENCY', 'RUB'),

    'default_timezone' => env('PAYMENT_TIMEZONE', 'Europe/Moscow'),

    /*
    |--------------------------------------------------------------------------
    | Payment Transaction Settings
    |--------------------------------------------------------------------------
    |
    | These options control payment transaction behavior.
    |
    */

    'transaction' => [
        // Время жизни платежа в часах
        'lifetime' => env('PAYMENT_TRANSACTION_LIFETIME', 24),

        // Минимальная сумма платежа в копейках
        'min_amount' => env('PAYMENT_MIN_AMOUNT', 100), // 1 рубль

        // Максимальная сумма платежа в копейках (0 = без ограничений)
        'max_amount' => env('PAYMENT_MAX_AMOUNT', 0),

        // Автоматическое создание доната после успешного платежа
        'auto_create_donation' => env('PAYMENT_AUTO_CREATE_DONATION', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment gateways.
    |
    */

    'gateways' => [
        'sbp' => [
            'enabled' => env('SBP_ENABLED', true),
            'test_mode' => env('SBP_TEST_MODE', true),
            'merchant_id' => env('SBP_MERCHANT_ID', ''),
            'secret_key' => env('SBP_SECRET_KEY', ''),
            'api_url_test' => 'https://api.sbp.nspk.ru/test/payment',
            'api_url_production' => 'https://api.sbp.nspk.ru/payment',
        ],

        'yookassa' => [
            'enabled' => env('YOOKASSA_ENABLED', true),
            'test_mode' => env('YOOKASSA_TEST_MODE', true),
            'shop_id' => env('YOOKASSA_SHOP_ID', ''),
            'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
            'api_url' => 'https://api.yookassa.ru/v3',
        ],

        'tinkoff' => [
            'enabled' => env('TINKOFF_ENABLED', true),
            'test_mode' => env('TINKOFF_TEST_MODE', true),
            'terminal_key' => env('TINKOFF_TERMINAL_KEY', ''),
            'password' => env('TINKOFF_PASSWORD', ''),
            'api_url_test' => 'https://rest-api-test.tinkoff.ru/v2',
            'api_url_production' => 'https://securepay.tinkoff.ru/v2',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Webhook Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for webhook handling.
    |
    */

    'webhooks' => [
        // Включить логирование всех webhook'ов
        'log_all' => env('PAYMENT_WEBHOOK_LOG_ALL', true),

        // Время ожидания ответа от webhook'а в секундах
        'timeout' => env('PAYMENT_WEBHOOK_TIMEOUT', 30),

        // Максимальное количество попыток обработки webhook'а
        'max_attempts' => env('PAYMENT_WEBHOOK_MAX_ATTEMPTS', 3),

        // Время между попытками в секундах
        'retry_delay' => env('PAYMENT_WEBHOOK_RETRY_DELAY', 60),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment notifications.
    |
    */

    'notifications' => [
        // Включить уведомления по email
        'email_enabled' => env('PAYMENT_EMAIL_NOTIFICATIONS', true),

        // Включить уведомления в Telegram
        'telegram_enabled' => env('PAYMENT_TELEGRAM_NOTIFICATIONS', false),

        // Включить уведомления в Slack
        'slack_enabled' => env('PAYMENT_SLACK_NOTIFICATIONS', false),

        // Email для уведомлений об ошибках
        'error_email' => env('PAYMENT_ERROR_EMAIL', 'admin@example.com'),

        // Telegram bot token
        'telegram_bot_token' => env('PAYMENT_TELEGRAM_BOT_TOKEN', ''),

        // Telegram chat ID
        'telegram_chat_id' => env('PAYMENT_TELEGRAM_CHAT_ID', ''),

        // Slack webhook URL
        'slack_webhook_url' => env('PAYMENT_SLACK_WEBHOOK_URL', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment security.
    |
    */

    'security' => [
        // Включить проверку IP адресов для webhook'ов
        'check_webhook_ips' => env('PAYMENT_CHECK_WEBHOOK_IPS', false),

        // Разрешенные IP адреса для webhook'ов
        'allowed_webhook_ips' => [
            // SBP
            '185.71.76.0/27',
            '185.71.77.0/27',
            '77.75.153.0/25',
            '77.75.156.11',
            '77.75.156.35',
            '2a02:5180::/32',

            // ЮKassa
            '185.71.76.0/27',
            '185.71.77.0/27',
            '77.75.153.0/25',
            '77.75.156.11',
            '77.75.156.35',
            '2a02:5180::/32',

            // Тинькофф
            '91.194.226.0/24',
            '91.194.227.0/24',
        ],

        // Включить rate limiting для API платежей
        'rate_limit_enabled' => env('PAYMENT_RATE_LIMIT_ENABLED', true),

        // Максимальное количество запросов в минуту
        'rate_limit_requests' => env('PAYMENT_RATE_LIMIT_REQUESTS', 60),

        // Максимальное количество запросов в час
        'rate_limit_hourly' => env('PAYMENT_RATE_LIMIT_HOURLY', 1000),
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for payment logging.
    |
    */

    'logging' => [
        // Включить детальное логирование
        'detailed_logging' => env('PAYMENT_DETAILED_LOGGING', true),

        // Включить логирование всех запросов к API
        'log_api_requests' => env('PAYMENT_LOG_API_REQUESTS', true),

        // Включить логирование всех ответов от шлюзов
        'log_gateway_responses' => env('PAYMENT_LOG_GATEWAY_RESPONSES', true),

        // Включить логирование webhook'ов
        'log_webhooks' => env('PAYMENT_LOG_WEBHOOKS', true),

        // Максимальный размер лога в байтах
        'max_log_size' => env('PAYMENT_MAX_LOG_SIZE', 10485760), // 10MB

        // Количество дней хранения логов
        'log_retention_days' => env('PAYMENT_LOG_RETENTION_DAYS', 30),
    ],

    /*
    |--------------------------------------------------------------------------
    | Integration Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for external integrations.
    |
    */

    'integrations' => [
        // Включить интеграцию с 1C
        '1c_enabled' => env('PAYMENT_1C_ENABLED', false),

        // URL для отправки данных в 1C
        '1c_webhook_url' => env('PAYMENT_1C_WEBHOOK_URL', ''),

        // API ключ для 1C
        '1c_api_key' => env('PAYMENT_1C_API_KEY', ''),

        // Включить интеграцию с CRM
        'crm_enabled' => env('PAYMENT_CRM_ENABLED', false),

        // URL для отправки данных в CRM
        'crm_webhook_url' => env('PAYMENT_CRM_WEBHOOK_URL', ''),

        // API ключ для CRM
        'crm_api_key' => env('PAYMENT_CRM_API_KEY', ''),
    ],
];
