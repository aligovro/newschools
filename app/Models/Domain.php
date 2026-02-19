<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Domain extends Model
{
  use HasFactory;

  protected $table = 'domains';

  protected $fillable = [
    'organization_id',
    'domain',
    'custom_domain',
    'subdomain',
    'beget_domain_id',
    'is_primary',
    'is_ssl_enabled',
    'status',
    'verified_at',
    'expires_at',
    'ssl_config',
    'dns_records',
  ];

  protected $casts = [
    'is_primary' => 'boolean',
    'is_ssl_enabled' => 'boolean',
    'ssl_config' => 'array',
    'dns_records' => 'array',
    'verified_at' => 'datetime',
    'expires_at' => 'datetime',
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  public function sites(): HasMany
  {
    return $this->hasMany(Site::class);
  }

  public function scopePrimary($query)
  {
    return $query->where('is_primary', true);
  }

  public function scopeActive($query)
  {
    return $query->where('status', 'active');
  }
}
