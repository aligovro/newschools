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
        Schema::create('widget_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('site_templates')->onDelete('cascade');
            $table->string('name'); // Название позиции
            $table->string('slug'); // URL slug позиции
            $table->text('description')->nullable(); // Описание позиции
            $table->string('area'); // Область (header, footer, sidebar, content)
            $table->integer('order')->default(0); // Порядок в области
            $table->json('allowed_widgets')->nullable(); // Разрешенные виджеты
            $table->json('layout_config')->nullable(); // Конфигурация макета
            $table->boolean('is_required')->default(false); // Обязательная позиция
            $table->boolean('is_active')->default(true); // Активна ли позиция
            $table->timestamps();

            // Индексы
            $table->index(['template_id', 'area', 'order']);
            $table->index(['template_id', 'is_active']);
            $table->unique(['template_id', 'slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_positions');
    }
};
