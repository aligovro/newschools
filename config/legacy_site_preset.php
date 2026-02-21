<?php

/**
 * Пресет виджетов для сайта, перенесённого из внешней системы (legacy migration).
 * Используется только модулем импорта при создании виджетов по маппингу.
 */
return [
  'template' => 'default',
  'layout_config' => [
    'sidebar_position' => 'right',
  ],
  'positions' => [
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
    [
      'position_slug' => 'content',
      'widgets' => [
        [
          'widget_slug' => 'html',
          'name' => 'Баннер сбора',
          'order' => 0,
          'config' => [
            'show_title' => false,
            'htmlContent' => '',
            'enableScripts' => false,
            'enableStyles' => true,
          ],
        ],
        [
          'widget_slug' => 'share_buttons',
          'name' => 'Поделись сбором',
          'order' => 1,
          'config' => [
            'title' => 'Поделись сбором:',
            'show_title' => true,
            'share_url' => null,
            'share_text' => '',
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
    [
      'position_slug' => 'sidebar',
      'widgets' => [
        [
          'widget_slug' => 'donation',
          'name' => 'Поддержка проектов',
          'order' => 0,
          'config' => [
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
