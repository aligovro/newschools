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
        Schema::create('organization_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('theme')->default('default'); // Тема оформления
            $table->string('primary_color')->default('#007bff'); // Основной цвет
            $table->string('secondary_color')->default('#6c757d'); // Дополнительный цвет
            $table->string('accent_color')->default('#28a745'); // Акцентный цвет
            $table->string('font_family')->default('Inter'); // Шрифт
            $table->boolean('dark_mode')->default(false); // Темная тема
            $table->json('custom_css')->nullable(); // Кастомные стили
            $table->json('layout_config')->nullable(); // Конфигурация макета
            $table->json('feature_flags')->nullable(); // Флаги функций
            $table->json('integration_settings')->nullable(); // Настройки интеграций
            $table->json('payment_settings')->nullable(); // Настройки платежей
            $table->json('notification_settings')->nullable(); // Настройки уведомлений
            $table->boolean('maintenance_mode')->default(false); // Режим обслуживания
            $table->text('maintenance_message')->nullable(); // Сообщение в режиме обслуживания
            $table->timestamps();
            
            $table->unique('organization_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_settings');
    }
};
