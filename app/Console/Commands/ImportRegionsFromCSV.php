<?php

namespace App\Console\Commands;

use App\Models\Region;
use App\Models\FederalDistrict;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportRegionsFromCSV extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'regions:import-csv {--url=https://raw.githubusercontent.com/epogrebnyak/ru-cities/main/assets/towns.csv}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import regions from CSV file';

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

            $regionsToAdd = [];

            foreach ($lines as $line) {
                if (empty(trim($line))) {
                    continue;
                }

                try {
                    $row = str_getcsv($line);

                    if (count($row) < 12) {
                        continue;
                    }

                    $regionName = $row[4] ?? null;
                    $federalDistrictName = $row[6] ?? null;

                    if (empty($regionName)) {
                        continue;
                    }

                    // Определяем федеральный округ
                    $federalDistrictCode = $this->getFederalDistrictCode($federalDistrictName);

                    if (!$federalDistrictCode) {
                        continue;
                    }

                    $federalDistrict = FederalDistrict::where('code', $federalDistrictCode)->first();

                    if (!$federalDistrict) {
                        continue;
                    }

                    // Определяем тип региона
                    $type = $this->determineRegionType($regionName);

                    // Добавляем регион в список
                    if (!isset($regionsToAdd[$regionName])) {
                        $regionsToAdd[$regionName] = [
                            'name' => $regionName,
                            'federal_district_id' => $federalDistrict->id,
                            'type' => $type,
                        ];
                    }
                } catch (\Exception $e) {
                    // Игнорируем ошибки
                }
            }

            $imported = 0;
            $skipped = 0;

            foreach ($regionsToAdd as $regionData) {
                // Проверяем, существует ли регион
                $existingRegion = Region::where('name', $regionData['name'])->first();

                if ($existingRegion) {
                    $skipped++;
                    continue;
                }

                // Создаем регион
                Region::create([
                    'federal_district_id' => $regionData['federal_district_id'],
                    'name' => $regionData['name'],
                    'slug' => Str::slug($regionData['name']),
                    'code' => $this->generateRegionCode($regionData['name']),
                    'capital' => $this->determineCapital($regionData['name']),
                    'latitude' => null,
                    'longitude' => null,
                    'population' => null,
                    'area' => null,
                    'timezone' => 'Europe/Moscow',
                    'type' => $regionData['type'],
                    'is_active' => true,
                ]);

                $imported++;
            }

            $this->info("\nИмпорт завершен!");
            $this->info("Добавлено регионов: {$imported}");
            $this->info("Пропущено дубликатов: {$skipped}");
            $this->info("Всего регионов в БД: " . Region::count());

            return 0;
        } catch (\Exception $e) {
            $this->error('Ошибка: ' . $e->getMessage());
            return 1;
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
            if (strpos($name, $districtName) !== false || strpos($districtName, $name) !== false) {
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
        } elseif (stripos($regionName, 'автономный округ') !== false) {
            return 'autonomous_okrug';
        } elseif (stripos($regionName, 'автономная область') !== false) {
            return 'autonomous_oblast';
        } elseif (stripos($regionName, 'Москва') !== false || stripos($regionName, 'Санкт-Петербург') !== false) {
            return 'federal_city';
        }

        return 'region';
    }

    /**
     * Generate region code
     */
    protected function generateRegionCode($regionName)
    {
        // Простая генерация кода из названия
        $code = strtoupper(substr(Str::slug($regionName), 0, 2));
        return $code;
    }

    /**
     * Determine capital city
     */
    protected function determineCapital($regionName)
    {
        // Базовый список столиц регионов
        $capitals = [
            'Московская область' => 'Москва',
            'Ленинградская область' => 'Санкт-Петербург',
            // Добавьте другие столицы по мере необходимости
        ];

        return $capitals[$regionName] ?? 'Не определено';
    }
}
