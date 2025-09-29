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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('fundraiser_id')->nullable()->constrained()->onDelete('cascade'); // Связанный сбор
            $table->foreignId('project_id')->nullable()->constrained('organization_projects')->onDelete('cascade'); // Связанный проект
            $table->foreignId('donor_id')->nullable()->constrained('users')->onDelete('set null'); // Донор
            $table->bigInteger('amount'); // Сумма пожертвования в копейках
            $table->string('currency', 3)->default('RUB'); // Валюта
            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->enum('payment_method', ['card', 'sbp', 'yoomoney', 'qiwi', 'webmoney', 'bank_transfer', 'cash'])->nullable();
            $table->string('payment_id')->nullable(); // ID платежа в платежной системе
            $table->string('transaction_id')->nullable(); // ID транзакции
            $table->boolean('is_anonymous')->default(false); // Анонимное пожертвование
            $table->string('donor_name')->nullable(); // Имя донора (если не анонимно)
            $table->string('donor_email')->nullable(); // Email донора
            $table->string('donor_phone')->nullable(); // Телефон донора
            $table->text('donor_message')->nullable(); // Сообщение от донора
            $table->boolean('send_receipt')->default(true); // Отправить чек
            $table->string('receipt_email')->nullable(); // Email для чека
            $table->json('payment_details')->nullable(); // Детали платежа
            $table->json('webhook_data')->nullable(); // Данные webhook
            $table->timestamp('paid_at')->nullable(); // Время оплаты
            $table->timestamp('refunded_at')->nullable(); // Время возврата
            $table->timestamps();
            
            // Индексы
            $table->index(['organization_id', 'status']);
            $table->index(['fundraiser_id', 'status']);
            $table->index(['donor_id', 'created_at']);
            $table->index('payment_id');
            $table->index('transaction_id');
            $table->index('paid_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
