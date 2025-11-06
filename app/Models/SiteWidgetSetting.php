<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteWidgetSetting extends Model
{
    use HasFactory;

    protected $table = 'site_widget_settings';

    protected $fillable = [
        'site_id',
        'widget_id',
        'visibility_rules',
    ];

    protected $casts = [
        'visibility_rules' => 'array',
    ];

    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class, 'site_id');
    }

    public function widget(): BelongsTo
    {
        return $this->belongsTo(SiteWidget::class, 'widget_id');
    }
}
