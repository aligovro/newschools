<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('organization_page_seo', function (Blueprint $table) {
      $table->id();
      $table->foreignId('page_id')->constrained('organization_pages')->onDelete('cascade');
      $table->string('meta_title')->nullable();
      $table->text('meta_description')->nullable();
      $table->json('meta_keywords')->nullable();
      $table->string('og_title')->nullable();
      $table->text('og_description')->nullable();
      $table->string('og_image')->nullable();
      $table->string('twitter_card')->nullable();
      $table->string('twitter_title')->nullable();
      $table->text('twitter_description')->nullable();
      $table->string('twitter_image')->nullable();
      $table->string('canonical_url')->nullable();
      $table->json('schema_markup')->nullable();
      $table->json('robots_meta')->nullable();
      $table->json('custom_meta_tags')->nullable();
      $table->timestamps();
      $table->unique('page_id');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('organization_page_seo');
  }
};
