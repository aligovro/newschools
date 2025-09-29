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
    Schema::create('organization_slider_slides', function (Blueprint $table) {
      $table->id();
      $table->foreignId('slider_id')->constrained('organization_sliders')->onDelete('cascade');
      $table->string('title')->nullable();
      $table->string('subtitle')->nullable();
      $table->text('description')->nullable();
      $table->string('image')->nullable();
      $table->string('background_image')->nullable();
      $table->string('button_text')->nullable();
      $table->string('button_url')->nullable();
      $table->string('button_style')->default('primary');
      $table->string('content_type')->nullable(); // news, projects, members, etc.
      $table->json('content_data')->nullable();
      $table->boolean('is_active')->default(true);
      $table->integer('sort_order')->default(0);
      $table->timestamp('display_from')->nullable();
      $table->timestamp('display_until')->nullable();
      $table->timestamps();
      $table->softDeletes();

      $table->index(['slider_id', 'is_active', 'sort_order']);
      $table->index(['slider_id', 'content_type']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_slider_slides');
  }
};
