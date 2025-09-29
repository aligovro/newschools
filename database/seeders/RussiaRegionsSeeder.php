<?php

namespace Database\Seeders;

use App\Models\FederalDistrict;
use App\Models\Region;
use App\Models\City;
use Illuminate\Database\Seeder;

class RussiaRegionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем федеральные округа
        $federalDistricts = [
            [
                'name' => 'Центральный федеральный округ',
                'slug' => 'central-federal-district',
                'code' => 'CFD',
                'center' => 'Москва',
                'latitude' => 55.7558,
                'longitude' => 37.6176,
                'area' => 652800,
                'population' => 39170000,
            ],
            [
                'name' => 'Северо-Западный федеральный округ',
                'slug' => 'northwest-federal-district',
                'code' => 'NWFD',
                'center' => 'Санкт-Петербург',
                'latitude' => 59.9311,
                'longitude' => 30.3609,
                'area' => 1687000,
                'population' => 13800000,
            ],
            [
                'name' => 'Южный федеральный округ',
                'slug' => 'south-federal-district',
                'code' => 'SFD',
                'center' => 'Ростов-на-Дону',
                'latitude' => 47.2357,
                'longitude' => 39.7015,
                'area' => 447900,
                'population' => 16400000,
            ],
            [
                'name' => 'Северо-Кавказский федеральный округ',
                'slug' => 'north-caucasus-federal-district',
                'code' => 'NCFD',
                'center' => 'Пятигорск',
                'latitude' => 44.0486,
                'longitude' => 43.0594,
                'area' => 172360,
                'population' => 9700000,
            ],
            [
                'name' => 'Приволжский федеральный округ',
                'slug' => 'volga-federal-district',
                'code' => 'PFD',
                'center' => 'Нижний Новгород',
                'latitude' => 56.2965,
                'longitude' => 43.9361,
                'area' => 1038000,
                'population' => 29700000,
            ],
            [
                'name' => 'Уральский федеральный округ',
                'slug' => 'ural-federal-district',
                'code' => 'UFD',
                'center' => 'Екатеринбург',
                'latitude' => 56.8431,
                'longitude' => 60.6454,
                'area' => 1818800,
                'population' => 12200000,
            ],
            [
                'name' => 'Сибирский федеральный округ',
                'slug' => 'siberian-federal-district',
                'code' => 'SibFD',
                'center' => 'Новосибирск',
                'latitude' => 55.0084,
                'longitude' => 82.9357,
                'area' => 5114800,
                'population' => 17200000,
            ],
            [
                'name' => 'Дальневосточный федеральный округ',
                'slug' => 'far-eastern-federal-district',
                'code' => 'FEFD',
                'center' => 'Владивосток',
                'latitude' => 43.1056,
                'longitude' => 131.8735,
                'area' => 6169300,
                'population' => 8100000,
            ],
        ];

        $createdDistricts = [];
        foreach ($federalDistricts as $district) {
            $createdDistricts[$district['code']] = FederalDistrict::firstOrCreate(
                ['code' => $district['code']],
                $district
            );
        }

        // Создаем основные регионы
        $regions = [
            // Центральный федеральный округ
            [
                'federal_district_code' => 'CFD',
                'name' => 'Москва',
                'slug' => 'moscow',
                'code' => '77',
                'capital' => 'Москва',
                'latitude' => 55.7558,
                'longitude' => 37.6176,
                'population' => 12678079,
                'area' => 2561,
                'type' => 'federal_city',
            ],
            [
                'federal_district_code' => 'CFD',
                'name' => 'Московская область',
                'slug' => 'moscow-oblast',
                'code' => '50',
                'capital' => 'Москва',
                'latitude' => 55.7558,
                'longitude' => 37.6176,
                'population' => 7500000,
                'area' => 44300,
                'type' => 'oblast',
            ],
            [
                'federal_district_code' => 'CFD',
                'name' => 'Белгородская область',
                'slug' => 'belgorod-oblast',
                'code' => '31',
                'capital' => 'Белгород',
                'latitude' => 50.5958,
                'longitude' => 36.5873,
                'population' => 1540000,
                'area' => 27100,
                'type' => 'oblast',
            ],
            [
                'federal_district_code' => 'CFD',
                'name' => 'Брянская область',
                'slug' => 'bryansk-oblast',
                'code' => '32',
                'capital' => 'Брянск',
                'latitude' => 53.2434,
                'longitude' => 34.3654,
                'population' => 1200000,
                'area' => 34900,
                'type' => 'oblast',
            ],

            // Северо-Западный федеральный округ
            [
                'federal_district_code' => 'NWFD',
                'name' => 'Санкт-Петербург',
                'slug' => 'saint-petersburg',
                'code' => '78',
                'capital' => 'Санкт-Петербург',
                'latitude' => 59.9311,
                'longitude' => 30.3609,
                'population' => 5398064,
                'area' => 1439,
                'type' => 'federal_city',
            ],
            [
                'federal_district_code' => 'NWFD',
                'name' => 'Ленинградская область',
                'slug' => 'leningrad-oblast',
                'code' => '47',
                'capital' => 'Гатчина',
                'latitude' => 59.5654,
                'longitude' => 30.1284,
                'population' => 1850000,
                'area' => 83900,
                'type' => 'oblast',
            ],
            [
                'federal_district_code' => 'NWFD',
                'name' => 'Архангельская область',
                'slug' => 'arkhangelsk-oblast',
                'code' => '29',
                'capital' => 'Архангельск',
                'latitude' => 64.5401,
                'longitude' => 40.5433,
                'population' => 1120000,
                'area' => 413100,
                'type' => 'oblast',
            ],
            [
                'federal_district_code' => 'NWFD',
                'name' => 'Вологодская область',
                'slug' => 'vologda-oblast',
                'code' => '35',
                'capital' => 'Вологда',
                'latitude' => 59.2181,
                'longitude' => 39.8886,
                'population' => 1180000,
                'area' => 144500,
                'type' => 'oblast',
            ],
            [
                'federal_district_code' => 'NWFD',
                'name' => 'Калининградская область',
                'slug' => 'kaliningrad-oblast',
                'code' => '39',
                'capital' => 'Калининград',
                'latitude' => 54.7065,
                'longitude' => 20.5110,
                'population' => 1010000,
                'area' => 15100,
                'type' => 'oblast',
            ],
        ];

        $createdRegions = [];
        foreach ($regions as $region) {
            $region['federal_district_id'] = $createdDistricts[$region['federal_district_code']]->id;
            unset($region['federal_district_code']);
            $createdRegions[$region['code']] = Region::firstOrCreate(
                ['code' => $region['code']],
                $region
            );
        }

        // Создаем основные города
        $cities = [
            // Центральный федеральный округ
            ['region_code' => '77', 'name' => 'Москва', 'type' => 'city', 'status' => 'capital'],
            ['region_code' => '50', 'name' => 'Подольск', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '50', 'name' => 'Химки', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '50', 'name' => 'Королёв', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '31', 'name' => 'Белгород', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '31', 'name' => 'Старый Оскол', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '32', 'name' => 'Брянск', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '32', 'name' => 'Клинцы', 'type' => 'city', 'status' => 'ordinary'],

            // Северо-Западный федеральный округ
            ['region_code' => '78', 'name' => 'Санкт-Петербург', 'type' => 'city', 'status' => 'capital'],
            ['region_code' => '47', 'name' => 'Гатчина', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '47', 'name' => 'Выборг', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '47', 'name' => 'Тихвин', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '29', 'name' => 'Архангельск', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '29', 'name' => 'Северодвинск', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '35', 'name' => 'Вологда', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '35', 'name' => 'Череповец', 'type' => 'city', 'status' => 'ordinary'],
            ['region_code' => '39', 'name' => 'Калининград', 'type' => 'city', 'status' => 'regional_center'],
            ['region_code' => '39', 'name' => 'Советск', 'type' => 'city', 'status' => 'ordinary'],
        ];

        foreach ($cities as $city) {
            $city['region_id'] = $createdRegions[$city['region_code']]->id;
            $city['slug'] = \Str::slug($city['name']);
            unset($city['region_code']);
            City::firstOrCreate(
                ['region_id' => $city['region_id'], 'name' => $city['name']],
                $city
            );
        }

        $this->command->info('Создано федеральных округов: ' . FederalDistrict::count());
        $this->command->info('Создано регионов: ' . Region::count());
        $this->command->info('Создано городов: ' . City::count());
    }
}
