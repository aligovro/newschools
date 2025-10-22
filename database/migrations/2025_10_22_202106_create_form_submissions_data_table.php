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
    Schema::create('form_submissions_data', function (Blueprint $table) {
      $table->id();
      $table->foreignId('form_submission_id')->constrained('form_submissions')->onDelete('cascade');
      $table->foreignId('form_widget_id')->constrained('form_widgets')->onDelete('cascade');
      $table->json('data')->nullable();
      $table->timestamps();

      // Индексы
      $table->index(['form_submission_id', 'form_widget_id']);
      $table->index('form_widget_id');
      $table->index('created_at');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('form_submissions_data');
  }
};
