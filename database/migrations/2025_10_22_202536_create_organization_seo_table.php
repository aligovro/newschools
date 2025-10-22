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
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('meta_title')->nullable();
      $table->text('meta_description')->nullable();
      $table->json('meta_keywords')->nullable();
      $table->string('og_title')->nullable();
      $table->text('og_description')->nullable();
      $table->string('og_image')->nullable();
      $table->string('twitter_card')->default('summary_large_image');
      $table->string('twitter_title')->nullable();
      $table->text('twitter_description')->nullable();
      $table->string('twitter_image')->nullable();
      $table->string('canonical_url')->nullable();
      $table->json('schema_markup')->nullable();
      $table->json('robots_meta')->nullable();
      $table->json('custom_meta_tags')->nullable();
      $table->json('sitemap_config')->nullable();
      $table->boolean('sitemap_enabled')->default(true);
      $table->timestamp('last_seo_audit')->nullable();
      $table->timestamps();

      // Индексы
      $table->index('organization_id');
      $table->index('sitemap_enabled');
      $table->index('last_seo_audit');
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
