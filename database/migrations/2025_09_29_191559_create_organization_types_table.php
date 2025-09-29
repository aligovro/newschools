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
    Schema::create('organization_types', function (Blueprint $table) {
      $table->id();
      $table->string('key')->unique(); // school, shelter, etc.
      $table->string('name'); // Школа, Приют, etc.
      $table->string('plural'); // Школы, Приюты, etc.
      $table->string('member_type'); // alumni, beneficiary, etc.
      $table->string('member_name'); // Выпускник, Подопечный, etc.
      $table->string('member_plural'); // Выпускники, Подопечные, etc.
      $table->string('domain_prefix'); // schools, shelters, etc.
      $table->json('features')->nullable(); // Массив функций
      $table->json('categories')->nullable(); // Массив категорий
      $table->boolean('is_active')->default(true);
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_types');
  }
};
