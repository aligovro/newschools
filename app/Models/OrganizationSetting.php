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
    'advanced_layout_config',
    'seo_settings',
    'social_media_settings',
    'analytics_settings',
    'security_settings',
    'backup_settings',
    'external_integrations',
    'advanced_notification_settings',
    'theme_settings',
    'performance_settings',
    'settings_metadata',
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
    'advanced_layout_config' => 'array',
    'seo_settings' => 'array',
    'social_media_settings' => 'array',
    'analytics_settings' => 'array',
    'security_settings' => 'array',
    'backup_settings' => 'array',
    'external_integrations' => 'array',
    'advanced_notification_settings' => 'array',
    'theme_settings' => 'array',
    'performance_settings' => 'array',
    'settings_metadata' => 'array',
  ];

  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }
}
