<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SitePositionSetting extends Model
{
    use HasFactory;

    protected $table = 'site_position_settings';

    protected $fillable = [
        'site_id',
        'position_id',
        'position_slug',
        'visibility_rules',
        'layout_overrides',
    ];

    protected $casts = [
        'visibility_rules' => 'array',
        'layout_overrides' => 'array',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(WidgetPosition::class, 'position_id');
    }
}
