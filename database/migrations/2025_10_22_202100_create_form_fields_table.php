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
    Schema::create('form_fields', function (Blueprint $table) {
      $table->id();
      $table->foreignId('form_widget_id')->constrained('form_widgets')->onDelete('cascade');
      $table->string('name');
      $table->string('label');
      $table->string('type');
      $table->text('placeholder')->nullable();
      $table->text('help_text')->nullable();
      $table->json('options')->nullable();
      $table->json('validation')->nullable();
      $table->json('styling')->nullable();
      $table->boolean('is_required')->default(false);
      $table->boolean('is_active')->default(true);
      $table->integer('sort_order')->default(0);
      $table->timestamps();

      // Индексы
      $table->index(['form_widget_id', 'is_active']);
      $table->index(['form_widget_id', 'sort_order']);
      $table->index('is_active');
      $table->index('sort_order');
      $table->unique(['form_widget_id', 'name']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('form_fields');
  }
};
