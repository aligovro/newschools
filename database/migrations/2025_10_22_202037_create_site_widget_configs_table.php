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
      $table->string('config_key');
      $table->text('config_value')->nullable();
      $table->enum('config_type', ['string', 'number', 'boolean', 'json', 'text'])->default('string');
      $table->timestamps();

      // Индексы
      $table->index(['site_widget_id', 'config_key']);
      $table->index('config_key');
      $table->index('config_type');
      $table->unique(['site_widget_id', 'config_key']);
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
