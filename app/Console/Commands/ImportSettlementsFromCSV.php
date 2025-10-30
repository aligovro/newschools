<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\Region;
use App\Models\Settlement;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class ImportSettlementsFromCSV extends Command
{
  protected $signature = 'settlements:import-csv {--url=}';

  protected $description = 'Import settlements from a CSV file (requires --url). Expected headers include at least: name, city, region, latitude, longitude, type';

  public function handle()
  {
    $url = (string) $this->option('url');
    if (trim($url) === '') {
      $this->error('Не указан параметр --url. Пример: php artisan settlements:import-csv --url=https://example.com/settlements.csv');
      return 1;
    }

    $this->info('Загрузка данных из CSV...');

    try {
      $csvData = @file_get_contents($url);
      if ($csvData === false) {
        $this->error('Не удалось загрузить CSV файл');
        return 1;
      }

      $lines = explode("\n", $csvData);
      if (count($lines) === 0) {
        $this->error('Пустой CSV');
        return 1;
      }

      // Parse header
      $header = str_getcsv(array_shift($lines));
      $map = $this->buildHeaderMap($header);

      $this->info('Строк для обработки: ' . count($lines));

      $imported = 0;
      $skipped = 0;
      $errors = 0;

      $regionsCache = [];
      $citiesCache = [];

      foreach ($lines as $index => $line) {
        if (empty(trim($line))) {
          continue;
        }

        try {
          $row = str_getcsv($line);
          if (!$row || count($row) < 2) { // require at least name + region
            $skipped++;
            continue;
          }

          $name = $this->read($row, $map, ['name', 'settlement', 'locality']);
          $regionName = $this->read($row, $map, ['region', 'region_name']);
          $cityName = $this->read($row, $map, ['city', 'city_name']);
          $type = $this->read($row, $map, ['type']);
          $lat = $this->read($row, $map, ['latitude', 'lat']);
          $lon = $this->read($row, $map, ['longitude', 'lon', 'lng']);

          if (!$name || !$regionName) {
            $skipped++;
            continue;
          }

          $region = $this->findRegion($regionName, $regionsCache);
          if (!$region) {
            $skipped++;
            continue;
          }

          $city = null;
          if ($cityName) {
            $cityKey = $region->id . '::' . mb_strtolower($cityName);
            if (isset($citiesCache[$cityKey])) {
              $city = $citiesCache[$cityKey];
            } else {
              $city = City::where('region_id', $region->id)
                ->where('name', $cityName)
                ->first();
              if (!$city) {
                // создадим базовый город, если отсутствует
                $city = City::create([
                  'region_id' => $region->id,
                  'name' => $cityName,
                  'slug' => $this->uniqueSlug(City::class, Str::slug($cityName)),
                  'is_active' => true,
                ]);
              }
              $citiesCache[$cityKey] = $city;
            }
          }

          // Дубликат?
          $existsQuery = Settlement::query()->where('name', $name);
          if ($city) {
            $existsQuery->where('city_id', $city->id);
          } else {
            $existsQuery->where('region_id', $region->id)->whereNull('city_id');
          }
          if ($existsQuery->exists()) {
            $skipped++;
            continue;
          }

          $latitude = is_numeric($lat) ? (float) $lat : null;
          $longitude = is_numeric($lon) ? (float) $lon : null;

          Settlement::create([
            'region_id' => $region->id,
            'city_id' => $city?->id,
            'name' => $name,
            'slug' => $this->uniqueSlug(Settlement::class, Str::slug($name)),
            'type' => $type ?: null,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'population' => null,
            'area' => null,
            'is_active' => true,
          ]);

          $imported++;
          if ($imported % 100 === 0) {
            $this->info("Импортировано населенных пунктов: {$imported}...");
          }
        } catch (\Throwable $e) {
          $errors++;
          if ($errors <= 10) {
            $this->warn('Ошибка на строке ' . ($index + 2) . ': ' . $e->getMessage());
          }
        }
      }

      $this->info("\nИмпорт завершен");
      $this->info("Добавлено: {$imported}");
      $this->info("Пропущено: {$skipped}");
      $this->info("Ошибок: {$errors}");

      return 0;
    } catch (\Throwable $e) {
      $this->error('Ошибка: ' . $e->getMessage());
      return 1;
    }
  }

  protected function buildHeaderMap(array $header): array
  {
    $map = [];
    foreach ($header as $i => $col) {
      $key = mb_strtolower(trim((string) $col));
      $map[$key] = $i;
    }
    return $map;
  }

  protected function read(array $row, array $map, array $candidates): ?string
  {
    foreach ($candidates as $name) {
      if (isset($map[$name])) {
        $val = $row[$map[$name]] ?? null;
        return is_string($val) ? trim($val) : ($val === null ? null : (string) $val);
      }
    }
    return null;
  }

  protected function uniqueSlug(string $modelClass, string $base): string
  {
    $slug = $base ?: Str::random(8);
    $candidate = $slug;
    $counter = 1;
    while ($modelClass::where('slug', $candidate)->exists()) {
      $candidate = $slug . '-' . $counter++;
    }
    return $candidate;
  }

  protected function findRegion(string $regionName, array &$cache): ?Region
  {
    if (isset($cache[$regionName])) {
      return $cache[$regionName];
    }

    $region = Region::where('name', $regionName)->first();
    if (!$region) {
      $region = Region::where('name', 'LIKE', "%{$regionName}%")->first();
    }
    if (!$region) {
      $normalized = str_replace([' область', ' край', ' республика', ' Республика'], '', $regionName);
      $normalized = trim($normalized);
      if ($normalized !== '') {
        $region = Region::where('name', 'LIKE', "%{$normalized}%")->first();
      }
    }
    if (!$region) {
      $slug = Str::slug($regionName);
      $region = Region::where('slug', $slug)->first();
    }

    $cache[$regionName] = $region;
    return $region;
  }
}
