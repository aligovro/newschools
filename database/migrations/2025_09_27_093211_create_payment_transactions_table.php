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
    Schema::create('payment_transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained()->onDelete('cascade');
      $table->foreignId('fundraiser_id')->nullable()->constrained()->onDelete('set null');
      $table->foreignId('project_id')->nullable()->constrained('organization_projects')->onDelete('set null');
      $table->foreignId('payment_method_id')->constrained()->onDelete('restrict');
      $table->string('transaction_id')->unique(); // Уникальный ID транзакции
      $table->string('external_id')->nullable(); // ID в платежной системе
      $table->bigInteger('amount'); // Сумма в копейках
      $table->string('currency', 3)->default('RUB');
      $table->string('status'); // pending, completed, failed, cancelled, refunded
      $table->string('payment_method_slug'); // Дублируем для быстрого поиска
      $table->json('payment_details')->nullable(); // Детали платежа (маскированная карта, телефон и т.д.)
      $table->json('gateway_response')->nullable(); // Ответ от платежной системы
      $table->json('webhook_data')->nullable(); // Данные webhook'ов
      $table->text('description')->nullable(); // Описание платежа
      $table->string('return_url')->nullable(); // URL для возврата
      $table->string('callback_url')->nullable(); // URL для callback
      $table->string('success_url')->nullable(); // URL при успехе
      $table->string('failure_url')->nullable(); // URL при ошибке
      $table->timestamp('expires_at')->nullable(); // Время истечения
      $table->timestamp('paid_at')->nullable(); // Время оплаты
      $table->timestamp('failed_at')->nullable(); // Время неудачи
      $table->timestamp('refunded_at')->nullable(); // Время возврата
      $table->timestamps();

      $table->index(['organization_id', 'status']);
      $table->index(['fundraiser_id', 'status']);
      $table->index(['project_id', 'status']);
      $table->index(['payment_method_id', 'status']);
      $table->index(['status', 'created_at']);
      $table->index(['transaction_id']);
      $table->index(['external_id']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('payment_transactions');
  }
};
