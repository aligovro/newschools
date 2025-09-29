<?php

namespace Database\Seeders;

use App\Models\OrganizationType;
use Illuminate\Database\Seeder;

class OrganizationTypeSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $types = [
      [
        'key' => 'school',
        'name' => 'Школа',
        'plural' => 'Школы',
        'member_type' => 'alumni',
        'member_name' => 'Выпускник',
        'member_plural' => 'Выпускники',
        'domain_prefix' => 'schools',
        'features' => [
          'graduation_years',
          'classes',
          'alumni_directory',
          'achievements',
          'projects',
          'donations',
          'news',
          'gallery',
          'events',
        ],
        'categories' => [
          'construction' => 'Строительство',
          'equipment' => 'Оборудование',
          'sports' => 'Спорт',
          'education' => 'Образование',
          'charity' => 'Благотворительность',
          'events' => 'Мероприятия',
          'maintenance' => 'Содержание',
          'technology' => 'Технологии',
          'library' => 'Библиотека',
          'canteen' => 'Столовая',
        ],
        'is_active' => true,
      ],
    ];

    foreach ($types as $type) {
      OrganizationType::updateOrCreate(
        ['key' => $type['key']],
        $type
      );
    }
  }
}
