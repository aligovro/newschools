<?php

namespace App\Console\Commands;

use App\Models\Region;
use App\Models\City;
use App\Models\FederalDistrict;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportCitiesFromCSV extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cities:import-csv {--url=https://raw.githubusercontent.com/epogrebnyak/ru-cities/main/assets/towns.csv}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import cities from CSV file';

    /**
     * Map of Russian federal district names to codes
     */
    protected $federalDistrictMap = [
        'Центральный' => 'CFD',
        'Северо-Западный' => 'NWFD',
        'Южный' => 'SFD',
        'Северо-Кавказский' => 'NCFD',
        'Приволжский' => 'PFD',
        'Уральский' => 'UFD',
        'Сибирский' => 'SibFD',
        'Дальневосточный' => 'FEFD',
        'Центральный федеральный округ' => 'CFD',
        'Северо-Западный федеральный округ' => 'NWFD',
        'Южный федеральный округ' => 'SFD',
        'Северо-Кавказский федеральный округ' => 'NCFD',
        'Приволжский федеральный округ' => 'PFD',
        'Уральский федеральный округ' => 'UFD',
        'Сибирский федеральный округ' => 'SibFD',
        'Дальневосточный федеральный округ' => 'FEFD',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $url = $this->option('url');

        $this->info('Загрузка данных из CSV...');

        try {
            $csvData = file_get_contents($url);

            if ($csvData === false) {
                $this->error('Не удалось загрузить CSV файл');
                return 1;
            }

            $lines = explode("\n", $csvData);
            $header = str_getcsv(array_shift($lines));

            $this->info('Найдено строк: ' . count($lines));

            $imported = 0;
            $skipped = 0;
            $errors = 0;

            // Кэш регионов для оптимизации
            $regionsCache = [];

            foreach ($lines as $index => $line) {
                if (empty(trim($line))) {
                    continue;
                }

                try {
                    $row = str_getcsv($line);

                    if (count($row) < 12) {
                        $skipped++;
                        continue;
                    }

                    $cityName = $row[0];
                    $population = isset($row[1]) && is_numeric($row[1]) ? (float) $row[1] : null;
                    $latitude = isset($row[2]) && is_numeric($row[2]) ? (float) $row[2] : null;
                    $longitude = isset($row[3]) && is_numeric($row[3]) ? (float) $row[3] : null;
                    $regionName = $row[4] ?? null;
                    $regionIsoCode = $row[6] ?? null;
                    $federalDistrictName = $row[7] ?? null;

                    if (empty($cityName)) {
                        $skipped++;
                        continue;
                    }

                    // Находим регион по имени
                    $region = $this->findRegion($regionName, $regionsCache);

                    // Если регион не найден, пытаемся создать его
                    if (!$region) {
                        $region = $this->createRegion($regionName, $row, $regionsCache);

                        if (!$region) {
                            $errors++;
                            if ($errors <= 10) {
                                $this->warn("Регион не найден и не создан: {$regionName} (город: {$cityName})");
                                $this->warn("Федеральный округ: " . ($federalDistrictName ?? 'не указан'));
                            }
                            continue;
                        }
                    }

                    // Проверяем, существует ли уже город
                    $existingCity = City::where('region_id', $region->id)
                        ->where('name', $cityName)
                        ->first();

                    if ($existingCity) {
                        $skipped++;
                        continue;
                    }

                    // Определяем тип города
                    $type = $this->determineCityType($cityName);

                    // Определяем статус
                    $status = $this->determineCityStatus($cityName, $region);

                    // Создаем город
                    City::create([
                        'region_id' => $region->id,
                        'name' => $cityName,
                        'slug' => $this->generateSlug($region, $cityName),
                        'code' => null,
                        'type' => $type,
                        'status' => $status,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'population' => $population ? (int) ($population * 1000) : null,
                        'area' => null,
                        'founded_year' => null,
                        'is_active' => true,
                    ]);

                    $imported++;

                    if ($imported % 100 === 0) {
                        $this->info("Импортировано {$imported} городов...");
                    }
                } catch (\Exception $e) {
                    $errors++;
                    if ($errors <= 10) {
                        $this->warn("Ошибка при обработке строки " . ($index + 1) . ": " . $e->getMessage());
                    }
                }
            }

            $this->info("\nИмпорт завершен!");
            $this->info("Добавлено городов: {$imported}");
            $this->info("Пропущено дубликатов: {$skipped}");
            $this->info("Ошибок: {$errors}");
            $this->info("Всего городов в БД: " . City::count());

            return 0;
        } catch (\Exception $e) {
            $this->error('Ошибка: ' . $e->getMessage());
            return 1;
        }
    }

    /**
     * Create region from CSV data
     */
    protected function createRegion($regionName, $row, &$cache)
    {
        try {
            $federalDistrictName = $row[7] ?? null;

            if (empty($federalDistrictName)) {
                return null;
            }

            // Определяем федеральный округ
            $federalDistrictCode = $this->getFederalDistrictCode($federalDistrictName);

            if (!$federalDistrictCode) {
                $this->warn("Не найден код для федерального округа: {$federalDistrictName}");
                return null;
            }

            $federalDistrict = FederalDistrict::where('code', $federalDistrictCode)->first();

            if (!$federalDistrict) {
                $this->warn("Федеральный округ не найден в БД: код {$federalDistrictCode}");
                return null;
            }

            // Определяем тип региона
            $type = $this->determineRegionType($regionName);

            // Создаем регион
            $region = Region::create([
                'federal_district_id' => $federalDistrict->id,
                'name' => $regionName,
                'slug' => Str::slug($regionName),
                'code' => $this->generateRegionCode(),
                'capital' => $this->determineCapital($regionName),
                'latitude' => null,
                'longitude' => null,
                'population' => null,
                'area' => null,
                'timezone' => 'Europe/Moscow',
                'type' => $type,
                'is_active' => true,
            ]);

            $this->info("Создан регион: {$regionName}");

            // Кэшируем результат
            $cache[$regionName] = $region;

            return $region;
        } catch (\Exception $e) {
            $this->warn("Ошибка при создании региона {$regionName}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get federal district code by name
     */
    protected function getFederalDistrictCode($name)
    {
        if (empty($name)) {
            return null;
        }

        // Проверяем точное совпадение
        if (isset($this->federalDistrictMap[$name])) {
            return $this->federalDistrictMap[$name];
        }

        // Проверяем частичное совпадение
        foreach ($this->federalDistrictMap as $districtName => $code) {
            // Удаляем слово "федеральный округ" для сравнения
            $districtNameShort = str_replace([' федеральный округ', 'федеральный округ'], '', $districtName);
            $nameShort = str_replace([' федеральный округ', 'федеральный округ'], '', $name);

            if (strpos($nameShort, $districtNameShort) !== false || strpos($districtNameShort, $nameShort) !== false) {
                return $code;
            }
        }

        return null;
    }

    /**
     * Determine region type
     */
    protected function determineRegionType($regionName)
    {
        if (stripos($regionName, 'область') !== false) {
            return 'oblast';
        } elseif (stripos($regionName, 'край') !== false) {
            return 'krai';
        } elseif (stripos($regionName, 'республика') !== false) {
            return 'republic';
        } elseif (stripos($regionName, 'автономный округ') !== false || stripos($regionName, 'автономная область') !== false) {
            return 'autonomous_okrug';
        }

        return 'region';
    }

    /**
     * Generate region code
     */
    protected function generateRegionCode()
    {
        // Генерируем уникальный код
        $code = mt_rand(10000, 99999);

        while (Region::where('code', $code)->exists()) {
            $code = mt_rand(10000, 99999);
        }

        return (string) $code;
    }

    /**
     * Determine capital city
     */
    protected function determineCapital($regionName)
    {
        // Базовый список столиц регионов
        $capitals = [
            'Владимирская область' => 'Владимир',
            // Добавьте другие столицы по мере необходимости
        ];

        return $capitals[$regionName] ?? 'Не определено';
    }

    /**
     * Find region by name
     */
    protected function findRegion($regionName, &$cache)
    {
        if (empty($regionName)) {
            return null;
        }

        // Проверяем кэш
        if (isset($cache[$regionName])) {
            return $cache[$regionName];
        }

        // Ищем точное совпадение
        $region = Region::where('name', $regionName)->first();

        // Если не нашли, пробуем поиск по частичному совпадению
        if (!$region) {
            $region = Region::where('name', 'LIKE', "%{$regionName}%")->first();
        }

        // Если все еще не нашли, пробуем убрать слово "область" и поискать
        if (!$region) {
            $nameWithoutOblast = str_replace(['область', 'край', 'республика', 'Республика'], '', $regionName);
            $nameWithoutOblast = trim($nameWithoutOblast);

            if (!empty($nameWithoutOblast)) {
                $region = Region::where('name', 'LIKE', "%{$nameWithoutOblast}%")->first();
            }
        }

        // Если все еще не нашли, пробуем заменить длинное тире на обычное
        if (!$region) {
            $nameWithNormalDash = str_replace([' – ', ' –', '—', '–'], [' - ', '-', '-', '-'], $regionName);
            if ($nameWithNormalDash !== $regionName) {
                $region = Region::where('name', $nameWithNormalDash)->first();

                // Если все еще не нашли, пробуем поиск по slug
                if (!$region) {
                    $slug = Str::slug($nameWithNormalDash);
                    $region = Region::where('slug', $slug)->first();
                }
            }
        }

        // Если все еще не нашли, пробуем поиск по slug оригинального имени
        if (!$region) {
            $slug = Str::slug($regionName);
            $region = Region::where('slug', $slug)->first();
        }

        // Кэшируем результат
        $cache[$regionName] = $region;

        return $region;
    }

    /**
     * Determine city type
     */
    protected function determineCityType($cityName)
    {
        // Правила для определения типа города
        if (preg_match('/город|г\.|г /i', $cityName)) {
            return 'city';
        } elseif (preg_match('/посёлок|поселок|п\.г\.т|пгт/i', $cityName)) {
            return 'settlement';
        } elseif (preg_match('/село|с\.|с /i', $cityName)) {
            return 'village';
        } else {
            return 'city'; // По умолчанию
        }
    }

    /**
     * Determine city status
     */
    protected function determineCityStatus($cityName, $region)
    {
        // Если это столица региона
        if ($cityName === $region->capital) {
            return 'regional_center';
        }

        return 'ordinary';
    }

    /**
     * Generate unique slug for city
     */
    protected function generateSlug($region, $cityName)
    {
        $baseSlug = Str::slug($cityName);
        $slug = $baseSlug;
        $counter = 1;

        // Проверяем уникальность slug
        while (City::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
