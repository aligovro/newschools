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
        Schema::create('organization_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->date('date'); // Дата статистики
            $table->integer('page_views')->default(0); // Просмотры страниц
            $table->integer('unique_visitors')->default(0); // Уникальные посетители
            $table->integer('new_donations')->default(0); // Новые пожертвования
            $table->bigInteger('donation_amount')->default(0); // Сумма пожертвований в копейках
            $table->integer('new_projects')->default(0); // Новые проекты
            $table->integer('new_members')->default(0); // Новые участники
            $table->integer('new_news')->default(0); // Новые новости
            $table->json('traffic_sources')->nullable(); // Источники трафика
            $table->json('popular_pages')->nullable(); // Популярные страницы
            $table->json('device_stats')->nullable(); // Статистика по устройствам
            $table->timestamps();
            
            // Индексы
            $table->unique(['organization_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_statistics');
    }
};
