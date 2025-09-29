<?php

return [
  'types' => [
    'hero' => [
      'name' => 'Главный слайдер',
      'description' => 'Большой слайдер на весь экран с фоновыми изображениями',
      'default_settings' => [
        'autoplay' => true,
        'autoplay_delay' => 5000,
        'show_arrows' => true,
        'show_dots' => true,
        'height' => '100vh',
        'overlay_opacity' => 0.4,
        'text_position' => 'center',
        'animation' => 'fade',
      ],
      'fields' => [
        'title' => ['type' => 'text', 'required' => true],
        'subtitle' => ['type' => 'text'],
        'description' => ['type' => 'textarea'],
        'background_image' => ['type' => 'image', 'required' => true],
        'button_text' => ['type' => 'text'],
        'button_url' => ['type' => 'url'],
        'button_style' => ['type' => 'select', 'options' => ['primary', 'secondary', 'outline']],
      ],
    ],
    'content' => [
      'name' => 'Контентный слайдер',
      'description' => 'Слайдер для отображения записей из базы данных',
      'default_settings' => [
        'autoplay' => false,
        'autoplay_delay' => 3000,
        'show_arrows' => true,
        'show_dots' => true,
        'items_per_view' => 3,
        'items_per_view_mobile' => 1,
        'gap' => 20,
        'animation' => 'slide',
        'infinite' => true,
      ],
      'fields' => [
        'content_type' => ['type' => 'select', 'required' => true, 'options' => ['news', 'projects', 'members', 'donations']],
        'limit' => ['type' => 'number', 'default' => 10],
        'order_by' => ['type' => 'select', 'options' => ['created_at', 'updated_at', 'title', 'amount']],
        'order_direction' => ['type' => 'select', 'options' => ['asc', 'desc']],
        'show_title' => ['type' => 'checkbox', 'default' => true],
        'show_description' => ['type' => 'checkbox', 'default' => true],
        'show_image' => ['type' => 'checkbox', 'default' => true],
        'show_date' => ['type' => 'checkbox', 'default' => true],
        'show_button' => ['type' => 'checkbox', 'default' => true],
        'button_text' => ['type' => 'text', 'default' => 'Подробнее'],
      ],
    ],
    'gallery' => [
      'name' => 'Галерея',
      'description' => 'Слайдер для отображения изображений',
      'default_settings' => [
        'autoplay' => true,
        'autoplay_delay' => 4000,
        'show_arrows' => true,
        'show_dots' => true,
        'items_per_view' => 4,
        'items_per_view_mobile' => 2,
        'gap' => 15,
        'animation' => 'slide',
        'lightbox' => true,
      ],
      'fields' => [
        'images' => ['type' => 'images', 'required' => true],
        'show_captions' => ['type' => 'checkbox', 'default' => false],
      ],
    ],
    'testimonials' => [
      'name' => 'Отзывы',
      'description' => 'Слайдер для отображения отзывов',
      'default_settings' => [
        'autoplay' => true,
        'autoplay_delay' => 6000,
        'show_arrows' => true,
        'show_dots' => true,
        'items_per_view' => 2,
        'items_per_view_mobile' => 1,
        'gap' => 30,
        'animation' => 'fade',
      ],
      'fields' => [
        'testimonials' => ['type' => 'repeater', 'required' => true, 'fields' => [
          'name' => ['type' => 'text', 'required' => true],
          'position' => ['type' => 'text'],
          'content' => ['type' => 'textarea', 'required' => true],
          'avatar' => ['type' => 'image'],
          'rating' => ['type' => 'number', 'min' => 1, 'max' => 5],
        ]],
      ],
    ],
  ],

  'positions' => [
    'header' => 'В шапке',
    'hero' => 'Главная область',
    'content' => 'В контенте',
    'sidebar' => 'В боковой панели',
    'footer' => 'В подвале',
  ],

  'animations' => [
    'fade' => 'Плавное появление',
    'slide' => 'Скольжение',
    'zoom' => 'Масштабирование',
    'flip' => 'Переворот',
  ],

  'text_positions' => [
    'left' => 'Слева',
    'center' => 'По центру',
    'right' => 'Справа',
    'top' => 'Сверху',
    'bottom' => 'Снизу',
  ],
];
