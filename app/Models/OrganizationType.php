<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationType extends Model
{
  use HasFactory;

  protected $fillable = [
    'key',
    'name',
    'plural',
    'member_type',
    'member_name',
    'member_plural',
    'domain_prefix',
    'features',
    'categories',
    'is_active',
  ];

  protected $casts = [
    'features' => 'array',
    'categories' => 'array',
    'is_active' => 'boolean',
  ];

  /**
   * Связь с организациями
   */
  public function organizations()
  {
    return $this->hasMany(Organization::class, 'type', 'key');
  }

  /**
   * Скоуп для активных типов
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }
}
