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
        Schema::create('federal_districts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Название федерального округа
            $table->string('slug')->unique(); // URL slug
            $table->string('code', 10)->unique(); // Код федерального округа
            $table->string('center'); // Административный центр
            $table->decimal('latitude', 10, 8)->nullable(); // Широта центра
            $table->decimal('longitude', 11, 8)->nullable(); // Долгота центра
            $table->bigInteger('area')->nullable(); // Площадь в км²
            $table->bigInteger('population')->nullable(); // Население
            $table->boolean('is_active')->default(true); // Активен ли округ
            $table->timestamps();

            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('federal_districts');
    }
};
