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
    Schema::create('regions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('federal_district_id')->constrained()->onDelete('cascade'); // Связь с федеральным округом
      $table->string('name'); // Название региона
      $table->string('slug')->unique(); // URL slug
      $table->string('code')->unique(); // Код региона (например, 77 для Москвы)
      $table->string('capital'); // Административный центр
      $table->decimal('latitude', 10, 8)->nullable(); // Широта
      $table->decimal('longitude', 11, 8)->nullable(); // Долгота
      $table->bigInteger('population')->nullable(); // Население
      $table->bigInteger('area')->nullable(); // Площадь в км²
      $table->string('timezone')->default('Europe/Moscow'); // Часовой пояс
      $table->enum('type', ['region', 'republic', 'krai', 'oblast', 'autonomous_okrug', 'autonomous_oblast', 'federal_city'])->default('region'); // Тип региона
      $table->boolean('is_active')->default(true); // Активен ли регион
      $table->timestamps();

      $table->index('code');
      $table->index('federal_district_id');
      $table->index('type');
      $table->index('is_active');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('regions');
  }
};
