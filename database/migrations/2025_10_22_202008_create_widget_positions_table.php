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
    Schema::create('widget_positions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('template_id')->constrained('site_templates')->onDelete('cascade');
      $table->string('name');
      $table->string('slug');
      $table->text('description')->nullable();
      $table->string('area');
      $table->integer('order')->default(0);
      $table->json('allowed_widgets')->nullable();
      $table->json('layout_config')->nullable();
      $table->boolean('is_required')->default(false);
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы
      $table->index(['template_id', 'area']);
      $table->index(['template_id', 'is_active']);
      $table->index(['area', 'is_active']);
      $table->index('is_active');
      $table->index('order');
      $table->unique(['template_id', 'slug']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('widget_positions');
  }
};
