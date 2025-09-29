<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrganizationSetting extends Model
{
  use HasFactory;

  protected $table = 'organization_settings';

  protected $fillable = [
    'organization_id',
    'theme',
    'primary_color',
    'secondary_color',
    'accent_color',
    'font_family',
    'dark_mode',
    'custom_css',
    'layout_config',
    'feature_flags',
    'integration_settings',
    'payment_settings',
    'notification_settings',
    'maintenance_mode',
    'maintenance_message',
  ];

  protected $casts = [
    'dark_mode' => 'boolean',
    'custom_css' => 'array',
    'layout_config' => 'array',
    'feature_flags' => 'array',
    'integration_settings' => 'array',
    'payment_settings' => 'array',
    'notification_settings' => 'array',
    'maintenance_mode' => 'boolean',
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }
}
