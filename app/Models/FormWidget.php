<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FormWidget extends Model
{
  use HasFactory;

  protected $fillable = [
    'site_id',
    'name',
    'slug',
    'description',
    'settings',
    'styling',
    'actions',
    'is_active',
    'sort_order',
  ];

  protected $casts = [
    'settings' => 'array',
    'styling' => 'array',
    'actions' => 'array',
    'is_active' => 'boolean',
  ];

  public function site(): BelongsTo
  {
    return $this->belongsTo(OrganizationSite::class, 'site_id');
  }

  public function fields(): HasMany
  {
    return $this->hasMany(FormField::class)->orderBy('sort_order');
  }

  public function submissions(): HasMany
  {
    return $this->hasMany(FormSubmission::class);
  }

  public function formActions(): HasMany
  {
    return $this->hasMany(FormAction::class)->orderBy('sort_order');
  }

  public function getActiveFields()
  {
    return $this->fields()->where('is_active', true)->orderBy('sort_order');
  }

  public function getActiveActions()
  {
    return $this->formActions()->where('is_active', true)->orderBy('sort_order');
  }
}
