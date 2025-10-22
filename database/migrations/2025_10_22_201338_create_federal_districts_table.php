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
      $table->string('name');
      $table->string('slug');
      $table->string('code', 10);
      $table->string('center');
      $table->decimal('latitude', 10, 8)->nullable();
      $table->decimal('longitude', 11, 8)->nullable();
      $table->bigInteger('area')->nullable();
      $table->bigInteger('population')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();

      // Индексы
      $table->index('is_active');
      $table->unique('slug');
      $table->unique('code');
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
