<?php

namespace App\Models;

use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class News extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'organization_id',
        'newsable_type',
        'newsable_id',
        'title',
        'subtitle',
        'slug',
        'excerpt',
        'content',
        'image',
        'gallery',
        'status',
        'type',
        'visibility',
        'is_featured',
        'tags',
        'starts_at',
        'ends_at',
        'timezone',
        'location_name',
        'location_address',
        'location_latitude',
        'location_longitude',
        'registration_url',
        'registration_required',
        'seo_settings',
        'metadata',
        'published_at',
        'views_count',
    ];

    protected $casts = [
        'gallery' => 'array',
        'tags' => 'array',
        'seo_settings' => 'array',
        'metadata' => 'array',
        'is_featured' => 'boolean',
        'registration_required' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'published_at' => 'datetime',
        'status' => NewsStatus::class,
        'visibility' => NewsVisibility::class,
    ];

    /**
     * Relationships
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function newsable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scopes
     */
    public function scopePublished($query)
    {
        return $query->where('status', NewsStatus::Published)
            ->where('visibility', NewsVisibility::Public)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->whereNotNull('starts_at')
            ->where('starts_at', '>=', now());
    }

    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Accessors
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::get(function (?string $value, array $attributes) {
            $image = $attributes['image'] ?? null;
            if (!$image) {
                return null;
            }

            if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://') || str_starts_with($image, '/storage/')) {
                return $image;
            }

            return '/storage/' . ltrim($image, '/');
        });
    }

    /**
     * Model hooks
     */
    protected static function booted(): void
    {
        static::creating(function (self $news) {
            if (empty($news->slug)) {
                $news->slug = Str::slug(Str::limit($news->title, 80, ''));
            }
        });

        static::saving(function (self $news) {
            if ($news->status === NewsStatus::Published && empty($news->published_at)) {
                $news->published_at = now();
            }
        });
    }
}

