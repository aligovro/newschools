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
      $table->string('name'); // Название шаблона
      $table->string('slug')->unique(); // URL slug
      $table->text('description')->nullable(); // Описание шаблона
      $table->string('preview_image')->nullable(); // Превью изображение
      $table->json('layout_config')->nullable(); // Конфигурация макета
      $table->json('theme_config')->nullable(); // Конфигурация темы
      $table->json('available_blocks')->nullable(); // Доступные блоки
      $table->json('default_positions')->nullable(); // Позиции по умолчанию
      $table->json('custom_settings')->nullable(); // Дополнительные настройки
      $table->boolean('is_active')->default(true); // Активен ли шаблон
      $table->boolean('is_premium')->default(false); // Премиум шаблон
      $table->integer('sort_order')->default(0); // Порядок сортировки
      $table->timestamps();

      // Индексы
      $table->index(['is_active', 'sort_order']);
      $table->index('is_premium');
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
