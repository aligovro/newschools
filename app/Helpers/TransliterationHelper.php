<?php

namespace App\Helpers;

class TransliterationHelper
{
  /**
   * Таблица транслитерации кириллицы в латиницу
   */
  private static array $transliterationTable = [
    // Русские буквы
    'а' => 'a',
    'б' => 'b',
    'в' => 'v',
    'г' => 'g',
    'д' => 'd',
    'е' => 'e',
    'ё' => 'yo',
    'ж' => 'zh',
    'з' => 'z',
    'и' => 'i',
    'й' => 'y',
    'к' => 'k',
    'л' => 'l',
    'м' => 'm',
    'н' => 'n',
    'о' => 'o',
    'п' => 'p',
    'р' => 'r',
    'с' => 's',
    'т' => 't',
    'у' => 'u',
    'ф' => 'f',
    'х' => 'h',
    'ц' => 'ts',
    'ч' => 'ch',
    'ш' => 'sh',
    'щ' => 'sch',
    'ъ' => '',
    'ы' => 'y',
    'ь' => '',
    'э' => 'e',
    'ю' => 'yu',
    'я' => 'ya',

    // Заглавные русские буквы
    'А' => 'A',
    'Б' => 'B',
    'В' => 'V',
    'Г' => 'G',
    'Д' => 'D',
    'Е' => 'E',
    'Ё' => 'Yo',
    'Ж' => 'Zh',
    'З' => 'Z',
    'И' => 'I',
    'Й' => 'Y',
    'К' => 'K',
    'Л' => 'L',
    'М' => 'M',
    'Н' => 'N',
    'О' => 'O',
    'П' => 'P',
    'Р' => 'R',
    'С' => 'S',
    'Т' => 'T',
    'У' => 'U',
    'Ф' => 'F',
    'Х' => 'H',
    'Ц' => 'Ts',
    'Ч' => 'Ch',
    'Ш' => 'Sh',
    'Щ' => 'Sch',
    'Ъ' => '',
    'Ы' => 'Y',
    'Ь' => '',
    'Э' => 'E',
    'Ю' => 'Yu',
    'Я' => 'Ya',

    // Украинские буквы
    'і' => 'i',
    'ї' => 'yi',
    'є' => 'ye',
    'ґ' => 'g',
    'І' => 'I',
    'Ї' => 'Yi',
    'Є' => 'Ye',
    'Ґ' => 'G',

    // Белорусские буквы
    'ў' => 'u',
    'Ў' => 'U',

    // Дополнительные символы
    '№' => 'no',
    '№' => 'no',
  ];

  /**
   * Транслитерировать текст с кириллицы на латиницу
   */
  public static function transliterate(string $text): string
  {
    // Заменяем кириллические символы
    $text = strtr($text, self::$transliterationTable);

    // Убираем все символы кроме букв, цифр, дефисов и подчеркиваний
    $text = preg_replace('/[^a-zA-Z0-9\-_]/', '-', $text);

    // Убираем множественные дефисы
    $text = preg_replace('/-+/', '-', $text);

    // Убираем дефисы в начале и конце
    $text = trim($text, '-');

    // Приводим к нижнему регистру
    $text = strtolower($text);

    return $text;
  }

  /**
   * Создать slug из текста с транслитерацией
   */
  public static function createSlug(string $text, string $separator = '-'): string
  {
    // Транслитерируем
    $slug = self::transliterate($text);

    // Заменяем дефисы на указанный разделитель
    if ($separator !== '-') {
      $slug = str_replace('-', $separator, $slug);
    }

    // Ограничиваем длину slug'а
    if (strlen($slug) > 100) {
      $slug = substr($slug, 0, 100);
      $slug = rtrim($slug, $separator);
    }

    return $slug;
  }

  /**
   * Создать уникальный slug с проверкой в базе данных
   */
  public static function createUniqueSlug(
    string $text,
    string $table,
    string $column = 'slug',
    int $excludeId = null,
    string $separator = '-'
  ): string {
    $baseSlug = self::createSlug($text, $separator);
    $slug = $baseSlug;
    $counter = 1;

    $query = \DB::table($table)->where($column, $slug);

    if ($excludeId) {
      $query->where('id', '!=', $excludeId);
    }

    while ($query->exists()) {
      $slug = $baseSlug . $separator . $counter;
      $counter++;

      $query = \DB::table($table)->where($column, $slug);
      if ($excludeId) {
        $query->where('id', '!=', $excludeId);
      }
    }

    return $slug;
  }

  /**
   * Создать уникальный slug для модели Eloquent
   */
  public static function createUniqueSlugForModel(
    string $text,
    string $modelClass,
    string $column = 'slug',
    int $excludeId = null,
    string $separator = '-'
  ): string {
    $baseSlug = self::createSlug($text, $separator);
    $slug = $baseSlug;
    $counter = 1;

    $query = $modelClass::where($column, $slug);

    if ($excludeId) {
      $query->where('id', '!=', $excludeId);
    }

    while ($query->exists()) {
      $slug = $baseSlug . $separator . $counter;
      $counter++;

      $query = $modelClass::where($column, $slug);
      if ($excludeId) {
        $query->where('id', '!=', $excludeId);
      }
    }

    return $slug;
  }

  /**
   * Проверить, содержит ли текст кириллицу
   */
  public static function hasCyrillic(string $text): bool
  {
    return preg_match('/[а-яёіїєґў]/iu', $text);
  }
}
