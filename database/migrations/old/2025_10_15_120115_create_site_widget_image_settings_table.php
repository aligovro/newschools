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
    Schema::create('site_widget_image_settings', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->string('image_url', 500);
      $table->string('alt_text', 255)->nullable();
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->string('link_url', 500)->nullable();
      $table->enum('link_type', ['internal', 'external'])->default('internal');
      $table->boolean('open_in_new_tab')->default(false);
      $table->enum('alignment', ['left', 'center', 'right'])->default('center');
      $table->string('width', 50)->nullable();
      $table->string('height', 50)->nullable();
      $table->json('styling')->nullable();
      $table->timestamps();

      // Уникальный индекс для предотвращения дублирования настроек
      $table->unique('site_widget_id', 'unique_image_settings');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_image_settings');
  }
};
