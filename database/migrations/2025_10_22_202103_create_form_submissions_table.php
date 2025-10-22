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
    Schema::create('form_submissions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('form_widget_id')->constrained('form_widgets')->onDelete('cascade');
      $table->json('data');
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();
      $table->string('referer')->nullable();
      $table->enum('status', ['pending', 'processed', 'failed'])->default('pending');
      $table->text('error_message')->nullable();
      $table->json('actions_log')->nullable();
      $table->timestamps();

      // Индексы
      $table->index(['form_widget_id', 'status']);
      $table->index(['status', 'created_at']);
      $table->index('status');
      $table->index('created_at');
      $table->index('ip_address');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('form_submissions');
  }
};
