<?php

namespace App\Models\Payments;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class YooKassaPartnerEvent extends Model
{
    use HasFactory;

    protected $table = 'yookassa_partner_events';

    protected $fillable = [
        'event_type',
        'object_id',
        'object_type',
        'payload',
        'processed_at',
        'processing_status',
        'processing_error',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_PROCESSED = 'processed';
    public const STATUS_FAILED = 'failed';
}

