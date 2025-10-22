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
    Schema::create('site_widgets', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_id')->constrained('organization_sites')->onDelete('cascade');
      $table->foreignId('widget_id')->constrained('widgets')->onDelete('cascade');
      $table->foreignId('position_id')->nullable()->constrained('widget_positions')->onDelete('set null');
      $table->string('name'); // Название экземпляра виджета
      $table->string('position_name'); // Название позиции
      $table->json('config')->nullable(); // Конфигурация виджета
      $table->json('settings')->nullable(); // Настройки виджета
      $table->integer('order')->default(0); // Порядок в позиции
      $table->boolean('is_active')->default(true); // Активен ли виджет
      $table->boolean('is_visible')->default(true); // Видим ли виджет
      $table->timestamps();

      // Индексы
      $table->index(['site_id', 'position_name', 'order']);
      $table->index(['site_id', 'is_active']);
      $table->index(['widget_id', 'is_active']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_widgets');
  }
};
