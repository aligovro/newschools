<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ProjectCategory;

class ProjectCategorySeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $categories = [
      [
        'name' => 'Образование',
        'slug' => 'education',
        'description' => 'Проекты, связанные с образованием и обучением',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'name' => 'Медицина',
        'slug' => 'medicine',
        'description' => 'Проекты, связанные с медициной и здравоохранением',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'name' => 'Строительство',
        'slug' => 'construction',
        'description' => 'Проекты, связанные со строительством и ремонтом',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'name' => 'Семья и Дети',
        'slug' => 'family-and-children',
        'description' => 'Проекты, связанные с поддержкой семей и детей',
        'sort_order' => 4,
        'is_active' => true,
      ],
    ];

    foreach ($categories as $category) {
      ProjectCategory::updateOrCreate(
        ['slug' => $category['slug']],
        $category
      );
    }
  }
}
