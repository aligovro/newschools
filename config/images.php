<?php

return [
  /*
    |--------------------------------------------------------------------------
    | Image Processing Configuration
    |--------------------------------------------------------------------------
    |
    | Настройки для обработки изображений в приложении
    |
    */

  'max_file_size' => 10 * 1024 * 1024, // 10MB
  'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'min_dimensions' => ['width' => 50, 'height' => 50],
  'max_dimensions' => ['width' => 4000, 'height' => 4000],

  /*
    |--------------------------------------------------------------------------
    | Image Sizes
    |--------------------------------------------------------------------------
    |
    | Размеры изображений для разных типов контента
    |
    */

  'sizes' => [
    'organization_logo' => [
      'logo' => ['width' => 300, 'height' => 300, 'fit' => 'contain'],
      'thumbnail' => ['width' => 150, 'height' => 150, 'fit' => 'cover'],
      'small' => ['width' => 50, 'height' => 50, 'fit' => 'cover']
    ],
    'slider' => [
      'slider' => ['width' => 1200, 'height' => 600, 'fit' => 'cover'],
      'thumbnail' => ['width' => 300, 'height' => 150, 'fit' => 'cover'],
      'small' => ['width' => 150, 'height' => 75, 'fit' => 'cover']
    ],
    'gallery' => [
      'gallery' => ['width' => 800, 'height' => 600, 'fit' => 'cover'],
      'thumbnail' => ['width' => 200, 'height' => 150, 'fit' => 'cover'],
      'small' => ['width' => 100, 'height' => 75, 'fit' => 'cover']
    ],
    'news' => [
      'news' => ['width' => 600, 'height' => 400, 'fit' => 'cover'],
      'thumbnail' => ['width' => 300, 'height' => 200, 'fit' => 'cover'],
      'small' => ['width' => 150, 'height' => 100, 'fit' => 'cover']
    ]
  ],

  /*
    |--------------------------------------------------------------------------
    | Quality Settings
    |--------------------------------------------------------------------------
    |
    | Настройки качества сжатия для разных размеров
    |
    */

  'quality' => [
    'original' => 85,
    'large' => 80,
    'medium' => 75,
    'small' => 70,
    'thumbnail' => 65
  ],

  /*
    |--------------------------------------------------------------------------
    | Storage Settings
    |--------------------------------------------------------------------------
    |
    | Настройки хранения изображений
    |
    */

  'storage' => [
    'disk' => 'public',
    'directories' => [
      'organizations' => 'organizations',
      'sliders' => 'sliders',
      'galleries' => 'galleries',
      'news' => 'news',
      'users' => 'users'
    ]
  ]
];
