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
      $table->foreignId('federal_district_id')->constrained('federal_districts')->onDelete('cascade');
      $table->string('name');
      $table->string('slug');
      $table->string('code');
      $table->string('capital');
      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->bigInteger('population')->nullable();
      $table->bigInteger('area')->nullable();
      $table->string('timezone')->default('Europe/Moscow');
      $table->enum('type', ['region', 'republic', 'krai', 'oblast', 'autonomous_okrug', 'autonomous_oblast', 'federal_city'])->default('region');
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы
      $table->index(['federal_district_id', 'is_active']);
      $table->index('is_active');
      $table->index('type');
      $table->unique('slug');
      $table->unique('code');
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
