<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizationUser extends Model
{
    protected $table = 'organization_users';

    protected $fillable = [
        'organization_id',
        'user_id',
        'role',
        'status',
        'permissions',
        'joined_at',
        'last_active_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'joined_at' => 'datetime',
        'last_active_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projectSponsors(): HasMany
    {
        return $this->hasMany(ProjectSponsor::class);
    }
}

