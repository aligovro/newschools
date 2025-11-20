<?php

namespace Database\Seeders;

use App\Models\FederalDistrict;
use App\Models\Region;
use App\Models\Locality;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WPDataImporter extends Seeder
{
  /**
   * Маппинг кодов WordPress на наши регионы
   */
  private array $wpRegionMapping = [
    're_77' => ['code' => '77', 'name' => 'Москва', 'type' => 'federal_city', 'capital' => 'Москва'],
    're_78' => ['code' => '78', 'name' => 'Санкт-Петербург', 'type' => 'federal_city', 'capital' => 'Санкт-Петербург'],
    're_50' => ['code' => '50', 'name' => 'Московская область', 'type' => 'oblast', 'capital' => 'Москва'],
    're_47' => ['code' => '47', 'name' => 'Ленинградская область', 'type' => 'oblast', 'capital' => 'Гатчина'],
    're_31' => ['code' => '31', 'name' => 'Белгородская область', 'type' => 'oblast', 'capital' => 'Белгород'],
    're_32' => ['code' => '32', 'name' => 'Брянская область', 'type' => 'oblast', 'capital' => 'Брянск'],
    're_29' => ['code' => '29', 'name' => 'Архангельская область', 'type' => 'oblast', 'capital' => 'Архангельск'],
    're_35' => ['code' => '35', 'name' => 'Вологодская область', 'type' => 'oblast', 'capital' => 'Вологда'],
    're_39' => ['code' => '39', 'name' => 'Калининградская область', 'type' => 'oblast', 'capital' => 'Калининград'],
    're_16' => ['code' => '16', 'name' => 'Республика Татарстан', 'type' => 'republic', 'capital' => 'Казань'],
    're_2' => ['code' => '2', 'name' => 'Республика Башкортостан', 'type' => 'republic', 'capital' => 'Уфа'],
    're_28' => ['code' => '28', 'name' => 'Амурская область', 'type' => 'oblast', 'capital' => 'Благовещенск'],
    're_25' => ['code' => '25', 'name' => 'Приморский край', 'type' => 'krai', 'capital' => 'Владивосток'],
    're_89' => ['code' => '89', 'name' => 'Ямало-Ненецкий автономный округ', 'type' => 'autonomous_okrug', 'capital' => 'Салехард'],
    're_66' => ['code' => '66', 'name' => 'Свердловская область', 'type' => 'oblast', 'capital' => 'Екатеринбург'],
    're_43' => ['code' => '43', 'name' => 'Кировская область', 'type' => 'oblast', 'capital' => 'Киров'],
    're_65' => ['code' => '65', 'name' => 'Самарская область', 'type' => 'oblast', 'capital' => 'Самара'],
    're_75' => ['code' => '75', 'name' => 'Забайкальский край', 'type' => 'krai', 'capital' => 'Чита'],
    're_13' => ['code' => '13', 'name' => 'Республика Мордовия', 'type' => 'republic', 'capital' => 'Саранск'],
    're_30' => ['code' => '30', 'name' => 'Астраханская область', 'type' => 'oblast', 'capital' => 'Астрахань'],
    're_86' => ['code' => '86', 'name' => 'Ханты-Мансийский автономный округ — Югра', 'type' => 'autonomous_okrug', 'capital' => 'Ханты-Мансийск'],
    're_72' => ['code' => '72', 'name' => 'Тюменская область', 'type' => 'oblast', 'capital' => 'Тюмень'],
    're_12' => ['code' => '12', 'name' => 'Республика Марий Эл', 'type' => 'republic', 'capital' => 'Йошкар-Ола'],
    're_4' => ['code' => '4', 'name' => 'Республика Алтай', 'type' => 'republic', 'capital' => 'Горно-Алтайск'],
    're_27' => ['code' => '27', 'name' => 'Красноярский край', 'type' => 'krai', 'capital' => 'Красноярск'],
    're_64' => ['code' => '64', 'name' => 'Саратовская область', 'type' => 'oblast', 'capital' => 'Саратов'],
    're_7' => ['code' => '7', 'name' => 'Республика Кабардино-Балкария', 'type' => 'republic', 'capital' => 'Нальчик'],
    're_56' => ['code' => '56', 'name' => 'Оренбургская область', 'type' => 'oblast', 'capital' => 'Оренбург'],
    're_41' => ['code' => '41', 'name' => 'Камчатский край', 'type' => 'krai', 'capital' => 'Петропавловск-Камчатский'],
    're_9' => ['code' => '9', 'name' => 'Республика Карачаево-Черкесия', 'type' => 'republic', 'capital' => 'Черкесск'],
    're_11' => ['code' => '11', 'name' => 'Республика Коми', 'type' => 'republic', 'capital' => 'Сыктывкар'],
    're_5' => ['code' => '5', 'name' => 'Республика Бурятия', 'type' => 'republic', 'capital' => 'Улан-Удэ'],
    're_63' => ['code' => '63', 'name' => 'Сахалинская область', 'type' => 'oblast', 'capital' => 'Южно-Сахалинск'],
    're_40' => ['code' => '40', 'name' => 'Калужская область', 'type' => 'oblast', 'capital' => 'Калуга'],
    're_17' => ['code' => '17', 'name' => 'Республика Тыва', 'type' => 'republic', 'capital' => 'Кызыл'],
    're_76' => ['code' => '76', 'name' => 'Ярославская область', 'type' => 'oblast', 'capital' => 'Ярославль'],
    're_52' => ['code' => '52', 'name' => 'Нижегородская область', 'type' => 'oblast', 'capital' => 'Нижний Новгород'],
    're_38' => ['code' => '38', 'name' => 'Иркутская область', 'type' => 'oblast', 'capital' => 'Иркутск'],
    're_22' => ['code' => '22', 'name' => 'Алтайский край', 'type' => 'krai', 'capital' => 'Барнаул'],
    're_73' => ['code' => '73', 'name' => 'Ульяновская область', 'type' => 'oblast', 'capital' => 'Ульяновск'],
    're_48' => ['code' => '48', 'name' => 'Липецкая область', 'type' => 'oblast', 'capital' => 'Липецк'],
    'kb' => ['code' => 'KB', 'name' => 'Кабардино-Балкарская Республика', 'type' => 'republic', 'capital' => 'Нальчик'],
    're_6' => ['code' => '6', 'name' => 'Республика Ингушетия', 'type' => 'republic', 'capital' => 'Магас'],
    're_79' => ['code' => '79', 'name' => 'Еврейская автономная область', 'type' => 'autonomous_oblast', 'capital' => 'Биробиджан'],
    're_26' => ['code' => '26', 'name' => 'Ставропольский край', 'type' => 'krai', 'capital' => 'Ставрополь'],
    're_44' => ['code' => '44', 'name' => 'Костромская область', 'type' => 'oblast', 'capital' => 'Кострома'],
    're_3' => ['code' => '3', 'name' => 'Республика Адыгея', 'type' => 'republic', 'capital' => 'Майкоп'],
    're_14' => ['code' => '14', 'name' => 'Республика Саха (Якутия)', 'type' => 'republic', 'capital' => 'Якутск'],
    're_53' => ['code' => '53', 'name' => 'Новгородская область', 'type' => 'oblast', 'capital' => 'Великий Новгород'],
    're_51' => ['code' => '51', 'name' => 'Мурманская область', 'type' => 'oblast', 'capital' => 'Мурманск'],
    're_61' => ['code' => '61', 'name' => 'Ростовская область', 'type' => 'oblast', 'capital' => 'Ростов-на-Дону'],
    're_74' => ['code' => '74', 'name' => 'Челябинская область', 'type' => 'oblast', 'capital' => 'Челябинск'],
    're_59' => ['code' => '59', 'name' => 'Пермский край', 'type' => 'krai', 'capital' => 'Пермь'],
    're_54' => ['code' => '54', 'name' => 'Новосибирская область', 'type' => 'oblast', 'capital' => 'Новосибирск'],
    're_34' => ['code' => '34', 'name' => 'Волгоградская область', 'type' => 'oblast', 'capital' => 'Волгоград'],
    're_58' => ['code' => '58', 'name' => 'Пензенская область', 'type' => 'oblast', 'capital' => 'Пенза'],
    're_18' => ['code' => '18', 'name' => 'Удмуртская Республика', 'type' => 'republic', 'capital' => 'Ижевск'],
    're_1' => ['code' => '1', 'name' => 'Республика Адыгея (дубликат)', 'type' => 'republic', 'capital' => 'Майкоп'],
    're_55' => ['code' => '55', 'name' => 'Омская область', 'type' => 'oblast', 'capital' => 'Омск'],
    're_83' => ['code' => '83', 'name' => 'Ненецкий автономный округ', 'type' => 'autonomous_okrug', 'capital' => 'Нарьян-Мар'],
    're_23' => ['code' => '23', 'name' => 'Краснодарский край', 'type' => 'krai', 'capital' => 'Краснодар'],
    // Северо-Кавказский федеральный округ
    're_15' => ['code' => '15', 'name' => 'Республика Северная Осетия — Алания', 'type' => 'republic', 'capital' => 'Владикавказ'],
    're_20' => ['code' => '20', 'name' => 'Чеченская Республика', 'type' => 'republic', 'capital' => 'Грозный'],
    're_95' => ['code' => '95', 'name' => 'Чеченская Республика', 'type' => 'republic', 'capital' => 'Грозный'],
    're_24' => ['code' => '24', 'name' => 'Ставропольский край', 'type' => 'krai', 'capital' => 'Ставрополь'],
    're_05' => ['code' => '05', 'name' => 'Республика Дагестан', 'type' => 'republic', 'capital' => 'Махачкала'],
    're_08' => ['code' => '08', 'name' => 'Республика Калмыкия', 'type' => 'republic', 'capital' => 'Элиста'],
  ];

  /**
   * Данные из WordPress charity_regions (из SQL дампа)
   */
  private array $wpCharityData = [
    ['wp_code' => 're_83', 'payments_count' => 4, 'total_amount' => 5060.00],
    ['wp_code' => 're_23', 'payments_count' => 27, 'total_amount' => 810.00],
    ['wp_code' => 're_16', 'payments_count' => 591, 'total_amount' => 725735.00],
    ['wp_code' => 're_2', 'payments_count' => 235, 'total_amount' => 463438.00],
    ['wp_code' => 're_28', 'payments_count' => 68, 'total_amount' => 1330.00],
    ['wp_code' => 're_25', 'payments_count' => 93, 'total_amount' => 102059.00],
    ['wp_code' => 're_89', 'payments_count' => 49, 'total_amount' => 4900.00],
    ['wp_code' => 're_66', 'payments_count' => 87, 'total_amount' => 7426.00],
    ['wp_code' => 're_43', 'payments_count' => 29, 'total_amount' => 5380.00],
    ['wp_code' => 're_65', 'payments_count' => 20, 'total_amount' => 99430.00],
    ['wp_code' => 're_75', 'payments_count' => 2, 'total_amount' => 5100.00],
    ['wp_code' => 're_13', 'payments_count' => 4, 'total_amount' => 800.00],
    ['wp_code' => 're_30', 'payments_count' => 34, 'total_amount' => 7830.00],
    ['wp_code' => 're_86', 'payments_count' => 138, 'total_amount' => 24550.00],
    ['wp_code' => 're_72', 'payments_count' => 10, 'total_amount' => 4704.00],
    ['wp_code' => 're_12', 'payments_count' => 1, 'total_amount' => 1000.00],
    ['wp_code' => 're_4', 'payments_count' => 1, 'total_amount' => 300.00],
    ['wp_code' => 're_77', 'payments_count' => 24, 'total_amount' => 7080160.00],
    ['wp_code' => 're_27', 'payments_count' => 28, 'total_amount' => 3681800.00],
    ['wp_code' => 're_64', 'payments_count' => 1, 'total_amount' => 1000.00],
    ['wp_code' => 're_7', 'payments_count' => 1, 'total_amount' => 300.00],
    ['wp_code' => 're_50', 'payments_count' => 3, 'total_amount' => 1700.00],
    ['wp_code' => 're_56', 'payments_count' => 56, 'total_amount' => 9800.00],
    ['wp_code' => 're_41', 'payments_count' => 1, 'total_amount' => 200.00],
    ['wp_code' => 're_9', 'payments_count' => 1, 'total_amount' => 500.00],
    ['wp_code' => 're_11', 'payments_count' => 1, 'total_amount' => 5000.00],
    ['wp_code' => 're_5', 'payments_count' => 15, 'total_amount' => 52040.00],
    ['wp_code' => 're_63', 'payments_count' => 90, 'total_amount' => 60896.00],
    ['wp_code' => 're_40', 'payments_count' => 129, 'total_amount' => 21950.00],
    ['wp_code' => 're_17', 'payments_count' => 77, 'total_amount' => 76999.00],
    ['wp_code' => 're_76', 'payments_count' => 1, 'total_amount' => 200.00],
    ['wp_code' => 're_52', 'payments_count' => 7, 'total_amount' => 1279.00],
    ['wp_code' => 're_38', 'payments_count' => 1, 'total_amount' => 100.00],
    ['wp_code' => 're_22', 'payments_count' => 1, 'total_amount' => 1000.00],
    ['wp_code' => 're_73', 'payments_count' => 124, 'total_amount' => 17612.00],
    ['wp_code' => 're_78', 'payments_count' => 181, 'total_amount' => 161188.00],
    ['wp_code' => 're_48', 'payments_count' => 1, 'total_amount' => 2000.00],
    ['wp_code' => 'kb', 'payments_count' => 16, 'total_amount' => 29000.00],
    ['wp_code' => 're_6', 'payments_count' => 3, 'total_amount' => 20000.00],
    ['wp_code' => 're_79', 'payments_count' => 22, 'total_amount' => 27710.00],
    ['wp_code' => 're_26', 'payments_count' => 7, 'total_amount' => 340.00],
    ['wp_code' => 're_44', 'payments_count' => 5, 'total_amount' => 500.00],
    ['wp_code' => 're_3', 'payments_count' => 3, 'total_amount' => 150.00],
    ['wp_code' => 're_14', 'payments_count' => 7, 'total_amount' => 1250.00],
    ['wp_code' => 're_53', 'payments_count' => 3, 'total_amount' => 99.00],
    ['wp_code' => 're_51', 'payments_count' => 1, 'total_amount' => 100.00],
    ['wp_code' => 're_61', 'payments_count' => 1, 'total_amount' => 5000.00],
    ['wp_code' => 're_74', 'payments_count' => 25, 'total_amount' => 12500.00],
    ['wp_code' => 're_59', 'payments_count' => 48, 'total_amount' => 19200.00],
    ['wp_code' => 're_54', 'payments_count' => 8, 'total_amount' => 1600.00],
    ['wp_code' => 're_34', 'payments_count' => 93, 'total_amount' => 9300.00],
    ['wp_code' => 're_58', 'payments_count' => 47, 'total_amount' => 61577.00],
    ['wp_code' => 're_18', 'payments_count' => 6, 'total_amount' => 6585.00],
    ['wp_code' => 're_1', 'payments_count' => 7, 'total_amount' => 3108.00],
    ['wp_code' => 're_55', 'payments_count' => 1, 'total_amount' => 100.00],
  ];

  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $this->command->info('Начинаем импорт данных из WordPress...');

    $centralFD = FederalDistrict::where('code', 'CFD')->first();
    $northwestFD = FederalDistrict::where('code', 'NWFD')->first();
    $volgaFD = FederalDistrict::where('code', 'PFD')->first();
    $siberianFD = FederalDistrict::where('code', 'SibFD')->first();
    $uralFD = FederalDistrict::where('code', 'UFD')->first();
    $southFD = FederalDistrict::where('code', 'SFD')->first();
    $northCaucasusFD = FederalDistrict::where('code', 'NCFD')->first();
    $farEastFD = FederalDistrict::where('code', 'FEFD')->first();

    $importedCount = 0;
    $skippedCount = 0;

    foreach ($this->wpCharityData as $wpData) {
      $wpCode = $wpData['wp_code'];

      if (!isset($this->wpRegionMapping[$wpCode])) {
        $this->command->warn("Не найден маппинг для кода: {$wpCode}");
        $skippedCount++;
        continue;
      }

      $regionData = $this->wpRegionMapping[$wpCode];

      // Определяем федеральный округ по типу региона
      $federalDistrict = $this->getFederalDistrictByRegionType($regionData['type'], $regionData['code']);

      if (!$federalDistrict) {
        $this->command->warn("Не найден федеральный округ для региона: {$regionData['name']}");
        $skippedCount++;
        continue;
      }

      // Создаем или обновляем регион
      $region = Region::updateOrCreate(
        ['code' => $regionData['code']],
        [
          'federal_district_id' => $federalDistrict->id,
          'name' => $regionData['name'],
          'slug' => Str::slug($regionData['name']),
          'capital' => $regionData['capital'],
          'type' => $regionData['type'],
          'is_active' => true,
          // Добавляем статистику из WordPress
          'population' => $this->getEstimatedPopulation($regionData['code']),
          'area' => $this->getEstimatedArea($regionData['code']),
        ]
      );

      // Создаем столицу региона в таблице localities
      Locality::updateOrCreate(
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

      $importedCount++;
      $this->command->info("Импортирован регион: {$regionData['name']} (платежей: {$wpData['payments_count']}, сумма: {$wpData['total_amount']})");
    }

    $this->command->info("Импорт завершен!");
    $this->command->info("Импортировано регионов: {$importedCount}");
    $this->command->info("Пропущено: {$skippedCount}");
    $this->command->info("Всего регионов в БД: " . Region::count());
    $this->command->info("Всего городов в БД: " . Locality::count());
  }

  /**
   * Определяет федеральный округ по типу и коду региона
   */
  private function getFederalDistrictByRegionType(string $type, string $code): ?FederalDistrict
  {
    // Центральный федеральный округ
    if (in_array($code, ['77', '50', '31', '32', '36', '37', '40', '44', '48', '57', '62', '67', '68', '69', '71', '76'])) {
      return FederalDistrict::where('code', 'CFD')->first();
    }

    // Северо-Западный федеральный округ
    if (in_array($code, ['78', '47', '29', '35', '39', '51', '53', '60', '83', '11', '17'])) {
      return FederalDistrict::where('code', 'NWFD')->first();
    }

    // Южный федеральный округ
    if (in_array($code, ['61', '34', '30', '23', '26', '1', '3', '7', '9', 'KB'])) {
      return FederalDistrict::where('code', 'SFD')->first();
    }

    // Северо-Кавказский федеральный округ
    if (in_array($code, ['6', '15', '20', '95', '24', '05', '08'])) {
      return FederalDistrict::where('code', 'NCFD')->first();
    }

    // Приволжский федеральный округ
    if (in_array($code, ['16', '2', '12', '13', '18', '52', '56', '58', '63', '64', '73', '86', '43', '65'])) {
      return FederalDistrict::where('code', 'PFD')->first();
    }

    // Уральский федеральный округ
    if (in_array($code, ['66', '72', '74', '89', '59'])) {
      return FederalDistrict::where('code', 'UFD')->first();
    }

    // Сибирский федеральный округ
    if (in_array($code, ['54', '22', '38', '42', '55', '70', '75', '5', '17'])) {
      return FederalDistrict::where('code', 'SibFD')->first();
    }

    // Дальневосточный федеральный округ
    if (in_array($code, ['25', '27', '28', '41', '79', '87', '14', '4'])) {
      return FederalDistrict::where('code', 'FEFD')->first();
    }

    return null;
  }

  /**
   * Получает примерное население региона по коду
   */
  private function getEstimatedPopulation(string $code): ?int
  {
    $populations = [
      '77' => 12678079, // Москва
      '78' => 5398064,  // Санкт-Петербург
      '50' => 7500000,  // Московская область
      '47' => 1850000,  // Ленинградская область
      '16' => 3900000,  // Татарстан
      '2' => 4000000,   // Башкортостан
      '66' => 4300000,  // Свердловская область
      '61' => 4200000,  // Ростовская область
      '54' => 2700000,  // Новосибирская область
      '74' => 3500000,  // Челябинская область
    ];

    return $populations[$code] ?? null;
  }

  /**
   * Получает примерную площадь региона по коду
   */
  private function getEstimatedArea(string $code): ?int
  {
    $areas = [
      '77' => 2561,    // Москва
      '78' => 1439,    // Санкт-Петербург
      '50' => 44300,   // Московская область
      '47' => 83900,   // Ленинградская область
      '16' => 67847,   // Татарстан
      '2' => 142947,   // Башкортостан
      '66' => 194307,  // Свердловская область
      '61' => 100967,  // Ростовская область
      '54' => 177756,  // Новосибирская область
      '74' => 88529,   // Челябинская область
    ];

    return $areas[$code] ?? null;
  }
}
