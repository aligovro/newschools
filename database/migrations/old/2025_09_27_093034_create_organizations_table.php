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
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Название организации
            $table->string('slug')->unique(); // URL slug для главного сайта
            $table->text('description')->nullable(); // Описание организации
            $table->string('address')->nullable(); // Адрес организации
            $table->string('phone')->nullable(); // Телефон
            $table->string('email')->nullable(); // Email
            $table->string('website')->nullable(); // Официальный сайт
            $table->foreignId('region_id')->nullable()->constrained()->onDelete('set null'); // Регион
            $table->foreignId('city_id')->nullable()->constrained()->onDelete('set null'); // Город
            $table->foreignId('settlement_id')->nullable()->constrained()->onDelete('set null'); // Населенный пункт
            $table->string('city_name')->nullable(); // Название города (для совместимости)
            $table->decimal('latitude', 10, 8)->nullable(); // Широта
            $table->decimal('longitude', 11, 8)->nullable(); // Долгота
            $table->string('logo')->nullable(); // Логотип организации
            $table->json('images')->nullable(); // Дополнительные изображения
            $table->json('contacts')->nullable(); // Дополнительные контакты (соц сети и т.д.)
            $table->enum('type', ['school', 'gymnasium', 'lyceum', 'college', 'shelter', 'hospital', 'church', 'charity', 'foundation', 'ngo'])->default('school'); // Тип организации
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending'); // Статус организации
            $table->boolean('is_public')->default(true); // Публичная ли организация
            $table->json('features')->nullable(); // Дополнительные возможности/особенности
            $table->timestamp('founded_at')->nullable(); // Год основания
            $table->softDeletes(); // Soft delete
            $table->timestamps();

            // Индексы для производительности
            $table->index(['status', 'is_public']);
            $table->index(['region_id', 'city_id']);
            $table->index(['city_id', 'settlement_id']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
