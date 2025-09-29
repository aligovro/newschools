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
        Schema::create('organization_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->index();
            $table->longText('content')->nullable();
            $table->text('excerpt')->nullable();
            $table->enum('status', ['draft', 'published', 'private', 'scheduled'])->default('draft');
            $table->string('template')->default('default');

            // SEO поля
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_keywords')->nullable();
            $table->string('seo_image')->nullable();

            // Медиа
            $table->string('featured_image')->nullable();

            // Структура
            $table->integer('sort_order')->default(0);
            $table->foreignId('parent_id')->nullable()->constrained('organization_pages')->onDelete('cascade');
            $table->boolean('is_homepage')->default(false);

            // Публикация
            $table->timestamp('published_at')->nullable();

            // Дополнительные данные
            $table->json('meta_data')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Индексы
            $table->unique(['organization_id', 'slug']);
            $table->unique(['organization_id', 'is_homepage']);
            $table->index(['organization_id', 'status']);
            $table->index(['organization_id', 'template']);
            $table->index(['parent_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_pages');
    }
};
