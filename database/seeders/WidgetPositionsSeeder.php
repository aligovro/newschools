<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WidgetPosition;
use App\Models\SiteTemplate;

class WidgetPositionsSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Получаем все шаблоны или создаем базовый
    $templates = SiteTemplate::all();

    if ($templates->isEmpty()) {
      $templates = collect([
        SiteTemplate::create([
          'name' => 'Базовый шаблон',
          'slug' => 'basic',
          'description' => 'Базовый шаблон для всех сайтов',
          'is_active' => true,
        ])
      ]);
    }

    // 5 основных позиций для всех шаблонов
    $positions = [
      [
        'name' => 'Шапка сайта',
        'slug' => 'header',
        'description' => 'Верхняя часть сайта (меню, логотип, навигация)',
        'area' => 'header',
        'order' => 1,
        'allowed_widgets' => [], // Все виджеты разрешены
        'layout_config' => [
          'width' => 'full',
          'alignment' => 'center',
          'padding' => '0',
          'margin' => '0',
        ],
        'is_required' => true,
        'is_active' => true,
      ],
      [
        'name' => 'Главный баннер',
        'slug' => 'hero',
        'description' => 'Главный баннер или слайдер (hero секция)',
        'area' => 'hero',
        'order' => 2,
        'allowed_widgets' => [], // Все виджеты разрешены
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
        'name' => 'Основной контент',
        'slug' => 'content',
        'description' => 'Основная область контента сайта',
        'area' => 'content',
        'order' => 3,
        'allowed_widgets' => [], // Все виджеты разрешены
        'layout_config' => [
          'width' => 'full',
          'alignment' => 'left',
          'padding' => '40px 20px',
          'margin' => '0',
        ],
        'is_required' => true,
        'is_active' => true,
      ],
      [
        'name' => 'Боковая панель',
        'slug' => 'sidebar',
        'description' => 'Боковая панель (виджеты, дополнительная информация)',
        'area' => 'sidebar',
        'order' => 4,
        'allowed_widgets' => [], // Все виджеты разрешены
        'layout_config' => [
          'width' => '350px',
          'alignment' => 'left',
          'padding' => '20px',
          'margin' => '0',
        ],
        'is_required' => false,
        'is_active' => true,
      ],
      [
        'name' => 'Подвал сайта',
        'slug' => 'footer',
        'description' => 'Нижняя часть сайта (контакты, информация, меню)',
        'area' => 'footer',
        'order' => 5,
        'allowed_widgets' => [], // Все виджеты разрешены
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

    // Создаем позиции для каждого шаблона
    foreach ($templates as $template) {
      foreach ($positions as $positionData) {
        WidgetPosition::updateOrCreate(
          [
            'template_id' => $template->id,
            'slug' => $positionData['slug']
          ],
          array_merge($positionData, ['template_id' => $template->id])
        );
      }
    }

    $this->command->info('Позиции виджетов созданы: 5 позиций для каждого шаблона');
    $this->command->info('В каждой позиции можно добавлять неограниченное количество виджетов');
  }
}
