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
    Schema::create('organization_sites', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->foreignId('domain_id')->constrained('organization_domains')->onDelete('cascade');
      $table->string('name'); // Название сайта
      $table->string('slug')->unique(); // URL slug для админки
      $table->text('description')->nullable(); // Описание сайта
      $table->string('template')->default('default'); // Шаблон сайта
      $table->json('layout_config')->nullable(); // Конфигурация макета
      $table->json('theme_config')->nullable(); // Конфигурация темы
      $table->json('content_blocks')->nullable(); // Блоки контента
      $table->json('navigation_config')->nullable(); // Конфигурация навигации
      $table->json('seo_config')->nullable(); // SEO настройки
      $table->json('custom_settings')->nullable(); // Дополнительные настройки
      $table->string('logo')->nullable(); // Логотип сайта
      $table->string('favicon')->nullable(); // Фавиконка
      $table->string('status')->default('draft'); // draft, published, archived
      $table->boolean('is_public')->default(false); // Публичный ли сайт
      $table->boolean('is_maintenance_mode')->default(false); // Режим обслуживания
      $table->text('maintenance_message')->nullable(); // Сообщение при обслуживании
      $table->timestamp('published_at')->nullable(); // Дата публикации
      $table->timestamp('last_updated_at')->nullable(); // Последнее обновление
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['domain_id', 'is_public']);
      $table->index('status');
      $table->index('is_public');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_sites');
  }
};
