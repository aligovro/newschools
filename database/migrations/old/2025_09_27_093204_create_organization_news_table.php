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
    Schema::create('organization_news', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->string('title'); // Заголовок новости
      $table->string('slug')->unique(); // URL slug
      $table->text('excerpt')->nullable(); // Краткое описание
      $table->longText('content'); // Содержимое новости
      $table->string('featured_image')->nullable(); // Главное изображение
      $table->json('gallery')->nullable(); // Галерея изображений
      $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
      $table->enum('category', ['news', 'events', 'achievements', 'announcements', 'projects', 'medical', 'social'])->default('news');
      $table->json('tags')->nullable(); // Теги новости
      $table->boolean('featured')->default(false); // Рекомендуемая новость
      $table->boolean('allow_comments')->default(true); // Разрешить комментарии
      $table->json('seo_settings')->nullable(); // SEO настройки
      $table->timestamp('published_at')->nullable(); // Дата публикации
      $table->integer('views_count')->default(0); // Количество просмотров
      $table->integer('likes_count')->default(0); // Количество лайков
      $table->integer('shares_count')->default(0); // Количество репостов
      $table->softDeletes(); // Soft delete
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['status', 'published_at']);
      $table->index(['category', 'featured']);
      $table->index('published_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_news');
  }
};
