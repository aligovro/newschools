<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class ProjectCategory extends Model
{
  use HasFactory;

  protected $table = 'project_categories';

  protected $fillable = [
    'name',
    'slug',
    'description',
    'sort_order',
    'is_active',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'sort_order' => 'integer',
  ];

  /**
   * Связь с проектами (many-to-many)
   */
  public function projects(): BelongsToMany
  {
    return $this->belongsToMany(Project::class, 'project_project_category')
      ->withTimestamps();
  }

  /**
   * Скоупы
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  public function scopeOrdered($query)
  {
    return $query->orderBy('sort_order')->orderBy('name');
  }

  /**
   * События модели
   */
  protected static function boot()
  {
    parent::boot();

    static::creating(function ($category) {
      if (empty($category->slug)) {
        $category->slug = Str::slug($category->name);
      }
    });
  }
}
