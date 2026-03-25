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
      'text'            => 'required|string|max:255',
      'separator'       => 'nullable|string|in:-,_,.',
      'table'           => ['nullable', 'string', 'max:64', 'regex:/^[a-z_][a-z0-9_]*$/'],
      'column'          => ['nullable', 'string', 'max:64', 'regex:/^[a-z_][a-z0-9_]*$/'],
      'exclude_id'      => 'nullable|integer',
      'scope'           => 'nullable|array|max:10',
      'without_trashed' => 'nullable|boolean',
    ]);

    $text           = $request->input('text');
    $separator      = $request->input('separator', '-');
    $table          = $request->input('table');
    $column         = $request->input('column', 'slug');
    $excludeId      = $request->input('exclude_id');
    $scope          = $request->input('scope', []);
    $withoutTrashed = $request->boolean('without_trashed', false);

    // Защита: ключи scope должны быть валидными SQL-идентификаторами
    foreach (array_keys((array) $scope) as $key) {
      if (!preg_match('/^[a-z_][a-z0-9_]*$/', (string) $key)) {
        return response()->json(['message' => 'Invalid scope key.'], 422);
      }
    }

    $slug = TransliterationHelper::createSlug($text, $separator);

    if ($table) {
      $uniqueSlug = TransliterationHelper::createUniqueSlug(
        $slug, $table, $column, $excludeId, $separator, (array) $scope, $withoutTrashed
      );
      $isUnique = $uniqueSlug === $slug;
    } else {
      $uniqueSlug = $slug;
      $isUnique = true;
    }

    return response()->json([
      'original'       => $text,
      'slug'           => $uniqueSlug,
      'has_cyrillic'   => TransliterationHelper::hasCyrillic($text),
      'is_unique'      => $isUnique,
      'suggested_slug' => $uniqueSlug,
    ]);
  }
}
