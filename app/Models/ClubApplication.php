<?php

namespace App\Models;

use App\Enums\ClubApplicationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClubApplication extends Model
{
    protected $table = 'club_applications';

    protected $fillable = [
        'organization_id',
        'club_id',
        'club_name',
        'applicant_name',
        'phone',
        'comment',
        'status',
        'reviewed_at',
        'reviewed_by',
        'ip_address',
    ];

    protected $casts = [
        'status'      => ClubApplicationStatus::class,
        'reviewed_at' => 'datetime',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(OrganizationClub::class, 'club_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', ClubApplicationStatus::Pending->value);
    }
}
