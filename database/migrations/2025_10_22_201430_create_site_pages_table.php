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
    Schema::create('site_pages', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_id')->constrained('sites')->onDelete('cascade');
      $table->foreignId('parent_id')->nullable()->constrained('site_pages')->onDelete('cascade');
      $table->string('title');
      $table->string('slug');
      $table->text('excerpt')->nullable();
      $table->longText('content')->nullable();
      $table->string('template')->default('default');
      $table->json('layout_config')->nullable();
      $table->json('content_blocks')->nullable();
      $table->json('seo_config')->nullable();
      $table->string('image')->nullable();
      $table->json('images')->nullable();
      $table->string('status')->default('draft');
      $table->boolean('is_homepage')->default(false);
      $table->boolean('is_public')->default(false);
      $table->boolean('show_in_navigation')->default(true);
      $table->integer('sort_order')->default(0);
      $table->timestamp('published_at')->nullable();
      $table->timestamp('last_updated_at')->nullable();
      $table->softDeletes();
      $table->timestamps();

      // Индексы
      $table->index(['site_id', 'status']);
      $table->index(['site_id', 'is_homepage']);
      $table->index(['site_id', 'is_public']);
      $table->index(['site_id', 'parent_id']);
      $table->index(['site_id', 'slug']);
      $table->index('status');
      $table->index('is_public');
      $table->unique(['site_id', 'slug']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('site_pages');
  }
};
