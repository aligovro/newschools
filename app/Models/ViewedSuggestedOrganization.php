<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViewedSuggestedOrganization extends Model
{
    protected $fillable = [
        'user_id',
        'suggested_organization_id',
        'viewed_at',
    ];

    protected $casts = [
        'viewed_at' => 'datetime',
    ];

    /**
     * Связь с пользователем
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Связь с предложенной организацией
     */
    public function suggestedOrganization(): BelongsTo
    {
        return $this->belongsTo(SuggestedOrganization::class);
    }
}
