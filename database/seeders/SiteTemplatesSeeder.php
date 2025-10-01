<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteTemplate;

class SiteTemplatesSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $templates = [
      [
        'name' => 'Современный',
        'slug' => 'modern',
        'description' => 'Современный дизайн с минималистичным подходом',
        'is_active' => true,
      ],
      [
        'name' => 'Классический',
        'slug' => 'classic',
        'description' => 'Классический дизайн с традиционными элементами',
        'is_active' => true,
      ],
      [
        'name' => 'Минималистичный',
        'slug' => 'minimal',
        'description' => 'Минималистичный дизайн с акцентом на контент',
        'is_active' => true,
      ],
    ];

    foreach ($templates as $templateData) {
      SiteTemplate::updateOrCreate(
        ['slug' => $templateData['slug']],
        $templateData
      );
    }
  }
}
