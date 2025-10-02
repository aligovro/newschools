<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;
use App\Models\WidgetPosition;
use App\Models\SiteTemplate;

class DefaultWidgetsSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Создаем дефолтные виджеты
    $widgets = [
      [
        'name' => 'Меню навигации',
        'slug' => 'header-menu',
        'description' => 'Главное меню навигации сайта',
        'component_name' => 'HeaderMenuWidget',
        'category' => 'navigation',
        'is_active' => true,
      ],
      [
        'name' => 'Главный слайдер',
        'slug' => 'hero-slider',
        'description' => 'Главный слайдер с изображениями и текстом',
        'component_name' => 'HeroWidget',
        'category' => 'hero',
        'is_active' => true,
      ],
      [
        'name' => 'Контакты в футере',
        'slug' => 'footer-contacts',
        'description' => 'Контактная информация в футере',
        'component_name' => 'FooterContactsWidget',
        'category' => 'footer',
        'is_active' => true,
      ],
    ];

    foreach ($widgets as $widgetData) {
      Widget::updateOrCreate(
        ['slug' => $widgetData['slug']],
        $widgetData
      );
    }

    // Создаем дефолтные позиции для разных шаблонов
    $templates = SiteTemplate::all();

    foreach ($templates as $template) {
      $positions = [
        [
          'template_id' => $template->id,
          'name' => 'Шапка сайта',
          'slug' => 'header',
          'description' => 'Верхняя часть сайта с меню навигации',
          'area' => 'header',
          'order' => 1,
          'allowed_widgets' => ['header-menu'],
          'is_required' => true,
          'is_active' => true,
        ],
        [
          'template_id' => $template->id,
          'name' => 'Главный баннер',
          'slug' => 'hero',
          'description' => 'Главный баннер или слайдер на главной странице',
          'area' => 'hero',
          'order' => 2,
          'allowed_widgets' => ['hero-slider', 'hero-banner'],
          'is_required' => true,
          'is_active' => true,
        ],
        [
          'template_id' => $template->id,
          'name' => 'Подвал сайта',
          'slug' => 'footer',
          'description' => 'Нижняя часть сайта с контактной информацией',
          'area' => 'footer',
          'order' => 10,
          'allowed_widgets' => ['footer-contacts', 'footer-menu'],
          'is_required' => true,
          'is_active' => true,
        ],
      ];

      foreach ($positions as $positionData) {
        WidgetPosition::updateOrCreate(
          [
            'template_id' => $positionData['template_id'],
            'slug' => $positionData['slug']
          ],
          $positionData
        );
      }
    }
  }
}
