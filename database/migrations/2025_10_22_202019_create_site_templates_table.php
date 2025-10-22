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
    Schema::create('site_templates', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('slug');
      $table->text('description')->nullable();
      $table->string('preview_image')->nullable();
      $table->json('layout_config')->nullable();
      $table->json('theme_config')->nullable();
      $table->json('available_blocks')->nullable();
      $table->json('default_positions')->nullable();
      $table->json('custom_settings')->nullable();
      $table->boolean('is_active')->default(true);
      $table->boolean('is_premium')->default(false);
      $table->integer('sort_order')->default(0);
      $table->timestamps();

      // Индексы
      $table->index(['is_active', 'is_premium']);
      $table->index('is_active');
      $table->index('is_premium');
      $table->index('sort_order');
      $table->unique('slug');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_templates');
  }
};
