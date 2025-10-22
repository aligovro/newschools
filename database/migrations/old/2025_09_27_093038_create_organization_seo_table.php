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
        Schema::create('organization_seo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('meta_title')->nullable(); // Meta title
            $table->text('meta_description')->nullable(); // Meta description
            $table->json('meta_keywords')->nullable(); // Meta keywords
            $table->string('og_title')->nullable(); // Open Graph title
            $table->text('og_description')->nullable(); // Open Graph description
            $table->string('og_image')->nullable(); // Open Graph изображение
            $table->string('twitter_card')->default('summary_large_image'); // Twitter Card тип
            $table->string('twitter_title')->nullable(); // Twitter title
            $table->text('twitter_description')->nullable(); // Twitter description
            $table->string('twitter_image')->nullable(); // Twitter изображение
            $table->string('canonical_url')->nullable(); // Канонический URL
            $table->json('schema_markup')->nullable(); // Schema.org разметка
            $table->json('robots_meta')->nullable(); // Robots meta теги
            $table->json('custom_meta_tags')->nullable(); // Кастомные meta теги
            $table->json('sitemap_config')->nullable(); // Конфигурация sitemap
            $table->boolean('sitemap_enabled')->default(true); // Включен ли sitemap
            $table->timestamp('last_seo_audit')->nullable(); // Последний SEO аудит
            $table->timestamps();
            
            $table->unique('organization_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_seo');
    }
};
