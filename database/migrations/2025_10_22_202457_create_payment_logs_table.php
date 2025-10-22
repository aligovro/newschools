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
    Schema::create('payment_logs', function (Blueprint $table) {
      $table->id();
      $table->foreignId('payment_transaction_id')->constrained('payment_transactions')->onDelete('cascade');
      $table->string('action');
      $table->string('level')->default('info');
      $table->text('message');
      $table->json('context')->nullable();
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();
      $table->timestamps();

      // Индексы
      $table->index(['payment_transaction_id', 'level']);
      $table->index(['payment_transaction_id', 'action']);
      $table->index(['level', 'created_at']);
      $table->index('level');
      $table->index('action');
      $table->index('created_at');
      $table->index('ip_address');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('payment_logs');
  }
};
