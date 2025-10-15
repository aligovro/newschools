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
    Schema::create('site_widget_gallery_images', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->string('image_url', 500);
      $table->string('alt_text', 255)->nullable();
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->integer('sort_order')->default(0);
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы для быстрого поиска и сортировки
      $table->index(['site_widget_id', 'sort_order'], 'idx_widget_image_order');
      $table->index(['site_widget_id', 'is_active'], 'idx_widget_image_active');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_gallery_images');
  }
};
