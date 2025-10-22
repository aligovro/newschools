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
    Schema::create('site_widget_referral_leaderboard_settings', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->integer('items_per_page')->default(10);
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->enum('sort_by', ['referrals_count', 'total_donations', 'name', 'created_at'])->default('referrals_count');
      $table->enum('sort_direction', ['asc', 'desc'])->default('desc');
      $table->boolean('show_rank')->default(true);
      $table->boolean('show_referrals_count')->default(true);
      $table->boolean('show_total_donations')->default(true);
      $table->boolean('show_avatar')->default(true);
      $table->json('display_options')->nullable();
      $table->timestamps();

      // Уникальный индекс для предотвращения дублирования настроек
      $table->unique('site_widget_id', 'unique_referral_leaderboard_settings');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_referral_leaderboard_settings');
  }
};
