<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'members';

    protected $fillable = [
        'organization_id',
        'first_name',
        'last_name',
        'middle_name',
        'photo',
        'graduation_year',
        'class_letter',
        'class_number',
        'profession',
        'company',
        'position',
        'email',
        'phone',
        'social_links',
        'biography',
        'achievements',
        'member_type',
        'is_featured',
        'is_public',
        'contact_permissions',
        'last_contact_at',
    ];

    protected $casts = [
        'social_links' => 'array',
        'contact_permissions' => 'array',
        'is_featured' => 'boolean',
        'is_public' => 'boolean',
        'last_contact_at' => 'datetime',
    ];

    // Связи
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    // Скоупы
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('member_type', $type);
    }

    public function scopeByGraduationYear($query, $year)
    {
        return $query->where('graduation_year', $year);
    }

    // Методы
    public function getFullNameAttribute(): string
    {
        $name = $this->last_name;
        if ($this->first_name) {
            $name .= ' ' . $this->first_name;
        }
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }
        return $name;
    }

    public function getDisplayNameAttribute(): string
    {
        $typeConfig = $this->organization->type_config;
        $memberTypeName = $typeConfig['member_name'] ?? 'Участник';

        return $this->full_name . ' (' . $memberTypeName . ')';
    }

    public function getClassDisplayAttribute(): string
    {
        if (!$this->graduation_year) {
            return '';
        }

        $class = $this->graduation_year;
        if ($this->class_number) {
            $class .= '-' . $this->class_number;
        }
        if ($this->class_letter) {
            $class .= $this->class_letter;
        }

        return $class;
    }
}
