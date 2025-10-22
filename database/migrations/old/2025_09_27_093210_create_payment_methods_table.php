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
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Название (СБП, Банковская карта, Сбербанк)
            $table->string('slug')->unique(); // slug (sbp, bankcard, sberpay)
            $table->string('gateway')->nullable(); // Класс шлюза (SBPGateway, YookassaGateway)
            $table->string('icon')->nullable(); // Иконка
            $table->text('description')->nullable(); // Описание
            $table->json('settings')->nullable(); // Настройки шлюза
            $table->decimal('fee_percentage', 5, 2)->default(0); // Комиссия в процентах
            $table->integer('fee_fixed')->default(0); // Фиксированная комиссия в копейках
            $table->integer('min_amount')->default(100); // Минимальная сумма в копейках
            $table->integer('max_amount')->default(0); // Максимальная сумма в копейках (0 = без ограничений)
            $table->boolean('is_active')->default(true);
            $table->boolean('is_test_mode')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
