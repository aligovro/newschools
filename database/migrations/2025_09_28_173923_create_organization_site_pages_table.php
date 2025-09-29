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
        Schema::create('organization_site_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('site_id')->constrained('organization_sites')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('organization_site_pages')->onDelete('cascade');
            $table->string('title'); // Заголовок страницы
            $table->string('slug'); // URL slug страницы
            $table->text('excerpt')->nullable(); // Краткое описание
            $table->longText('content')->nullable(); // Содержимое страницы
            $table->string('template')->default('default'); // Шаблон страницы
            $table->json('layout_config')->nullable(); // Конфигурация макета страницы
            $table->json('content_blocks')->nullable(); // Блоки контента
            $table->json('seo_config')->nullable(); // SEO настройки
            $table->string('featured_image')->nullable(); // Изображение страницы
            $table->string('status')->default('draft'); // draft, published, archived
            $table->boolean('is_homepage')->default(false); // Главная ли страница
            $table->boolean('is_public')->default(false); // Публичная ли страница
            $table->boolean('show_in_navigation')->default(true); // Показывать в навигации
            $table->integer('sort_order')->default(0); // Порядок сортировки
            $table->timestamp('published_at')->nullable(); // Дата публикации
            $table->timestamp('last_updated_at')->nullable(); // Последнее обновление
            $table->timestamps();

            // Индексы
            $table->index(['site_id', 'status']);
            $table->index(['site_id', 'is_homepage']);
            $table->index(['site_id', 'is_public']);
            $table->index(['site_id', 'parent_id']);
            $table->index(['site_id', 'slug']);
            $table->index('status');
            $table->index('is_public');

            // Уникальный индекс для slug в рамках сайта
            $table->unique(['site_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_site_pages');
    }
};
