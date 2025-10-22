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
    Schema::create('organization_projects', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('title'); // Название проекта
      $table->string('slug')->unique(); // URL slug
      $table->text('description'); // Описание проекта
      $table->text('short_description')->nullable(); // Краткое описание
      $table->string('image')->nullable(); // Главное изображение
      $table->json('gallery')->nullable(); // Галерея изображений
      $table->bigInteger('target_amount')->nullable(); // Целевая сумма в копейках
      $table->bigInteger('collected_amount')->default(0); // Собранная сумма в копейках
      $table->enum('status', ['draft', 'active', 'completed', 'cancelled', 'suspended'])->default('draft');
      $table->enum('category', ['construction', 'equipment', 'sports', 'education', 'charity', 'events', 'medical', 'social', 'environmental', 'other'])->default('other');
      $table->json('tags')->nullable(); // Теги проекта
      $table->date('start_date')->nullable(); // Дата начала
      $table->date('end_date')->nullable(); // Дата окончания
      $table->json('beneficiaries')->nullable(); // Бенефициары проекта
      $table->json('progress_updates')->nullable(); // Обновления прогресса
      $table->boolean('featured')->default(false); // Рекомендуемый проект
      $table->integer('views_count')->default(0); // Количество просмотров
      $table->integer('donations_count')->default(0); // Количество пожертвований
      $table->json('seo_settings')->nullable(); // SEO настройки для проекта
      $table->softDeletes(); // Soft delete
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['status', 'featured']);
      $table->index('category');
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_projects');
  }
};
