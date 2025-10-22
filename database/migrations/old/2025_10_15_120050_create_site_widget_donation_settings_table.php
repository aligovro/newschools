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
    Schema::create('site_widget_donation_settings', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->string('title', 255)->nullable();
      $table->text('description')->nullable();
      $table->decimal('min_amount', 10, 2)->nullable();
      $table->decimal('max_amount', 10, 2)->nullable();
      $table->json('suggested_amounts')->nullable();
      $table->string('currency', 3)->default('RUB');
      $table->boolean('show_amount_input')->default(true);
      $table->boolean('show_anonymous_option')->default(true);
      $table->string('button_text', 255)->default('Пожертвовать');
      $table->string('success_message', 500)->nullable();
      $table->json('payment_methods')->nullable();
      $table->timestamps();

      // Уникальный индекс для предотвращения дублирования настроек
      $table->unique('site_widget_id', 'unique_donation_settings');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_donation_settings');
  }
};
