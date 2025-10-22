<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationPageSeo extends Model
{
    use HasFactory;

    protected $table = 'organization_page_seo';

    protected $fillable = [
        'page_id',
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
    ];

    protected $casts = [
        'meta_keywords' => 'array',
        'schema_markup' => 'array',
        'robots_meta' => 'array',
        'custom_meta_tags' => 'array',
    ];

    public function page(): BelongsTo
    {
        return $this->belongsTo(OrganizationPage::class, 'page_id');
    }
}
