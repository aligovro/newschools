<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationVideoLesson extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organization_video_lessons';

    protected $fillable = [
        'organization_id',
        'title',
        'description',
        'video_url',
        'thumbnail',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function getThumbnailUrlAttribute(): ?string
    {
        if (empty($this->thumbnail)) {
            return null;
        }
        if (str_starts_with($this->thumbnail, 'http://') || str_starts_with($this->thumbnail, 'https://')) {
            return $this->thumbnail;
        }
        if (str_starts_with($this->thumbnail, '/storage/')) {
            return $this->thumbnail;
        }
        $path = ltrim($this->thumbnail, '/');
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }
        return '/storage/' . ltrim($path, '/');
    }

    /**
     * Извлечь embed-URL для YouTube/Vimeo (если поддерживается)
     */
    public function getEmbedUrlAttribute(): ?string
    {
        $url = $this->video_url;
        if (empty($url)) {
            return null;
        }
        if (preg_match('#(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]+)#', $url, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }
        if (preg_match('#vimeo\.com/(\d+)#', $url, $m)) {
            return 'https://player.vimeo.com/video/' . $m[1];
        }
        return null;
    }
}
