<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalPaymentSettings extends Model
{
    protected $table = 'global_payment_settings';

    protected $fillable = [
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public static function instance(): self
    {
        return static::first() ?? static::create([
            'settings' => [],
        ]);
    }
}

