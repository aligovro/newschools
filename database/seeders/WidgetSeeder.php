<?php

namespace Database\Seeders;

use App\Models\Widget;
use Illuminate\Database\Seeder;

class WidgetSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $widgets = [
      [
        'name' => 'Главный баннер',
        'slug' => 'hero',
        'description' => 'Большой блок с заголовком, описанием и кнопкой',
        'icon' => 'hero-icon.svg',
        'category' => 'layout',
        'component_name' => 'HeroWidget',
        'css_classes' => 'hero-widget',
        'is_premium' => false,
        'sort_order' => 1,
      ],
      [
        'name' => 'Текстовый блок',
        'slug' => 'text',
        'description' => 'Блок с текстом и форматированием',
        'icon' => 'text-icon.svg',
        'category' => 'content',
        'component_name' => 'TextWidget',
        'css_classes' => 'text-widget',
        'is_premium' => false,
        'sort_order' => 2,
      ],
      [
        'name' => 'Проекты',
        'slug' => 'projects',
        'description' => 'Блок с проектами организации',
        'icon' => 'projects-icon.svg',
        'category' => 'content',
        'component_name' => 'ProjectsWidget',
        'css_classes' => 'projects-widget',
        'is_premium' => false,
        'sort_order' => 3,
      ],
      [
        'name' => 'Галерея',
        'slug' => 'gallery',
        'description' => 'Галерея изображений',
        'icon' => 'gallery-icon.svg',
        'category' => 'media',
        'component_name' => 'GalleryWidget',
        'css_classes' => 'gallery-widget',
        'is_premium' => false,
        'sort_order' => 4,
      ],
      [
        'name' => 'Контактная форма',
        'slug' => 'contact_form',
        'description' => 'Форма обратной связи',
        'icon' => 'contact-icon.svg',
        'category' => 'forms',
        'component_name' => 'ContactFormWidget',
        'css_classes' => 'contact-form-widget',
        'is_premium' => false,
        'sort_order' => 5,
      ],
    ];

    foreach ($widgets as $widgetData) {
      Widget::create($widgetData);
    }
  }
}
