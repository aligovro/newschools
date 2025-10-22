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
        Schema::create('settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->onDelete('cascade'); // Связь с регионом
            $table->foreignId('city_id')->nullable()->constrained()->onDelete('set null'); // Связь с городом (если есть)
            $table->string('name'); // Название населенного пункта
            $table->string('slug'); // URL slug
            $table->enum('type', ['village', 'hamlet', 'settlement', 'rural_settlement', 'urban_settlement'])->default('village'); // Тип населенного пункта
            $table->decimal('latitude', 10, 8)->nullable(); // Широта
            $table->decimal('longitude', 11, 8)->nullable(); // Долгота
            $table->integer('population')->nullable(); // Население
            $table->decimal('area', 8, 2)->nullable(); // Площадь в км²
            $table->boolean('is_active')->default(true); // Активен ли населенный пункт
            $table->timestamps();
            
            $table->index(['region_id', 'name']);
            $table->index('city_id');
            $table->index('type');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settlements');
    }
};
