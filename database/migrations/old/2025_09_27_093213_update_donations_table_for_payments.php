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
    Schema::table('donations', function (Blueprint $table) {
      // Добавляем связь с транзакциями
      $table->foreignId('payment_transaction_id')->nullable()->after('id')
        ->constrained('payment_transactions')->onDelete('set null');

      // Добавляем индекс для быстрого поиска
      $table->index(['payment_transaction_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('donations', function (Blueprint $table) {
      $table->dropForeign(['payment_transaction_id']);
      $table->dropIndex(['payment_transaction_id']);
      $table->dropColumn('payment_transaction_id');
    });
  }
};
