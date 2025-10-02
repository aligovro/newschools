<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Models\SiteTemplate;

class WidgetSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Создаем базовые виджеты
    $widgets = [
      [
        'name' => 'Hero секция',
        'slug' => 'hero',
        'description' => 'Главная секция с заголовком, описанием и кнопкой',
        'icon' => '🎯',
        'category' => 'layout',
        'component_name' => 'HeroWidget',
        'is_active' => true,
        'sort_order' => 1,
        'fields_config' => [
          'title' => ['type' => 'text', 'required' => true, 'label' => 'Заголовок'],
          'subtitle' => ['type' => 'text', 'required' => false, 'label' => 'Подзаголовок'],
          'description' => ['type' => 'textarea', 'required' => false, 'label' => 'Описание'],
          'background_image' => ['type' => 'image', 'required' => false, 'label' => 'Фоновое изображение'],
          'button_text' => ['type' => 'text', 'required' => false, 'label' => 'Текст кнопки'],
          'button_url' => ['type' => 'url', 'required' => false, 'label' => 'Ссылка кнопки'],
          'button_style' => ['type' => 'select', 'required' => false, 'label' => 'Стиль кнопки', 'options' => ['primary', 'secondary', 'outline']],
        ],
        'settings_config' => [
          'height' => ['type' => 'text', 'label' => 'Высота', 'default' => '400px'],
          'parallax' => ['type' => 'checkbox', 'label' => 'Параллакс эффект', 'default' => false],
          'overlay' => ['type' => 'checkbox', 'label' => 'Наложение', 'default' => true],
          'overlay_opacity' => ['type' => 'range', 'label' => 'Прозрачность наложения', 'min' => 0, 'max' => 100, 'default' => 50],
        ],
      ],
      [
        'name' => 'Текстовый блок',
        'slug' => 'text',
        'description' => 'Блок с текстовым содержимым и форматированием',
        'icon' => '📝',
        'category' => 'content',
        'component_name' => 'TextWidget',
        'is_active' => true,
        'sort_order' => 2,
        'fields_config' => [
          'content' => ['type' => 'richtext', 'required' => true, 'label' => 'Содержимое'],
          'text_align' => ['type' => 'select', 'required' => false, 'label' => 'Выравнивание', 'options' => ['left', 'center', 'right']],
          'background_color' => ['type' => 'color', 'required' => false, 'label' => 'Цвет фона'],
          'text_color' => ['type' => 'color', 'required' => false, 'label' => 'Цвет текста'],
        ],
        'settings_config' => [
          'padding' => ['type' => 'text', 'label' => 'Отступы', 'default' => '20px'],
          'margin' => ['type' => 'text', 'label' => 'Внешние отступы', 'default' => '0'],
          'border_radius' => ['type' => 'text', 'label' => 'Скругление углов', 'default' => '0'],
        ],
      ],
      [
        'name' => 'Изображение',
        'slug' => 'image',
        'description' => 'Одиночное изображение с подписью',
        'icon' => '🖼️',
        'category' => 'media',
        'component_name' => 'ImageWidget',
        'is_active' => true,
        'sort_order' => 3,
        'fields_config' => [
          'image' => ['type' => 'image', 'required' => true, 'label' => 'Изображение'],
          'alt_text' => ['type' => 'text', 'required' => false, 'label' => 'Альтернативный текст'],
          'caption' => ['type' => 'text', 'required' => false, 'label' => 'Подпись'],
          'alignment' => ['type' => 'select', 'required' => false, 'label' => 'Выравнивание', 'options' => ['left', 'center', 'right']],
          'size' => ['type' => 'select', 'required' => false, 'label' => 'Размер', 'options' => ['small', 'medium', 'large', 'full']],
        ],
        'settings_config' => [
          'border_radius' => ['type' => 'text', 'label' => 'Скругление углов', 'default' => '8px'],
          'shadow' => ['type' => 'checkbox', 'label' => 'Тень', 'default' => true],
        ],
      ],
      [
        'name' => 'Галерея',
        'slug' => 'gallery',
        'description' => 'Галерея изображений с лайтбоксом',
        'icon' => '🖼️',
        'category' => 'media',
        'component_name' => 'GalleryWidget',
        'is_active' => true,
        'sort_order' => 4,
        'fields_config' => [
          'images' => ['type' => 'images', 'required' => true, 'label' => 'Изображения'],
          'columns' => ['type' => 'number', 'required' => false, 'label' => 'Количество колонок', 'min' => 1, 'max' => 6, 'default' => 3],
          'show_captions' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать подписи', 'default' => false],
          'lightbox' => ['type' => 'checkbox', 'required' => false, 'label' => 'Лайтбокс', 'default' => true],
        ],
        'settings_config' => [
          'gap' => ['type' => 'text', 'label' => 'Отступ между изображениями', 'default' => '16px'],
          'border_radius' => ['type' => 'text', 'label' => 'Скругление углов', 'default' => '8px'],
        ],
      ],
      [
        'name' => 'Проекты',
        'slug' => 'projects',
        'description' => 'Список проектов с прогрессом',
        'icon' => '🚀',
        'category' => 'content',
        'component_name' => 'ProjectsWidget',
        'is_active' => true,
        'sort_order' => 5,
        'fields_config' => [
          'title' => ['type' => 'text', 'required' => false, 'label' => 'Заголовок', 'default' => 'Наши проекты'],
          'limit' => ['type' => 'number', 'required' => false, 'label' => 'Количество проектов', 'min' => 1, 'max' => 20, 'default' => 6],
          'columns' => ['type' => 'number', 'required' => false, 'label' => 'Количество колонок', 'min' => 1, 'max' => 4, 'default' => 3],
          'show_description' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать описание', 'default' => true],
          'show_progress' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать прогресс', 'default' => true],
          'show_image' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать изображение', 'default' => true],
        ],
        'settings_config' => [
          'animation' => ['type' => 'select', 'label' => 'Анимация', 'options' => ['none', 'fade', 'slide', 'zoom'], 'default' => 'fade'],
          'hover_effect' => ['type' => 'select', 'label' => 'Эффект при наведении', 'options' => ['none', 'lift', 'shadow', 'scale'], 'default' => 'lift'],
        ],
      ],
      [
        'name' => 'Контакты',
        'slug' => 'contact',
        'description' => 'Контактная информация и форма обратной связи',
        'icon' => '📞',
        'category' => 'forms',
        'component_name' => 'ContactWidget',
        'is_active' => true,
        'sort_order' => 6,
        'fields_config' => [
          'title' => ['type' => 'text', 'required' => false, 'label' => 'Заголовок', 'default' => 'Контакты'],
          'address' => ['type' => 'text', 'required' => false, 'label' => 'Адрес'],
          'phone' => ['type' => 'text', 'required' => false, 'label' => 'Телефон'],
          'email' => ['type' => 'email', 'required' => false, 'label' => 'Email'],
          'working_hours' => ['type' => 'text', 'required' => false, 'label' => 'Часы работы'],
          'website' => ['type' => 'url', 'required' => false, 'label' => 'Веб-сайт'],
          'show_form' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать форму', 'default' => true],
          'show_map' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать карту', 'default' => false],
        ],
        'settings_config' => [
          'layout' => ['type' => 'select', 'label' => 'Макет', 'options' => ['side-by-side', 'stacked'], 'default' => 'side-by-side'],
        ],
      ],
      [
        'name' => 'Статистика',
        'slug' => 'stats',
        'description' => 'Блок со статистикой и цифрами',
        'icon' => '📊',
        'category' => 'content',
        'component_name' => 'StatsWidget',
        'is_active' => true,
        'sort_order' => 7,
        'fields_config' => [
          'title' => ['type' => 'text', 'required' => false, 'label' => 'Заголовок'],
          'stats' => ['type' => 'json', 'required' => true, 'label' => 'Статистика'],
          'columns' => ['type' => 'number', 'required' => false, 'label' => 'Количество колонок', 'min' => 1, 'max' => 6, 'default' => 3],
          'layout' => ['type' => 'select', 'required' => false, 'label' => 'Макет', 'options' => ['grid', 'list', 'carousel'], 'default' => 'grid'],
          'show_icons' => ['type' => 'checkbox', 'required' => false, 'label' => 'Показывать иконки', 'default' => true],
        ],
        'settings_config' => [
          'animation' => ['type' => 'select', 'label' => 'Анимация', 'options' => ['none', 'count-up', 'fade-in'], 'default' => 'fade-in'],
        ],
      ],
    ];

    foreach ($widgets as $widgetData) {
      Widget::updateOrCreate(
        ['slug' => $widgetData['slug']],
        $widgetData
      );
    }

    // Создаем позиции для виджетов
    $this->createWidgetPositions();
  }

  private function createWidgetPositions(): void
  {
    // Получаем первый шаблон или создаем базовый
    $template = SiteTemplate::first();
    if (!$template) {
      $template = SiteTemplate::create([
        'name' => 'Базовый шаблон',
        'slug' => 'basic',
        'description' => 'Базовый шаблон для всех сайтов',
        'is_active' => true,
      ]);
    }

    $positions = [
      [
        'template_id' => $template->id,
        'name' => 'Шапка',
        'slug' => 'header',
        'description' => 'Область в шапке сайта',
        'area' => 'header',
        'order' => 1,
        'allowed_widgets' => ['hero', 'text', 'image'],
        'layout_config' => [
          'width' => 'full',
          'alignment' => 'center',
          'padding' => '0',
          'margin' => '0',
        ],
        'is_required' => false,
        'is_active' => true,
      ],
      [
        'template_id' => $template->id,
        'name' => 'Основной контент',
        'slug' => 'content',
        'description' => 'Основная область контента',
        'area' => 'content',
        'order' => 2,
        'allowed_widgets' => [], // Все виджеты разрешены
        'layout_config' => [
          'width' => 'full',
          'alignment' => 'left',
          'padding' => '20px',
          'margin' => '0',
        ],
        'is_required' => true,
        'is_active' => true,
      ],
      [
        'template_id' => $template->id,
        'name' => 'Боковая панель',
        'slug' => 'sidebar',
        'description' => 'Боковая панель сайта',
        'area' => 'sidebar',
        'order' => 3,
        'allowed_widgets' => ['text', 'image', 'stats', 'contact'],
        'layout_config' => [
          'width' => '300px',
          'alignment' => 'left',
          'padding' => '20px',
          'margin' => '0',
        ],
        'is_required' => false,
        'is_active' => true,
      ],
      [
        'template_id' => $template->id,
        'name' => 'Подвал',
        'slug' => 'footer',
        'description' => 'Область в подвале сайта',
        'area' => 'footer',
        'order' => 4,
        'allowed_widgets' => ['text', 'contact', 'stats'],
        'layout_config' => [
          'width' => 'full',
          'alignment' => 'center',
          'padding' => '40px 20px',
          'margin' => '0',
        ],
        'is_required' => false,
        'is_active' => true,
      ],
    ];

    foreach ($positions as $positionData) {
      WidgetPosition::updateOrCreate(
        ['slug' => $positionData['slug']],
        $positionData
      );
    }
  }
}
