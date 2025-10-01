<?php

namespace App\Traits;

use App\Helpers\TransliterationHelper;
use Illuminate\Database\Eloquent\Model;

trait HasSlug
{
  /**
   * Поле для хранения slug'а
   */
  protected string $slugField = 'slug';

  /**
   * Поле для генерации slug'а
   */
  protected string $slugSourceField = 'name';

  /**
   * Разделитель для slug'а
   */
  protected string $slugSeparator = '-';

  /**
   * Boot trait
   */
  protected static function bootHasSlug()
  {
    static::creating(function (Model $model) {
      $model->generateSlug();
    });

    static::updating(function (Model $model) {
      if ($model->isDirty($model->getSlugSourceField())) {
        $model->generateSlug();
      }
    });
  }

  /**
   * Генерировать slug
   */
  public function generateSlug(): void
  {
    $sourceValue = $this->getAttribute($this->getSlugSourceField());

    if (empty($sourceValue)) {
      return;
    }

    // Если slug уже задан вручную и не пустой, не перезаписываем
    $currentSlug = $this->getAttribute($this->getSlugField());
    if (!empty($currentSlug) && !$this->isDirty($this->getSlugField())) {
      return;
    }

    // Генерируем slug
    $slug = TransliterationHelper::createUniqueSlugForModel(
      $sourceValue,
      static::class,
      $this->getSlugField(),
      $this->getKey(),
      $this->getSlugSeparator()
    );

    $this->setAttribute($this->getSlugField(), $slug);
  }

  /**
   * Получить поле для slug'а
   */
  public function getSlugField(): string
  {
    return $this->slugField;
  }

  /**
   * Получить поле-источник для slug'а
   */
  public function getSlugSourceField(): string
  {
    return $this->slugSourceField;
  }

  /**
   * Получить разделитель для slug'а
   */
  public function getSlugSeparator(): string
  {
    return $this->slugSeparator;
  }

  /**
   * Установить slug вручную
   */
  public function setSlug(string $slug): void
  {
    $slug = TransliterationHelper::createSlug($slug, $this->getSlugSeparator());
    $this->setAttribute($this->getSlugField(), $slug);
  }

  /**
   * Получить URL slug'а
   */
  public function getSlugUrlAttribute(): string
  {
    return $this->getAttribute($this->getSlugField());
  }

  /**
   * Scope для поиска по slug
   */
  public function scopeBySlug($query, string $slug)
  {
    return $query->where($this->getSlugField(), $slug);
  }

  /**
   * Scope для поиска по части slug'а
   */
  public function scopeWhereSlugLike($query, string $slug)
  {
    return $query->where($this->getSlugField(), 'like', "%{$slug}%");
  }
}
