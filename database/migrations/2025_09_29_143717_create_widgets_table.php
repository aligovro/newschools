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
    Schema::create('widgets', function (Blueprint $table) {
      $table->id();
      $table->string('name'); // Название виджета
      $table->string('slug')->unique(); // URL slug
      $table->text('description')->nullable(); // Описание виджета
      $table->string('icon')->nullable(); // Иконка виджета
      $table->string('category'); // Категория виджета
      $table->json('fields_config')->nullable(); // Конфигурация полей
      $table->json('settings_config')->nullable(); // Конфигурация настроек
      $table->string('component_name')->nullable(); // Имя React компонента
      $table->text('css_classes')->nullable(); // CSS классы по умолчанию
      $table->text('js_script')->nullable(); // JavaScript код
      $table->boolean('is_active')->default(true); // Активен ли виджет
      $table->boolean('is_premium')->default(false); // Премиум виджет
      $table->integer('sort_order')->default(0); // Порядок сортировки
      $table->timestamps();

      // Индексы
      $table->index(['category', 'is_active', 'sort_order']);
      $table->index('is_premium');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('widgets');
  }
};
