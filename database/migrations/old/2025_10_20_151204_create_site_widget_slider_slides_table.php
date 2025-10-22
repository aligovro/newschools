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
    Schema::create('site_widget_slider_slides', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->integer('slide_order')->default(0);
      $table->string('title', 255)->nullable();
      $table->string('subtitle', 255)->nullable();
      $table->text('description')->nullable();
      $table->string('button_text', 255)->nullable();
      $table->string('button_link', 500)->nullable();
      $table->enum('button_link_type', ['internal', 'external'])->default('internal');
      $table->boolean('button_open_in_new_tab')->default(false);
      $table->string('background_image', 500)->nullable();
      $table->string('overlay_color', 7)->nullable();
      $table->integer('overlay_opacity')->default(50);
      $table->enum('overlay_gradient', ['none', 'left', 'right', 'top', 'bottom', 'center'])->default('none');
      $table->integer('overlay_gradient_intensity')->default(50);
      $table->timestamps();

      // Индексы для быстрого поиска и сортировки
      $table->index(['site_widget_id', 'slide_order'], 'idx_slider_slide_order');
      $table->index('site_widget_id', 'idx_slider_site_widget');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_slider_slides');
  }
};
