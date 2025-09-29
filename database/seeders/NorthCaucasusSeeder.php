<?php

namespace Database\Seeders;

use App\Models\FederalDistrict;
use App\Models\Region;
use App\Models\City;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class NorthCaucasusSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $this->command->info('Добавляем регионы Северо-Кавказского федерального округа...');

    $northCaucasusFD = FederalDistrict::where('code', 'NCFD')->first();

    if (!$northCaucasusFD) {
      $this->command->error('Северо-Кавказский федеральный округ не найден!');
      return;
    }

    $regions = [
      [
        'code' => '05',
        'name' => 'Республика Дагестан',
        'capital' => 'Махачкала',
        'type' => 'republic',
        'population' => 3100000,
        'area' => 50270,
      ],
      [
        'code' => '08',
        'name' => 'Республика Калмыкия',
        'capital' => 'Элиста',
        'type' => 'republic',
        'population' => 270000,
        'area' => 74731,
      ],
      [
        'code' => '15',
        'name' => 'Республика Северная Осетия — Алания',
        'capital' => 'Владикавказ',
        'type' => 'republic',
        'population' => 700000,
        'area' => 7987,
      ],
      [
        'code' => '20',
        'name' => 'Чеченская Республика',
        'capital' => 'Грозный',
        'type' => 'republic',
        'population' => 1500000,
        'area' => 16165,
      ],
      // Ставропольский край уже существует, пропускаем
    ];

    $importedCount = 0;

    foreach ($regions as $regionData) {
      // Создаем или обновляем регион
      $region = Region::updateOrCreate(
        ['code' => $regionData['code']],
        [
          'federal_district_id' => $northCaucasusFD->id,
          'name' => $regionData['name'],
          'slug' => Str::slug($regionData['name']),
          'capital' => $regionData['capital'],
          'type' => $regionData['type'],
          'population' => $regionData['population'],
          'area' => $regionData['area'],
          'is_active' => true,
        ]
      );

      // Создаем столицу региона в таблице cities
      City::updateOrCreate(
        [
          'region_id' => $region->id,
          'name' => $regionData['capital']
        ],
        [
          'slug' => Str::slug($regionData['capital']),
          'type' => 'city',
          'status' => 'regional_center',
          'is_active' => true,
        ]
      );

      // Добавляем дополнительные города для некоторых регионов
      $additionalCities = $this->getAdditionalCities($regionData['code']);
      foreach ($additionalCities as $cityName) {
        City::updateOrCreate(
          [
            'region_id' => $region->id,
            'name' => $cityName
          ],
          [
            'slug' => Str::slug($cityName),
            'type' => 'city',
            'status' => 'ordinary',
            'is_active' => true,
          ]
        );
      }

      $importedCount++;
      $this->command->info("Добавлен регион: {$regionData['name']} (столица: {$regionData['capital']})");
    }

    $this->command->info("Импорт завершен!");
    $this->command->info("Добавлено регионов: {$importedCount}");
    $this->command->info("Всего регионов в Северо-Кавказском ФО: " . $northCaucasusFD->regions()->count());
    $this->command->info("Всего городов в Северо-Кавказском ФО: " . City::whereHas('region.federalDistrict', function ($q) {
      $q->where('code', 'NCFD');
    })->count());
  }

  /**
   * Получает дополнительные города для региона
   */
  private function getAdditionalCities(string $regionCode): array
  {
    $cities = [
      '05' => [ // Дагестан
        'Дербент',
        'Каспийск',
        'Хасавюрт',
        'Кизляр',
        'Буйнакск',
      ],
      '08' => [ // Калмыкия
        'Лагань',
        'Городовиковск',
      ],
      '15' => [ // Северная Осетия — Алания
        'Моздок',
        'Беслан',
        'Алагир',
      ],
      '20' => [ // Чечня
        'Урус-Мартан',
        'Гудермес',
        'Шали',
        'Аргун',
      ],
      '24' => [ // Ставропольский край
        'Пятигорск',
        'Кисловодск',
        'Ессентуки',
        'Железноводск',
        'Минеральные Воды',
        'Невинномысск',
        'Будённовск',
        'Георгиевск',
        'Лермонтов',
      ],
    ];

    return $cities[$regionCode] ?? [];
  }
}
