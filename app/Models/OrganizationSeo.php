<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationSeo extends Model
{
  use HasFactory;

  protected $table = 'organization_seo';

  protected $fillable = [
    'organization_id',
    'meta_title',
    'meta_description',
    'meta_keywords',
    'og_title',
    'og_description',
    'og_image',
    'twitter_card',
    'twitter_title',
    'twitter_description',
    'twitter_image',
    'canonical_url',
    'schema_markup',
    'robots_meta',
    'custom_meta_tags',
    'sitemap_config',
    'sitemap_enabled',
    'last_seo_audit',
  ];

  protected $casts = [
    'meta_keywords' => 'array',
    'schema_markup' => 'array',
    'robots_meta' => 'array',
    'custom_meta_tags' => 'array',
    'sitemap_config' => 'array',
    'sitemap_enabled' => 'boolean',
    'last_seo_audit' => 'datetime',
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }
}
