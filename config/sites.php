<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Site Templates
    |--------------------------------------------------------------------------
    |
    | Configuration for site templates and their default settings.
    |
    */

    'templates' => [
        'default' => [
            'name' => 'Стандартный',
            'description' => 'Базовый шаблон с простым дизайном',
            'default_layout' => [
                'header' => [
                    'type' => 'fixed',
                    'background' => 'white',
                    'show_logo' => true,
                    'show_navigation' => true,
                    'show_search' => false,
                ],
                'footer' => [
                    'type' => 'default',
                    'show_links' => true,
                    'show_social' => true,
                    'show_contact' => true,
                ],
                'sidebar' => [
                    'enabled' => false,
                    'position' => 'right',
                ],
            ],
            'default_theme' => [
                'primary_color' => '#3B82F6',
                'secondary_color' => '#6B7280',
                'accent_color' => '#F59E0B',
                'background_color' => '#FFFFFF',
                'text_color' => '#1F2937',
                'font_family' => 'Inter',
                'font_size' => '16px',
            ],
            'available_blocks' => [
                'hero',
                'text',
                'image',
                'gallery',
                'slider',
                'testimonials',
                'contact_form',
                'news',
                'projects',
            ],
        ],

        'modern' => [
            'name' => 'Современный',
            'description' => 'Современный шаблон с градиентами и анимациями',
            'default_layout' => [
                'header' => [
                    'type' => 'sticky',
                    'background' => 'transparent',
                    'show_logo' => true,
                    'show_navigation' => true,
                    'show_search' => true,
                ],
                'footer' => [
                    'type' => 'modern',
                    'show_links' => true,
                    'show_social' => true,
                    'show_contact' => true,
                    'show_newsletter' => true,
                ],
                'sidebar' => [
                    'enabled' => false,
                    'position' => 'right',
                ],
            ],
            'default_theme' => [
                'primary_color' => '#6366F1',
                'secondary_color' => '#8B5CF6',
                'accent_color' => '#F59E0B',
                'background_color' => '#F8FAFC',
                'text_color' => '#1E293B',
                'font_family' => 'Poppins',
                'font_size' => '16px',
            ],
            'available_blocks' => [
                'hero',
                'text',
                'image',
                'gallery',
                'slider',
                'testimonials',
                'contact_form',
                'news',
                'projects',
                'stats',
                'features',
                'pricing',
            ],
        ],

        'minimal' => [
            'name' => 'Минималистичный',
            'description' => 'Чистый и минималистичный дизайн',
            'default_layout' => [
                'header' => [
                    'type' => 'simple',
                    'background' => 'white',
                    'show_logo' => true,
                    'show_navigation' => true,
                    'show_search' => false,
                ],
                'footer' => [
                    'type' => 'minimal',
                    'show_links' => false,
                    'show_social' => false,
                    'show_contact' => true,
                ],
                'sidebar' => [
                    'enabled' => false,
                    'position' => 'right',
                ],
            ],
            'default_theme' => [
                'primary_color' => '#000000',
                'secondary_color' => '#6B7280',
                'accent_color' => '#000000',
                'background_color' => '#FFFFFF',
                'text_color' => '#000000',
                'font_family' => 'Helvetica',
                'font_size' => '16px',
            ],
            'available_blocks' => [
                'hero',
                'text',
                'image',
                'gallery',
                'contact_form',
            ],
        ],

        'corporate' => [
            'name' => 'Корпоративный',
            'description' => 'Профессиональный корпоративный дизайн',
            'default_layout' => [
                'header' => [
                    'type' => 'fixed',
                    'background' => 'white',
                    'show_logo' => true,
                    'show_navigation' => true,
                    'show_search' => true,
                ],
                'footer' => [
                    'type' => 'corporate',
                    'show_links' => true,
                    'show_social' => true,
                    'show_contact' => true,
                    'show_legal' => true,
                ],
                'sidebar' => [
                    'enabled' => true,
                    'position' => 'left',
                ],
            ],
            'default_theme' => [
                'primary_color' => '#1E40AF',
                'secondary_color' => '#374151',
                'accent_color' => '#059669',
                'background_color' => '#FFFFFF',
                'text_color' => '#111827',
                'font_family' => 'Roboto',
                'font_size' => '16px',
            ],
            'available_blocks' => [
                'hero',
                'text',
                'image',
                'gallery',
                'slider',
                'testimonials',
                'contact_form',
                'news',
                'projects',
                'team',
                'services',
                'about',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Page Templates
    |--------------------------------------------------------------------------
    |
    | Configuration for page templates.
    |
    */

    'page_templates' => [
        'default' => [
            'name' => 'Стандартная',
            'description' => 'Обычная страница с заголовком и контентом',
            'default_layout' => [
                'show_title' => true,
                'show_excerpt' => true,
                'show_featured_image' => true,
                'show_breadcrumbs' => true,
                'show_sidebar' => false,
            ],
        ],

        'landing' => [
            'name' => 'Лендинг',
            'description' => 'Страница-лендинг с блоками контента',
            'default_layout' => [
                'show_title' => false,
                'show_excerpt' => false,
                'show_featured_image' => false,
                'show_breadcrumbs' => false,
                'show_sidebar' => false,
            ],
        ],

        'blog' => [
            'name' => 'Блог',
            'description' => 'Страница блога со списком постов',
            'default_layout' => [
                'show_title' => true,
                'show_excerpt' => true,
                'show_featured_image' => true,
                'show_breadcrumbs' => true,
                'show_sidebar' => true,
            ],
        ],

        'contact' => [
            'name' => 'Контакты',
            'description' => 'Страница контактов с формой и картой',
            'default_layout' => [
                'show_title' => true,
                'show_excerpt' => false,
                'show_featured_image' => false,
                'show_breadcrumbs' => true,
                'show_sidebar' => false,
            ],
        ],

        'about' => [
            'name' => 'О нас',
            'description' => 'Страница о компании/организации',
            'default_layout' => [
                'show_title' => true,
                'show_excerpt' => true,
                'show_featured_image' => true,
                'show_breadcrumbs' => true,
                'show_sidebar' => false,
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Blocks
    |--------------------------------------------------------------------------
    |
    | Configuration for available content blocks.
    |
    */

    'blocks' => [
        'hero' => [
            'name' => 'Главный блок',
            'description' => 'Большой блок с заголовком, описанием и кнопкой',
            'icon' => 'hero',
            'category' => 'layout',
            'fields' => [
                'title' => ['type' => 'text', 'required' => true],
                'subtitle' => ['type' => 'text'],
                'description' => ['type' => 'textarea'],
                'background_image' => ['type' => 'image'],
                'button_text' => ['type' => 'text'],
                'button_url' => ['type' => 'url'],
                'button_style' => ['type' => 'select', 'options' => ['primary', 'secondary', 'outline']],
            ],
        ],

        'text' => [
            'name' => 'Текстовый блок',
            'description' => 'Блок с текстом и форматированием',
            'icon' => 'text',
            'category' => 'content',
            'fields' => [
                'content' => ['type' => 'richtext', 'required' => true],
                'text_align' => ['type' => 'select', 'options' => ['left', 'center', 'right']],
                'background_color' => ['type' => 'color'],
                'text_color' => ['type' => 'color'],
            ],
        ],

        'image' => [
            'name' => 'Изображение',
            'description' => 'Блок с изображением',
            'icon' => 'image',
            'category' => 'media',
            'fields' => [
                'image' => ['type' => 'image', 'required' => true],
                'alt_text' => ['type' => 'text'],
                'caption' => ['type' => 'text'],
                'alignment' => ['type' => 'select', 'options' => ['left', 'center', 'right']],
                'size' => ['type' => 'select', 'options' => ['small', 'medium', 'large', 'full']],
            ],
        ],

        'gallery' => [
            'name' => 'Галерея',
            'description' => 'Галерея изображений',
            'icon' => 'gallery',
            'category' => 'media',
            'fields' => [
                'images' => ['type' => 'images', 'required' => true],
                'columns' => ['type' => 'number', 'min' => 1, 'max' => 6, 'default' => 3],
                'show_captions' => ['type' => 'checkbox', 'default' => false],
                'lightbox' => ['type' => 'checkbox', 'default' => true],
            ],
        ],

        'slider' => [
            'name' => 'Слайдер',
            'description' => 'Слайдер изображений или контента',
            'icon' => 'slider',
            'category' => 'media',
            'fields' => [
                'slider_id' => ['type' => 'select', 'required' => true, 'options' => 'sliders'],
                'height' => ['type' => 'text', 'default' => '400px'],
                'autoplay' => ['type' => 'checkbox', 'default' => true],
                'show_arrows' => ['type' => 'checkbox', 'default' => true],
                'show_dots' => ['type' => 'checkbox', 'default' => true],
            ],
        ],

        'testimonials' => [
            'name' => 'Отзывы',
            'description' => 'Блок с отзывами клиентов',
            'icon' => 'testimonials',
            'category' => 'content',
            'fields' => [
                'testimonials' => ['type' => 'repeater', 'required' => true, 'fields' => [
                    'name' => ['type' => 'text', 'required' => true],
                    'position' => ['type' => 'text'],
                    'content' => ['type' => 'textarea', 'required' => true],
                    'avatar' => ['type' => 'image'],
                    'rating' => ['type' => 'number', 'min' => 1, 'max' => 5],
                ]],
                'columns' => ['type' => 'number', 'min' => 1, 'max' => 4, 'default' => 3],
                'autoplay' => ['type' => 'checkbox', 'default' => true],
            ],
        ],

        'contact_form' => [
            'name' => 'Контактная форма',
            'description' => 'Форма обратной связи',
            'icon' => 'contact',
            'category' => 'forms',
            'fields' => [
                'title' => ['type' => 'text'],
                'description' => ['type' => 'textarea'],
                'fields' => ['type' => 'repeater', 'fields' => [
                    'name' => ['type' => 'text', 'required' => true],
                    'type' => ['type' => 'select', 'options' => ['text', 'email', 'tel', 'textarea', 'select']],
                    'required' => ['type' => 'checkbox', 'default' => false],
                    'placeholder' => ['type' => 'text'],
                    'options' => ['type' => 'text'], // Для select полей
                ]],
                'submit_text' => ['type' => 'text', 'default' => 'Отправить'],
                'success_message' => ['type' => 'text', 'default' => 'Сообщение отправлено!'],
            ],
        ],

        'news' => [
            'name' => 'Новости',
            'description' => 'Блок с последними новостями',
            'icon' => 'news',
            'category' => 'content',
            'fields' => [
                'title' => ['type' => 'text', 'default' => 'Новости'],
                'limit' => ['type' => 'number', 'min' => 1, 'max' => 20, 'default' => 6],
                'columns' => ['type' => 'number', 'min' => 1, 'max' => 4, 'default' => 3],
                'show_excerpt' => ['type' => 'checkbox', 'default' => true],
                'show_date' => ['type' => 'checkbox', 'default' => true],
                'show_image' => ['type' => 'checkbox', 'default' => true],
            ],
        ],

        'projects' => [
            'name' => 'Проекты',
            'description' => 'Блок с проектами организации',
            'icon' => 'projects',
            'category' => 'content',
            'fields' => [
                'title' => ['type' => 'text', 'default' => 'Наши проекты'],
                'limit' => ['type' => 'number', 'min' => 1, 'max' => 20, 'default' => 6],
                'columns' => ['type' => 'number', 'min' => 1, 'max' => 4, 'default' => 3],
                'show_description' => ['type' => 'checkbox', 'default' => true],
                'show_progress' => ['type' => 'checkbox', 'default' => true],
                'show_image' => ['type' => 'checkbox', 'default' => true],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Default Settings
    |--------------------------------------------------------------------------
    |
    | Default settings for new sites.
    |
    */

    'defaults' => [
        'template' => 'default',
        'status' => 'draft',
        'is_public' => false,
        'is_maintenance_mode' => false,
        'maintenance_message' => 'Сайт временно недоступен. Ведутся технические работы.',
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Settings
    |--------------------------------------------------------------------------
    |
    | Settings for file uploads.
    |
    */

    'uploads' => [
        'max_file_size' => 10240, // KB
        'allowed_image_types' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'allowed_document_types' => ['pdf', 'doc', 'docx', 'txt'],
        'storage_disk' => 'public',
        'storage_path' => 'sites',
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Settings
    |--------------------------------------------------------------------------
    |
    | Cache settings for site content.
    |
    */

    'cache' => [
        'enabled' => true,
        'ttl' => 3600, // seconds
        'tags' => ['sites', 'pages', 'content'],
    ],
];
