<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Helpers\TransliterationHelper;
use Illuminate\Http\Request;

class SlugController extends Controller
{
  /**
   * Генерировать slug из текста с проверкой уникальности
   */
  public function generate(Request $request)
  {
    $request->validate([
      'text' => 'required|string|max:255',
      'separator' => 'nullable|string|in:-,_,.',
      'table' => 'nullable|string',
      'column' => 'nullable|string',
      'exclude_id' => 'nullable|integer',
    ]);

    $text = $request->input('text');
    $separator = $request->input('separator', '-');
    $table = $request->input('table');
    $column = $request->input('column', 'slug');
    $excludeId = $request->input('exclude_id');

    $slug = TransliterationHelper::createSlug($text, $separator);

    // Если указана таблица, проверяем уникальность и генерируем уникальный slug
    if ($table) {
      $uniqueSlug = TransliterationHelper::createUniqueSlug($slug, $table, $column, $excludeId);
      $isUnique = $uniqueSlug === $slug;
    } else {
      $uniqueSlug = $slug;
      $isUnique = true;
    }

    return response()->json([
      'original' => $text,
      'slug' => $uniqueSlug,
      'has_cyrillic' => TransliterationHelper::hasCyrillic($text),
      'is_unique' => $isUnique,
      'suggested_slug' => $isUnique ? $uniqueSlug : $uniqueSlug,
    ]);
  }
}
