<?php

return [
  /*
    |--------------------------------------------------------------------------
    | Пресет виджетов для сайта, перенесённого из BlagoQR (WP)
    |--------------------------------------------------------------------------
    | Структура сайта po500.ru:
    |
    | HEADER: Лого + «Помочь» CTA + телефон + WhatsApp + Личный кабинет + Бургер
    | CONTENT (left 3/4):
    |   - Текст описания организации (из postmeta проекта/wp_options)
    |   - Топ поддержавших выпусков (org_top_donors, select: неделя/месяц/всё время)
    |   - Топ регулярно-поддерживающих (org_top_recurring_donors)
    |   - Все поступления с пагинацией (org_donations_feed)
    |   - Проекты (projects)
    | SIDEBAR (right 1/4, sticky):
    |   - Виджет пожертвования (donation) — форма, прогресс, методы оплаты
    | FOOTER:
    |   - Меню ссылок (политика, cookie, контакты)
    |
    | layout_config.sidebar_position = 'right' ставится в SiteCreationService
    */
  'template' => 'default',

  'layout_config' => [
    'sidebar_position' => 'right',
  ],

  'positions' => [
    // ────────────────── HEADER ──────────────────
    [
      'position_slug' => 'header',
      'widgets' => [
        [
          'widget_slug' => 'menu',
          'name' => 'Главное меню',
          'order' => 0,
          'config' => [
            'items' => [
              ['id' => 'news', 'title' => 'Новости', 'url' => '/news', 'type' => 'internal', 'openInNewTab' => false, 'order' => 1],
              ['id' => 'projects-completed', 'title' => 'Завершенные проекты', 'url' => '/success-projects', 'type' => 'internal', 'openInNewTab' => false, 'order' => 2],
              ['id' => 'reports', 'title' => 'Отчеты', 'url' => '/reports', 'type' => 'internal', 'openInNewTab' => false, 'order' => 3],
              ['id' => 'contacts', 'title' => 'Контакты', 'url' => '/contacts', 'type' => 'internal', 'openInNewTab' => false, 'order' => 4],
            ],
          ],
        ],
        [
          'widget_slug' => 'auth_menu',
          'name' => 'Авторизация',
          'order' => 1,
          'config' => [
            'show_login' => true,
            'show_register' => false,
            'login_text' => 'Личный кабинет',
            'account_url' => '/my-account/invite',
          ],
        ],
      ],
    ],

    // ────────────────── CONTENT (основная колонка) ──────────────────
    [
      'position_slug' => 'content',
      'widgets' => [
        // Баннер-слайдер с прогрессом сбора (заполняется при миграции из WP)
        [
          'widget_slug' => 'html',
          'name' => 'Баннер сбора',
          'order' => 0,
          'config' => [
            'show_title' => false,
            'htmlContent' => '', // заполняется модулем импорта при наличии данных
            'enableScripts' => false,
            'enableStyles' => true,
          ],
        ],
        // Кнопки «Поделиться»
        [
          'widget_slug' => 'share_buttons',
          'name' => 'Поделись сбором',
          'order' => 1,
          'config' => [
            'title' => 'Поделись сбором:',
            'show_title' => true,
            'share_url' => null,   // null → используется текущий URL страницы
            'share_text' => '',    // заполняется из WP text_socials_share
            'networks' => ['whatsapp', 'telegram', 'vk'],
            'show_counts' => true,
            'counts' => ['whatsapp' => 0, 'telegram' => 0, 'vk' => 0],
          ],
        ],
        [
          'widget_slug' => 'org_top_donors',
          'name' => 'Топ поддержавших выпусков',
          'order' => 2,
          'config' => [
            'title' => 'Топ поддержавших выпусков',
            'period' => 'week',
            'periods' => ['week', 'month', 'all'],
            'limit' => 10,
          ],
        ],
        [
          'widget_slug' => 'org_top_recurring_donors',
          'name' => 'Топ регулярно-поддерживающих',
          'order' => 3,
          'config' => [
            'title' => 'Топ регулярно-поддерживающих',
            'limit' => 15,
          ],
        ],
        [
          'widget_slug' => 'org_donations_feed',
          'name' => 'Все поступления',
          'order' => 4,
          'config' => [
            'title' => 'Все поступления',
            'per_page' => 10,
          ],
        ],
        [
          'widget_slug' => 'projects',
          'name' => 'Проекты',
          'order' => 5,
          'config' => [
            'title' => 'Проекты',
            'showImage' => true,
            'showDescription' => false,
            'showProgress' => false,
            'columns' => 4,
            'limit' => 8,
          ],
        ],
      ],
    ],

    // ────────────────── SIDEBAR (правая колонка, sticky) ──────────────────
    [
      'position_slug' => 'sidebar',
      'widgets' => [
        [
          'widget_slug' => 'donation',
          'name' => 'Поддержка проектов',
          'order' => 0,
          'config' => [
            // Ключи для donationSettings таблицы (camelCase → маппит saveDonationSettings)
            'title' => null,
            'description' => null,
            'minAmount' => 1,
            'maxAmount' => null,
            'suggestedAmounts' => [500, 1000, 3000, 5000],
            'currency' => 'RUB',
            'showAmountInput' => true,
            'showAnonymousOption' => true,
            'buttonText' => 'Внести свой вклад',
            'successMessage' => 'Спасибо за вашу поддержку!',
            'paymentMethods' => null,
            // Ключи для syncConfig (дополнительные настройки, читаются фронтом)
            'show_title' => false,
            'showProgress' => true,
            'show_target_amount' => true,
            'show_collected_amount' => true,
            'allowRecurring' => true,
            'recurringPeriods' => ['daily', 'weekly', 'monthly'],
            'requireName' => true,
            'requirePhone' => true,
            'requireEmail' => false,
            'allowAnonymous' => true,
            'showMessageField' => false,
          ],
        ],
      ],
    ],

    // ────────────────── FOOTER ──────────────────
    [
      'position_slug' => 'footer',
      'widgets' => [
        [
          'widget_slug' => 'menu',
          'name' => 'Подвал — ссылки',
          'order' => 0,
          'config' => [
            'items' => [
              ['id' => 'policy', 'title' => 'Политика конфиденциальности', 'url' => '/policy', 'type' => 'internal', 'openInNewTab' => true, 'order' => 1],
              ['id' => 'cookie', 'title' => 'Политика использования cookie-файлов', 'url' => '/cookie', 'type' => 'internal', 'openInNewTab' => true, 'order' => 2],
              ['id' => 'contacts-f', 'title' => 'Контакты', 'url' => '/contacts', 'type' => 'internal', 'openInNewTab' => false, 'order' => 3],
            ],
          ],
        ],
      ],
    ],
  ],
];
