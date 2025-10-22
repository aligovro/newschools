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
    Schema::create('site_widget_configs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_widget_id')->constrained('site_widgets')->onDelete('cascade');
      $table->string('config_key', 255)->index();
      $table->text('config_value')->nullable();
      $table->enum('config_type', ['string', 'number', 'boolean', 'json', 'text'])->default('string');
      $table->timestamps();

      // Уникальный индекс для предотвращения дублирования конфигураций
      $table->unique(['site_widget_id', 'config_key'], 'unique_widget_config');

      // Индексы для быстрого поиска
      $table->index('config_key', 'idx_config_key');
      $table->index(['site_widget_id', 'config_type'], 'idx_widget_type');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widget_configs');
  }
};
