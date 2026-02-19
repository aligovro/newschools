<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationUserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'organization_id',
        'last_name',
        'user_type',
        'edu_year',
        'region_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public static function userTypeLabels(): array
    {
        return [
            'graduate' => 'Выпускник',
            'friend' => 'Друг лицея',
            'parent' => 'Родитель',
        ];
    }
}
