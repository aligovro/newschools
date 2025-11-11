<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Report extends Model
{
    use HasFactory;
    use SoftDeletes;

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'organization_id',
        'project_id',
        'project_stage_id',
        'created_by',
        'updated_by',
        'title',
        'slug',
        'report_type',
        'status',
        'visibility',
        'description',
        'filters',
        'meta',
        'summary',
        'generated_at',
        'site_id',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'filters' => 'array',
        'meta' => 'array',
        'summary' => 'array',
        'generated_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Report $report) {
            if (empty($report->uuid)) {
                $report->uuid = (string) Str::orderedUuid();
            }

            if (empty($report->visibility)) {
                $report->visibility = 'private';
            }

            if (empty($report->status)) {
                $report->status = 'draft';
            }
        });
    }

    /**
     * Report belongs to an organization.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Report belongs to a project.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Report belongs to a project stage.
     */
    public function projectStage(): BelongsTo
    {
        return $this->belongsTo(ProjectStage::class);
    }

    /**
     * Report belongs to a site.
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * The user who created the report.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * The user who last updated the report.
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Report runs.
     */
    public function runs(): HasMany
    {
        return $this->hasMany(ReportRun::class);
    }

    /**
     * Latest run relationship.
     */
    public function latestRun(): HasOne
    {
        return $this->hasOne(ReportRun::class)->latestOfMany();
    }

    /**
     * Scope reports for organization.
     */
    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where(function ($builder) use ($organizationId) {
            $builder->where('organization_id', $organizationId)
                ->orWhereNull('organization_id');
        });
    }

    /**
     * Determine if report is global (not linked to any context).
     */
    public function isGlobal(): bool
    {
        return is_null($this->organization_id) && is_null($this->project_id) && is_null($this->project_stage_id);
    }
}


