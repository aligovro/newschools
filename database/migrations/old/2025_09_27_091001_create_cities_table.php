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
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->onDelete('cascade'); // Связь с регионом
            $table->string('name'); // Название города
            $table->string('slug'); // URL slug
            $table->string('code')->nullable(); // Код города
            $table->enum('type', ['city', 'town', 'village', 'settlement'])->default('city'); // Тип населенного пункта
            $table->enum('status', ['capital', 'regional_center', 'district_center', 'ordinary'])->default('ordinary'); // Статус города
            $table->decimal('latitude', 10, 8)->nullable(); // Широта
            $table->decimal('longitude', 11, 8)->nullable(); // Долгота
            $table->integer('population')->nullable(); // Население
            $table->decimal('area', 10, 2)->nullable(); // Площадь в км²
            $table->integer('founded_year')->nullable(); // Год основания
            $table->boolean('is_active')->default(true); // Активен ли город
            $table->timestamps();
            
            $table->index(['region_id', 'name']);
            $table->index('type');
            $table->index('status');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
