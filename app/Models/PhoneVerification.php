<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PhoneVerification extends Model
{
    protected $fillable = [
        'token',
        'phone',
        'code_hash',
        'expires_at',
        'attempts',
        'resend_count',
        'last_sent_at',
        'user_id',
        'organization_id',
        'project_id',
        'meta',
        'verified_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'verified_at' => 'datetime',
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $verification) {
            if (! $verification->token) {
                $verification->token = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function markVerified(): void
    {
        $this->verified_at = now();
        $this->save();
    }
}


