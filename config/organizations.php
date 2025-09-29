<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Organization Types
    |--------------------------------------------------------------------------
    |
    | Here you can define different types of organizations that the system
    | can handle. Each type can have its own configuration, terminology,
    | and features.
    |
    */

    'types' => [
        'school' => [
            'name' => 'Школа',
            'plural' => 'Школы',
            'member_type' => 'alumni',
            'member_name' => 'Выпускник',
            'member_plural' => 'Выпускники',
            'domain_prefix' => 'schools',
            'features' => [
                'graduation_years',
                'classes',
                'alumni_directory',
                'achievements',
            ],
            'categories' => [
                'construction' => 'Строительство',
                'equipment' => 'Оборудование',
                'sports' => 'Спорт',
                'education' => 'Образование',
                'charity' => 'Благотворительность',
                'events' => 'Мероприятия',
            ],
        ],

        'shelter' => [
            'name' => 'Приют',
            'plural' => 'Приюты',
            'member_type' => 'beneficiary',
            'member_name' => 'Подопечный',
            'member_plural' => 'Подопечные',
            'domain_prefix' => 'shelters',
            'features' => [
                'animals',
                'medical_records',
                'adoption',
                'volunteers',
            ],
            'categories' => [
                'medical' => 'Медицинская помощь',
                'food' => 'Питание',
                'equipment' => 'Оборудование',
                'construction' => 'Строительство',
                'social' => 'Социальная помощь',
                'charity' => 'Благотворительность',
            ],
        ],

        'hospital' => [
            'name' => 'Больница',
            'plural' => 'Больницы',
            'member_type' => 'patient',
            'member_name' => 'Пациент',
            'member_plural' => 'Пациенты',
            'domain_prefix' => 'hospitals',
            'features' => [
                'medical_records',
                'treatments',
                'staff_directory',
                'departments',
            ],
            'categories' => [
                'medical' => 'Медицинское оборудование',
                'construction' => 'Строительство',
                'education' => 'Образование персонала',
                'research' => 'Исследования',
                'charity' => 'Благотворительность',
                'social' => 'Социальная помощь',
            ],
        ],

        'charity' => [
            'name' => 'Благотворительная организация',
            'plural' => 'Благотворительные организации',
            'member_type' => 'beneficiary',
            'member_name' => 'Подопечный',
            'member_plural' => 'Подопечные',
            'domain_prefix' => 'charities',
            'features' => [
                'programs',
                'beneficiaries',
                'volunteers',
                'impact_tracking',
            ],
            'categories' => [
                'social' => 'Социальная помощь',
                'medical' => 'Медицинская помощь',
                'education' => 'Образование',
                'environmental' => 'Экология',
                'charity' => 'Благотворительность',
                'events' => 'Мероприятия',
            ],
        ],

        'foundation' => [
            'name' => 'Фонд',
            'plural' => 'Фонды',
            'member_type' => 'beneficiary',
            'member_name' => 'Получатель помощи',
            'member_plural' => 'Получатели помощи',
            'domain_prefix' => 'foundations',
            'features' => [
                'grants',
                'programs',
                'impact_tracking',
                'research',
            ],
            'categories' => [
                'research' => 'Исследования',
                'education' => 'Образование',
                'medical' => 'Медицина',
                'environmental' => 'Экология',
                'social' => 'Социальная помощь',
                'charity' => 'Благотворительность',
            ],
        ],

        'ngo' => [
            'name' => 'НКО',
            'plural' => 'НКО',
            'member_type' => 'member',
            'member_name' => 'Участник',
            'member_plural' => 'Участники',
            'domain_prefix' => 'ngos',
            'features' => [
                'projects',
                'volunteers',
                'advocacy',
                'community',
            ],
            'categories' => [
                'advocacy' => 'Адвокация',
                'education' => 'Образование',
                'environmental' => 'Экология',
                'social' => 'Социальная помощь',
                'humanitarian' => 'Гуманитарная помощь',
                'research' => 'Исследования',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Organization Type
    |--------------------------------------------------------------------------
    |
    | The default organization type when creating new organizations.
    |
    */

    'default_type' => 'school',

    /*
    |--------------------------------------------------------------------------
    | Domain Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for organization domains and subdomains.
    |
    */

    'domains' => [
        'base_domain' => env('ORGANIZATION_BASE_DOMAIN', 'organizations.loc'),
        'ssl_enabled' => env('ORGANIZATION_SSL_ENABLED', true),
        'auto_ssl' => env('ORGANIZATION_AUTO_SSL', true),
        'custom_domains_enabled' => env('ORGANIZATION_CUSTOM_DOMAINS_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Configuration
    |--------------------------------------------------------------------------
    |
    | Default payment settings for organizations.
    |
    */

    'payments' => [
        'default_currency' => 'RUB',
        'min_donation_amount' => 100, // копейки
        'max_donation_amount' => 100000000, // копейки (1 млн рублей)
        'commission_percentage' => 0, // процент комиссии
        'payment_methods' => [
            'card' => 'Банковская карта',
            'sbp' => 'Система быстрых платежей',
            'yoomoney' => 'ЮMoney',
            'qiwi' => 'QIWI',
            'webmoney' => 'WebMoney',
            'bank_transfer' => 'Банковский перевод',
            'cash' => 'Наличные',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Media Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for file uploads and media management.
    |
    */

    'media' => [
        'max_file_size' => 2048, // KB
        'allowed_image_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'allowed_document_types' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
        'allowed_video_types' => ['mp4', 'avi', 'mov'],
        'storage_disk' => 'public',
        'image_quality' => 85,
        'thumbnail_sizes' => [
            'small' => [150, 150],
            'medium' => [300, 300],
            'large' => [600, 600],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | SEO Configuration
    |--------------------------------------------------------------------------
    |
    | Default SEO settings for organizations.
    |
    */

    'seo' => [
        'default_meta_title_template' => '{name} - {type_name}',
        'default_meta_description_template' => '{description}',
        'sitemap_enabled' => true,
        'robots_default' => 'index,follow',
        'schema_markup_enabled' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Statistics Configuration
    |--------------------------------------------------------------------------
    |
    | Settings for organization statistics and analytics.
    |
    */

    'statistics' => [
        'retention_days' => 365,
        'real_time_tracking' => true,
        'track_donations' => true,
        'track_views' => true,
        'track_events' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notification Configuration
    |--------------------------------------------------------------------------
    |
    | Default notification settings for organizations.
    |
    */

    'notifications' => [
        'email_donations' => true,
        'email_new_members' => true,
        'email_new_projects' => true,
        'email_news_updates' => true,
        'sms_donations' => false,
        'push_notifications' => true,
    ],
];
