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
    Schema::create('form_widgets', function (Blueprint $table) {
      $table->id();
      $table->foreignId('site_id')->constrained('sites')->onDelete('cascade');
      $table->string('name');
      $table->string('slug');
      $table->text('description')->nullable();
      $table->json('settings')->nullable();
      $table->json('styling')->nullable();
      $table->json('actions')->nullable();
      $table->boolean('is_active')->default(true);
      $table->integer('sort_order')->default(0);
      $table->timestamps();

      // Индексы
      $table->index(['site_id', 'is_active']);
      $table->index('is_active');
      $table->index('sort_order');
      $table->unique(['site_id', 'slug']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('form_widgets');
  }
};
