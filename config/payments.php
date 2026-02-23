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

        // Конфигурация webhook для каждого шлюза
        'gateways' => [
            'sbp' => [
                'url' => '/api/webhooks/sbp',
                'secret' => env('SBP_WEBHOOK_SECRET'),
                'verify_signature' => true,
            ],
            'yookassa' => [
                'url' => '/api/webhooks/yookassa',
                'secret' => env('YOOKASSA_WEBHOOK_SECRET'),
                'verify_signature' => true,
            ],
            'tinkoff' => [
                'url' => '/api/webhooks/tinkoff',
                'secret' => env('TINKOFF_WEBHOOK_SECRET'),
                'verify_signature' => true,
            ],
        ],
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

        // Дополнительные настройки уведомлений
        'settings' => [
            'notify_on_success' => true,
            'notify_on_failure' => true,
            'notify_on_refund' => true,
            'notify_admin_on_errors' => true,
            'notify_donor_on_success' => true,
        ],
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

        // Дополнительные настройки безопасности
        'encryption' => [
            'enabled' => env('PAYMENT_ENCRYPTION_ENABLED', true),
            'key' => env('PAYMENT_ENCRYPTION_KEY'),
        ],

        'cors' => [
            'enabled' => env('PAYMENT_CORS_ENABLED', true),
            'allowed_origins' => env('PAYMENT_CORS_ORIGINS', '*'),
        ],
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

        // Дополнительные настройки логирования
        'channels' => [
            'payment' => 'daily',
            'webhook' => 'daily',
            'error' => 'single',
        ],
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

        // Дополнительные интеграции
        'analytics' => [
            'google_analytics_enabled' => env('PAYMENT_GA_ENABLED', false),
            'google_analytics_id' => env('PAYMENT_GA_ID', ''),
            'yandex_metrika_enabled' => env('PAYMENT_YM_ENABLED', false),
            'yandex_metrika_id' => env('PAYMENT_YM_ID', ''),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Methods Configuration
    |--------------------------------------------------------------------------
    |
    | Здесь настраиваются доступные способы оплаты для системы.
    | Каждый метод может иметь свои настройки и параметры.
    |
    */

    'methods' => [
        'yookassa' => [
            'name' => 'ЮKassa',
            'description' => 'Платежная система ЮKassa (Яндекс.Касса)',
            'icon' => 'yookassa',
            'enabled' => env('YOOKASSA_ENABLED', true),
            'test_mode' => env('YOOKASSA_TEST_MODE', true),
            'shop_id' => env('YOOKASSA_SHOP_ID', ''),
            'secret_key' => env('YOOKASSA_SECRET_KEY', ''),
            'webhook_url' => env('YOOKASSA_WEBHOOK_URL'),
            'supported_currencies' => ['RUB'],
            'min_amount' => 1, // 1 копейка
            'max_amount' => 999999999, // 9,999,999.99 рублей
            'fee_percentage' => 2.9, // 2.9%
            'fee_fixed' => 0, // 0 копеек
        ],

        'sberbank' => [
            'name' => 'Сбербанк',
            'description' => 'Платежная система Сбербанка',
            'icon' => 'sberbank',
            'enabled' => env('SBERBANK_ENABLED', false),
            'test_mode' => env('SBERBANK_TEST_MODE', true),
            'merchant_id' => env('SBERBANK_MERCHANT_ID', ''),
            'api_key' => env('SBERBANK_API_KEY', ''),
            'supported_currencies' => ['RUB'],
            'min_amount' => 100, // 1 рубль
            'max_amount' => 999999999,
            'fee_percentage' => 2.5,
            'fee_fixed' => 0,
        ],

        'tinkoff' => [
            'name' => 'Тинькофф',
            'description' => 'Платежная система Тинькофф',
            'icon' => 'tinkoff',
            'enabled' => env('TINKOFF_ENABLED', true),
            'test_mode' => env('TINKOFF_TEST_MODE', true),
            'terminal_key' => env('TINKOFF_TERMINAL_KEY', ''),
            'password' => env('TINKOFF_PASSWORD', ''),
            'api_url_test' => 'https://rest-api-test.tinkoff.ru/v2',
            'api_url_production' => 'https://securepay.tinkoff.ru/v2',
            'supported_currencies' => ['RUB'],
            'min_amount' => 100,
            'max_amount' => 999999999,
            'fee_percentage' => 2.0,
            'fee_fixed' => 0,
        ],

        'sbp' => [
            'name' => 'Система быстрых платежей',
            'description' => 'СБП - Система быстрых платежей',
            'icon' => 'sbp',
            'enabled' => env('SBP_ENABLED', true),
            'test_mode' => env('SBP_TEST_MODE', true),
            'merchant_id' => env('SBP_MERCHANT_ID', ''),
            'secret_key' => env('SBP_SECRET_KEY', ''),
            'api_url_test' => 'https://api.sbp.nspk.ru/test/payment',
            'api_url_production' => 'https://api.sbp.nspk.ru/payment',
            'supported_currencies' => ['RUB'],
            'min_amount' => 100,
            'max_amount' => 999999999,
            'fee_percentage' => 0.0,
            'fee_fixed' => 0,
        ],

        'paypal' => [
            'name' => 'PayPal',
            'description' => 'Международная платежная система PayPal',
            'icon' => 'paypal',
            'enabled' => env('PAYPAL_ENABLED', false),
            'test_mode' => env('PAYPAL_TEST_MODE', true),
            'client_id' => env('PAYPAL_CLIENT_ID', ''),
            'client_secret' => env('PAYPAL_CLIENT_SECRET', ''),
            'supported_currencies' => ['USD', 'EUR', 'RUB'],
            'min_amount' => 100, // $1.00
            'max_amount' => 999999999,
            'fee_percentage' => 3.4,
            'fee_fixed' => 35, // $0.35
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Payment Settings (Legacy)
    |--------------------------------------------------------------------------
    |
    | Настройки по умолчанию для платежей (для обратной совместимости)
    |
    */

    'defaults' => [
        'currency' => env('PAYMENT_DEFAULT_CURRENCY', 'RUB'),
        'min_amount' => env('PAYMENT_MIN_AMOUNT', 100), // 1 рубль в копейках
        'max_amount' => env('PAYMENT_MAX_AMOUNT', 0), // без ограничений
        'timeout' => env('PAYMENT_TRANSACTION_LIFETIME', 24), // 24 часа
        'auto_capture' => env('PAYMENT_AUTO_CAPTURE', true),
        'save_card' => env('PAYMENT_SAVE_CARD', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Recurring Payments (Autopayments)
    |--------------------------------------------------------------------------
    */
    'recurring' => [
        'enabled' => env('PAYMENT_RECURRING_ENABLED', true),
        'periods' => ['daily', 'weekly', 'monthly'],
        'default_period' => env('PAYMENT_RECURRING_DEFAULT_PERIOD', 'monthly'),
        // Таймаут блокировки крона (минуты) — не запускать повторно, пока предыдущий не завершился
        'cron_lock_minutes' => env('PAYMENT_RECURRING_CRON_LOCK', 65),
        // Тестовый автоплатеж: только для этого номера (раз в сутки или вручную). Пусто = отключено.
        'autopayment_test_phone' => env('AUTOPAYMENT_TEST_PHONE', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Statuses
    |--------------------------------------------------------------------------
    |
    | Возможные статусы платежей
    |
    */

    'statuses' => [
        'pending' => 'В ожидании',
        'processing' => 'Обрабатывается',
        'completed' => 'Завершен',
        'failed' => 'Неуспешен',
        'cancelled' => 'Отменен',
        'refunded' => 'Возвращен',
        'partially_refunded' => 'Частично возвращен',
    ],

    /*
    |--------------------------------------------------------------------------
    | Commission Settings
    |--------------------------------------------------------------------------
    |
    | Настройки комиссий для различных платежных систем
    |
    */

    'commissions' => [
        'organization' => [
            'fee_percentage' => env('PAYMENT_ORGANIZATION_FEE_PERCENTAGE', 2.0), // 2% комиссия платформы
            'fee_fixed' => env('PAYMENT_ORGANIZATION_FEE_FIXED', 0), // 0 копеек фиксированная комиссия
            'min_commission' => env('PAYMENT_MIN_COMMISSION', 100), // минимум 1 рубль
            'max_commission' => env('PAYMENT_MAX_COMMISSION', 100000), // максимум 1000 рублей
        ],
        'payment_provider' => [
            'yookassa' => [
                'fee_percentage' => 2.9,
                'fee_fixed' => 0,
            ],
            'sberbank' => [
                'fee_percentage' => 2.5,
                'fee_fixed' => 0,
            ],
            'tinkoff' => [
                'fee_percentage' => 2.0,
                'fee_fixed' => 0,
            ],
            'sbp' => [
                'fee_percentage' => 0.0,
                'fee_fixed' => 0,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Tax Settings
    |--------------------------------------------------------------------------
    |
    | Настройки налогов для платежей
    |
    */

    'tax' => [
        'vat_rate' => env('PAYMENT_VAT_RATE', 0), // 0% НДС для благотворительных пожертвований
        'vat_included' => env('PAYMENT_VAT_INCLUDED', false),
        'tax_id' => env('PAYMENT_TAX_ID', null), // ИНН организации
    ],

    /*
    |--------------------------------------------------------------------------
    | Receipt Settings
    |--------------------------------------------------------------------------
    |
    | Настройки чеков для платежей
    |
    */

    'receipt' => [
        'enabled' => env('PAYMENT_RECEIPT_ENABLED', true),
        'email' => env('PAYMENT_RECEIPT_EMAIL', true),
        'sms' => env('PAYMENT_RECEIPT_SMS', false),
        'print' => env('PAYMENT_RECEIPT_PRINT', false),
        'online' => env('PAYMENT_RECEIPT_ONLINE', true),
        'subject' => env('PAYMENT_RECEIPT_SUBJECT', 'Чек по пожертвованию'),
        'template' => env('PAYMENT_RECEIPT_TEMPLATE', 'emails.payment-receipt'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Refund Settings
    |--------------------------------------------------------------------------
    |
    | Настройки возвратов
    |
    */

    'refund' => [
        'enabled' => env('PAYMENT_REFUND_ENABLED', true),
        'auto_refund' => env('PAYMENT_AUTO_REFUND', false),
        'refund_period_days' => env('PAYMENT_REFUND_PERIOD_DAYS', 30), // Период для возврата в днях
        'partial_refund' => env('PAYMENT_PARTIAL_REFUND', true),
        'admin_approval' => env('PAYMENT_ADMIN_APPROVAL', true),
        'reason_required' => env('PAYMENT_REASON_REQUIRED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics Settings
    |--------------------------------------------------------------------------
    |
    | Настройки аналитики платежей
    |
    */

    'analytics' => [
        'track_conversions' => env('PAYMENT_TRACK_CONVERSIONS', true),
        'track_abandonment' => env('PAYMENT_TRACK_ABANDONMENT', true),
        'track_failures' => env('PAYMENT_TRACK_FAILURES', true),
        'retention_days' => env('PAYMENT_ANALYTICS_RETENTION_DAYS', 365),
        'export_formats' => ['csv', 'excel', 'pdf'],
    ],
];
