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
      $table->foreignId('region_id')->constrained('regions')->onDelete('cascade');
      $table->string('name');
      $table->string('slug');
      $table->string('code')->nullable();
      $table->enum('type', ['city', 'town', 'village', 'settlement'])->default('city');
      $table->enum('status', ['capital', 'regional_center', 'district_center', 'ordinary'])->default('ordinary');
      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->integer('population')->nullable();
      $table->decimal('area', 10, 2)->nullable();
      $table->integer('founded_year')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы
      $table->index(['region_id', 'is_active']);
      $table->index(['type', 'is_active']);
      $table->index(['status', 'is_active']);
      $table->index('is_active');
      $table->unique('slug');
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
