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
    Schema::create('sites', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->nullable()->constrained('organizations')->onDelete('cascade');
      $table->foreignId('domain_id')->nullable()->constrained('domains')->onDelete('set null');
      $table->string('name');
      $table->string('slug');
      $table->text('description')->nullable();
      $table->string('template')->default('default');
      $table->enum('site_type', ['organization', 'main'])->default('organization');
      $table->json('layout_config')->nullable();
      $table->json('theme_config')->nullable();
      $table->json('content_blocks')->nullable();
      $table->json('navigation_config')->nullable();
      $table->json('seo_config')->nullable();
      $table->json('custom_settings')->nullable();
      $table->string('logo')->nullable();
      $table->string('favicon')->nullable();
      $table->string('status')->default('draft');
      $table->boolean('is_public')->default(false);
      $table->boolean('is_maintenance_mode')->default(false);
      $table->text('maintenance_message')->nullable();
      $table->timestamp('published_at')->nullable();
      $table->timestamp('last_updated_at')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['domain_id', 'status']);
      $table->index(['site_type', 'status']);
      $table->index('status');
      $table->index('is_public');
      $table->index('is_maintenance_mode');
      $table->unique('slug');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('sites');
  }
};
