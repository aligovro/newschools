<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiteWidgetTopRecurringDonorsSettings extends Model
{
    protected $fillable = [
        'site_widget_id',
        'project_id',
        'limit',
        'title',
    ];

    protected $casts = [
        'limit' => 'integer',
    ];

    public function siteWidget(): BelongsTo
    {
        return $this->belongsTo(SiteWidget::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
