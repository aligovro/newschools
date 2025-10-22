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
      $table->foreignId('region_id')->constrained('regions')->onDelete('cascade');
      $table->foreignId('city_id')->nullable()->constrained('cities')->onDelete('set null');
      $table->string('name');
      $table->string('slug');
      $table->enum('type', ['village', 'hamlet', 'settlement', 'rural_settlement', 'urban_settlement'])->default('village');
      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->integer('population')->nullable();
      $table->decimal('area', 8, 2)->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы
      $table->index(['region_id', 'is_active']);
      $table->index(['city_id', 'is_active']);
      $table->index(['type', 'is_active']);
      $table->index('is_active');
      $table->unique('slug');
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
