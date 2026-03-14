<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationClub extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'organization_clubs';

    protected $fillable = [
        'organization_id',
        'name',
        'description',
        'image',
        'sort_order',
        'schedule',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'schedule' => 'array',
    ];

    /** Дни недели для расписания (mon=Пн .. sun=Вс) */
    public const SCHEDULE_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (empty($this->image)) {
            return null;
        }
        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }
        if (str_starts_with($this->image, '/storage/')) {
            return $this->image;
        }
        $path = ltrim($this->image, '/');
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, 8);
        }
        return '/storage/' . ltrim($path, '/');
    }
}
