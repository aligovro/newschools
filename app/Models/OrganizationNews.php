<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OrganizationNews extends Model
{
  use HasFactory, SoftDeletes;

  protected $fillable = [
    'organization_id',
    'title',
    'slug',
    'excerpt',
    'content',
    'featured_image',
    'gallery',
    'status',
    'category',
    'tags',
    'featured',
    'allow_comments',
    'seo_settings',
    'published_at',
    'views_count',
    'likes_count',
    'shares_count',
  ];

  protected $casts = [
    'gallery' => 'array',
    'tags' => 'array',
    'seo_settings' => 'array',
    'featured' => 'boolean',
    'allow_comments' => 'boolean',
    'published_at' => 'datetime',
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function scopePublished($query)
  {
    return $query->where('status', 'published');
  }

  public function scopeFeatured($query)
  {
    return $query->where('featured', true);
  }

  public function scopeByCategory($query, $category)
  {
    return $query->where('category', $category);
  }

  protected static function boot()
  {
    parent::boot();

    static::creating(function ($news) {
      if (empty($news->slug)) {
        $news->slug = Str::slug($news->title);
      }
    });
  }
}
