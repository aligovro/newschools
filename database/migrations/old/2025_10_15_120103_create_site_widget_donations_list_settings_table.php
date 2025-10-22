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
    Schema::create('site_widget_donations_list_settings', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->integer('items_per_page')->default(10);
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->enum('sort_by', ['amount', 'created_at', 'name'])->default('created_at');
      $table->enum('sort_direction', ['asc', 'desc'])->default('desc');
      $table->boolean('show_amount')->default(true);
      $table->boolean('show_donor_name')->default(true);
      $table->boolean('show_date')->default(true);
      $table->boolean('show_message')->default(false);
      $table->boolean('show_anonymous')->default(true);
      $table->json('display_options')->nullable();
      $table->timestamps();

      // Уникальный индекс для предотвращения дублирования настроек
      $table->unique('site_widget_id', 'unique_donations_list_settings');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_donations_list_settings');
  }
};
