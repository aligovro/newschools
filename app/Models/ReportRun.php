<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class ReportRun extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'report_id',
        'organization_id',
        'project_id',
        'project_stage_id',
        'generated_by',
        'report_type',
        'status',
        'format',
        'filters',
        'meta',
        'summary',
        'data',
        'rows_count',
        'generated_at',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'filters' => 'array',
        'meta' => 'array',
        'summary' => 'array',
        'data' => 'array',
        'generated_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (ReportRun $run) {
            if (empty($run->uuid)) {
                $run->uuid = (string) Str::orderedUuid();
            }

            if (empty($run->status)) {
                $run->status = 'ready';
            }

            if (empty($run->format)) {
                $run->format = 'json';
            }

            if (empty($run->generated_at)) {
                $run->generated_at = now();
            }
        });
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function projectStage(): BelongsTo
    {
        return $this->belongsTo(ProjectStage::class);
    }

    public function generator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}


