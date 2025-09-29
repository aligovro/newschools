<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'mediaable_type',
        'mediaable_id',
        'filename',
        'original_name',
        'mime_type',
        'file_path',
        'file_url',
        'file_size',
        'file_hash',
        'type',
        'metadata',
        'alt_text',
        'caption',
        'description',
        'sort_order',
        'is_public',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_public' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function mediaable(): MorphTo
    {
        return $this->morphTo();
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function getFileSizeFormattedAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
