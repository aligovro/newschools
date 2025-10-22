<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    Schema::create('organization_settings', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('theme')->default('default');
      $table->string('primary_color')->default('#007bff');
      $table->string('secondary_color')->default('#6c757d');
      $table->string('accent_color')->default('#28a745');
      $table->string('font_family')->default('Inter');
      $table->boolean('dark_mode')->default(false);
      $table->json('custom_css')->nullable();
      $table->json('layout_config')->nullable();
      $table->json('advanced_layout_config')->nullable();
      $table->json('seo_settings')->nullable();
      $table->json('social_media_settings')->nullable();
      $table->json('analytics_settings')->nullable();
      $table->json('security_settings')->nullable();
      $table->json('backup_settings')->nullable();
      $table->json('external_integrations')->nullable();
      $table->json('advanced_notification_settings')->nullable();
      $table->json('theme_settings')->nullable();
      $table->json('performance_settings')->nullable();
      $table->json('settings_metadata')->nullable();
      $table->json('feature_flags')->nullable();
      $table->json('integration_settings')->nullable();
      $table->json('payment_settings')->nullable();
      $table->json('notification_settings')->nullable();
      $table->boolean('maintenance_mode')->default(false);
      $table->text('maintenance_message')->nullable();
      $table->timestamps();

      // Индексы
      $table->index('organization_id');
      $table->index('theme');
      $table->index('dark_mode');
      $table->index('maintenance_mode');
      $table->unique('organization_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_settings');
  }
};
