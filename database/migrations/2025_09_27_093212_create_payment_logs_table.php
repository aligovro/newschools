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
      $table->foreignId('payment_transaction_id')->constrained()->onDelete('cascade');
      $table->string('action'); // created, updated, completed, failed, webhook_received, etc.
      $table->string('level')->default('info'); // info, warning, error, debug
      $table->text('message');
      $table->json('context')->nullable(); // Дополнительный контекст
      $table->string('ip_address')->nullable();
      $table->string('user_agent')->nullable();
      $table->timestamps();

      $table->index(['payment_transaction_id', 'created_at']);
      $table->index(['action', 'created_at']);
      $table->index(['level', 'created_at']);
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
