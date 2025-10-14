<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\FederalDistrict;
use Illuminate\Database\Seeder;

class RegionsSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Получаем федеральные округа
    $centralDistrict = FederalDistrict::where('name', 'Центральный федеральный округ')->first();
    $northwesternDistrict = FederalDistrict::where('name', 'Северо-Западный федеральный округ')->first();
    $southernDistrict = FederalDistrict::where('name', 'Южный федеральный округ')->first();
    $volgaDistrict = FederalDistrict::where('name', 'Приволжский федеральный округ')->first();
    $uralDistrict = FederalDistrict::where('name', 'Уральский федеральный округ')->first();
    $siberianDistrict = FederalDistrict::where('name', 'Сибирский федеральный округ')->first();
    $farEasternDistrict = FederalDistrict::where('name', 'Дальневосточный федеральный округ')->first();

    $regions = [
      // Центральный федеральный округ
      ['name' => 'Москва', 'slug' => 'moscow', 'code' => '77', 'capital' => 'Москва', 'type' => 'federal_city', 'federal_district_id' => $centralDistrict?->id],
      ['name' => 'Московская область', 'slug' => 'moscow-oblast', 'code' => '50', 'capital' => 'Красногорск', 'type' => 'oblast', 'federal_district_id' => $centralDistrict?->id],
      ['name' => 'Санкт-Петербург', 'slug' => 'saint-petersburg', 'code' => '78', 'capital' => 'Санкт-Петербург', 'type' => 'federal_city', 'federal_district_id' => $northwesternDistrict?->id],
      ['name' => 'Ленинградская область', 'slug' => 'leningrad-oblast', 'code' => '47', 'capital' => 'Гатчина', 'type' => 'oblast', 'federal_district_id' => $northwesternDistrict?->id],

      // Приволжский федеральный округ
      ['name' => 'Самарская область', 'slug' => 'samara-oblast', 'code' => '63', 'capital' => 'Самара', 'type' => 'oblast', 'federal_district_id' => $volgaDistrict?->id],
      ['name' => 'Республика Татарстан', 'slug' => 'tatarstan', 'code' => '16', 'capital' => 'Казань', 'type' => 'republic', 'federal_district_id' => $volgaDistrict?->id],
      ['name' => 'Нижегородская область', 'slug' => 'nizhny-novgorod-oblast', 'code' => '52', 'capital' => 'Нижний Новгород', 'type' => 'oblast', 'federal_district_id' => $volgaDistrict?->id],

      // Южный федеральный округ
      ['name' => 'Краснодарский край', 'slug' => 'krasnodar-krai', 'code' => '23', 'capital' => 'Краснодар', 'type' => 'krai', 'federal_district_id' => $southernDistrict?->id],
      ['name' => 'Ростовская область', 'slug' => 'rostov-oblast', 'code' => '61', 'capital' => 'Ростов-на-Дону', 'type' => 'oblast', 'federal_district_id' => $southernDistrict?->id],

      // Уральский федеральный округ
      ['name' => 'Свердловская область', 'slug' => 'sverdlovsk-oblast', 'code' => '66', 'capital' => 'Екатеринбург', 'type' => 'oblast', 'federal_district_id' => $uralDistrict?->id],
      ['name' => 'Ханты-Мансийский автономный округ — Югра', 'slug' => 'khanty-mansiysk-ao', 'code' => '86', 'capital' => 'Ханты-Мансийск', 'type' => 'autonomous_okrug', 'federal_district_id' => $uralDistrict?->id],

      // Сибирский федеральный округ
      ['name' => 'Новосибирская область', 'slug' => 'novosibirsk-oblast', 'code' => '54', 'capital' => 'Новосибирск', 'type' => 'oblast', 'federal_district_id' => $siberianDistrict?->id],
      ['name' => 'Красноярский край', 'slug' => 'krasnoyarsk-krai', 'code' => '24', 'capital' => 'Красноярск', 'type' => 'krai', 'federal_district_id' => $siberianDistrict?->id],

      // Дальневосточный федеральный округ
      ['name' => 'Приморский край', 'slug' => 'primorsky-krai', 'code' => '25', 'capital' => 'Владивосток', 'type' => 'krai', 'federal_district_id' => $farEasternDistrict?->id],
      ['name' => 'Хабаровский край', 'slug' => 'khabarovsk-krai', 'code' => '27', 'capital' => 'Хабаровск', 'type' => 'krai', 'federal_district_id' => $farEasternDistrict?->id],
    ];

    foreach ($regions as $regionData) {
      Region::updateOrCreate(
        ['code' => $regionData['code']],
        $regionData
      );
    }
  }
}
