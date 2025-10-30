<?php

namespace App\Console\Commands;

use App\Models\City;
use App\Models\Region;
use App\Models\Settlement;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ImportSettlementsFromGeoNames extends Command
{
    protected $signature = 'settlements:import-geonames {--ru-url=http://download.geonames.org/export/dump/RU.zip} {--admin1-url=http://download.geonames.org/export/dump/admin1CodesASCII.txt} {--ru-path=}';

    protected $description = 'Import Russian settlements from GeoNames (RU.zip + admin1CodesASCII.txt).';

    public function handle()
    {
        $ruUrl = (string) $this->option('ru-url');
        $admin1Url = (string) $this->option('admin1-url');

        $ruTxtPath = (string) $this->option('ru-path');
        $tmpDir = storage_path('app/geonames_ru');
        if (!is_dir($tmpDir)) {
            @mkdir($tmpDir, 0777, true);
        }

        if ($ruTxtPath === '') {
            $this->info('Загрузка GeoNames RU.zip...');
            $ruZip = @file_get_contents($ruUrl);
            if ($ruZip === false) {
                $this->error('Не удалось загрузить RU.zip');
                return 1;
            }
            $zipPath = $tmpDir . '/RU.zip';
            file_put_contents($zipPath, $ruZip);
            if (!class_exists('ZipArchive')) {
                $this->error('PHP расширение ZipArchive не доступно. Включите ext-zip в php.ini ИЛИ заранее распакуйте RU.zip и укажите путь к RU.txt через --ru-path=...');
                return 1;
            }
            $zip = new \ZipArchive();
            if ($zip->open($zipPath) !== true) {
                $this->error('Не удалось распаковать RU.zip');
                return 1;
            }
            $zip->extractTo($tmpDir);
            $zip->close();
            $ruTxtPath = $tmpDir . '/RU.txt';
            if (!file_exists($ruTxtPath)) {
                $this->error('Файл RU.txt не найден после распаковки');
                return 1;
            }
        } else {
            if (!file_exists($ruTxtPath)) {
                $this->error('Указанный --ru-path не найден: ' . $ruTxtPath);
                return 1;
            }
        }

        $this->info('Загрузка admin1CodesASCII.txt...');
        $admin1Txt = @file_get_contents($admin1Url);
        if ($admin1Txt === false) {
            $this->error('Не удалось загрузить admin1CodesASCII.txt');
            return 1;
        }

        // Построение карты admin1 -> название региона (ASCII)
        $admin1Map = $this->buildAdmin1Map($admin1Txt); // key: RU.xx, value: ascii name

        // Обработка RU.txt
        $this->info('Парсинг RU.txt...');
        // Сброс автоинкремента, если таблица пустая
        if (Settlement::query()->count() === 0) {
            try {
                DB::statement('ALTER TABLE settlements AUTO_INCREMENT = 1');
                $this->info('AUTO_INCREMENT для settlements сброшен на 1');
            } catch (\Throwable $e) {
                $this->warn('Не удалось сбросить AUTO_INCREMENT: ' . $e->getMessage());
            }
        }
        $fh = fopen($ruTxtPath, 'r');
        if (!$fh) {
            $this->error('Не удалось открыть RU.txt');
            return 1;
        }

        $imported = 0;
        $skipped = 0;
        $errors = 0;
        $citiesUpdated = 0;
        $regionsNotFound = 0;
        $duplicates = 0;
        $debugSkipped = [];

        $regionsCache = [];
        $citiesCache = [];

        while (($line = fgets($fh)) !== false) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }
            // RU.txt — таб-разделенный
            $cols = explode("\t", $line);
            // Безопасная проверка количества полей (ожидается 19)
            if (count($cols) < 10) {
                $skipped++;
                continue;
            }

            [$geonameId, $name, $asciiName, $altNames, $lat, $lon, $fClass, $fCode, $country, $cc2, $admin1, $admin2] = array_pad($cols, 12, null);
            $displayName = $this->preferCyrillicName((string) $name, (string) $altNames);

            if ($fClass !== 'P') { // только населенные пункты
                continue;
            }

            // Определяем регион: сначала по коду, потом по названию из admin1Map
            $region = null;
            if ($admin1) {
                // Пробуем найти по коду (точно, без вариаций)
                $region = $this->findRegionByCode((string) $admin1, $regionsCache);
                // Если не нашлось по коду, пробуем через admin1Map по названию
                if (!$region) {
                    $adminKey = 'RU.' . (string) $admin1;
                    $regionAscii = $admin1Map[$adminKey] ?? null;
                    if ($regionAscii) {
                        $region = $this->findRegionByName($regionAscii, $regionsCache);
                    }
                }
            }
            if (!$region) {
                $regionsNotFound++;
                $skipped++;
                // Логируем первые 10 пропущенных для диагностики
                if (count($debugSkipped) < 10) {
                    $adminKey = 'RU.' . (string) $admin1;
                    $adminName = $admin1Map[$adminKey] ?? 'неизвестно';
                    $debugSkipped[] = "admin1={$admin1}, name={$adminName}, settlement={$displayName}";
                }
                continue;
            }

            // Пытаемся найти город по имени в регионе (если сам пункт — город, он же станет city)
            $city = $this->findOrCacheCity($region->id, $displayName, $citiesCache)
                ?: ($name !== $displayName ? $this->findOrCacheCity($region->id, $name, $citiesCache) : null);

            // Обновляем город данными из GeoNames, если найдено совпадение и у города нет координат/кода
            if ($city && ($city->code === null || $city->latitude === null || $city->longitude === null)) {
                $needsUpdate = false;
                $updateData = [];
                if ($city->code === null && $geonameId) {
                    $updateData['code'] = (string) $geonameId;
                    $needsUpdate = true;
                }
                if ($city->latitude === null && is_numeric($lat)) {
                    $updateData['latitude'] = (float) $lat;
                    $needsUpdate = true;
                }
                if ($city->longitude === null && is_numeric($lon)) {
                    $updateData['longitude'] = (float) $lon;
                    $needsUpdate = true;
                }
                if ($needsUpdate) {
                    $city->update($updateData);
                    $citiesUpdated++;
                }
            }

            // Проверка на дубликат
            $exists = Settlement::query()
                ->where('name', $displayName)
                ->where('region_id', $region->id)
                ->when($city, fn($q) => $q->where('city_id', $city->id))
                ->exists();
            if ($exists) {
                $duplicates++;
                $skipped++;
                continue;
            }

            $latitude = is_numeric($lat) ? (float) $lat : null;
            $longitude = is_numeric($lon) ? (float) $lon : null;
            $type = $this->mapFeatureCodeToType((string) $fCode);

            try {
                Settlement::create([
                    'region_id' => $region->id,
                    'city_id' => $city?->id,
                    'name' => $displayName,
                    // slug берем из GeoNames asciiName (как есть, но в URL-формате), фолбек — displayName
                    'slug' => $this->uniqueSlug(Settlement::class, Str::slug($asciiName ?: $displayName)),
                    'type' => $type,
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                    'population' => null,
                    'area' => null,
                    'is_active' => true,
                ]);
                $imported++;
                if ($imported % 1000 === 0) {
                    $this->info("Импортировано: {$imported}...");
                }
            } catch (\Throwable $e) {
                $errors++;
                if ($errors <= 10) {
                    $this->warn('Ошибка: ' . $e->getMessage());
                }
            }
        }

        fclose($fh);

        $this->info("\nИмпорт завершен");
        $this->info("Добавлено settlements: {$imported}");
        $this->info("Обновлено городов (code/lat/lon): {$citiesUpdated}");
        $this->info("Пропущено: {$skipped}");
        $this->info("  - Регион не найден: {$regionsNotFound}");
        $this->info("  - Дубликаты: {$duplicates}");
        $this->info("  - Прочие: " . ($skipped - $regionsNotFound - $duplicates));
        $this->info("Ошибок: {$errors}");
        if (!empty($debugSkipped)) {
            $this->warn("\nПримеры пропущенных (регион не найден):");
            foreach ($debugSkipped as $item) {
                $this->warn("  - {$item}");
            }
        }

        return 0;
    }

    protected function buildAdmin1Map(string $admin1Txt): array
    {
        $map = [];
        $lines = explode("\n", $admin1Txt);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;
            // format: country.admin1\tname\tasciiName\tgeonameid
            $parts = explode("\t", $line);
            if (count($parts) < 3) continue;
            $code = trim($parts[0]); // e.g., RU.48
            $asciiName = trim($parts[2]);
            $map[$code] = $asciiName;
        }
        return $map;
    }

    protected function findRegionByCode(string $admin1Code, array &$cache): ?Region
    {
        // Ищем регион по полю code (admin1 код из GeoNames) - только точное совпадение
        // Кэшируем по ключу с префиксом "code:" чтобы не путать с поиском по имени
        $cacheKey = 'code:' . $admin1Code;
        if (isset($cache[$cacheKey])) {
            return $cache[$cacheKey];
        }

        // Только точное совпадение по коду
        $region = Region::where('code', $admin1Code)->first();
        // Если не нашлось, пробуем вариации с ведущими нулями
        if (!$region) {
            $codeNormalized = ltrim($admin1Code, '0') ?: $admin1Code;
            if ($codeNormalized !== $admin1Code) {
                $region = Region::where('code', $codeNormalized)->first();
            }
            if (!$region && strlen($admin1Code) <= 2) {
                // Пробуем с ведущим нулём (если код короткий)
                $padded = str_pad($admin1Code, 2, '0', STR_PAD_LEFT);
                if ($padded !== $admin1Code) {
                    $region = Region::where('code', $padded)->first();
                }
            }
        }

        $cache[$cacheKey] = $region;
        return $region;
    }

    protected function findRegionByName(string $asciiName, array &$cache): ?Region
    {
        // Кэшируем по названию
        $cacheKey = 'name:' . $asciiName;
        if (isset($cache[$cacheKey])) {
            return $cache[$cacheKey];
        }

        $slug = Str::slug($asciiName);
        $region = Region::where('slug', $slug)->first();
        if (!$region) {
            // Убираем типичные окончания и пробуем снова
            $nameBase = str_replace([' Oblast', ' Krai', ' Republic', ' Autonomous Okrug'], '', $asciiName);
            $slugBase = Str::slug($nameBase);
            $region = Region::where('slug', 'like', $slugBase . '%')->first();
        }

        $cache[$cacheKey] = $region;
        return $region;
    }

    protected function findOrCacheCity(int $regionId, string $cityName, array &$cache): ?City
    {
        $key = $regionId . '::' . mb_strtolower($cityName);
        if (isset($cache[$key])) return $cache[$key];

        $city = City::where('region_id', $regionId)->where('name', $cityName)->first();
        $cache[$key] = $city;
        return $city;
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

    protected function mapFeatureCodeToType(string $fCode): string
    {
        $code = strtoupper($fCode);
        // Допустимые значения enum: village, hamlet, settlement, rural_settlement, urban_settlement
        // Мэппинг упрощенный и безопасный относительно нашей схемы
        $urban = ['PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPL', 'PPLX', 'PPLS'];
        $rural = ['PPLF', 'PPLL', 'PPLQ'];
        $hamlet = ['PPLH'];

        if (in_array($code, $urban, true)) return 'urban_settlement';
        if (in_array($code, $rural, true)) return 'rural_settlement';
        if (in_array($code, $hamlet, true)) return 'hamlet';
        // По умолчанию
        return 'settlement';
    }

    protected function preferCyrillicName(string $name, string $altNames): string
    {
        // Если name уже на кириллице — оставляем
        if ($this->hasCyrillic($name)) return $name;

        // Ищем первое кириллическое имя среди альтернатив
        if ($altNames !== '') {
            $alts = explode(',', $altNames);
            foreach ($alts as $alt) {
                $alt = trim($alt);
                if ($alt !== '' && $this->hasCyrillic($alt)) {
                    return $alt;
                }
            }
        }

        // Фоллбек — исходное имя (латиница)
        return $name;
    }

    protected function hasCyrillic(string $value): bool
    {
        return (bool) preg_match('/[А-Яа-яЁё]/u', $value);
    }
}
