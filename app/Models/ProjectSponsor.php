<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use App\Models\User;

class ProjectSponsor extends Model
{
    protected $touches = ['project'];

    protected $fillable = [
        'project_id',
        'organization_user_id',
        'status',
        'source',
        'pledge_amount',
        'metadata',
        'joined_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'joined_at' => 'datetime',
        'pledge_amount' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function organizationUser(): BelongsTo
    {
        return $this->belongsTo(OrganizationUser::class);
    }

    public function user(): HasOneThrough
    {
        return $this->hasOneThrough(
            User::class,
            OrganizationUser::class,
            'id',
            'id',
            'organization_user_id',
            'user_id'
        );
    }

}

