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
    Schema::create('organization_staff', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('last_name'); // Фамилия (обязательное)
      $table->string('first_name'); // Имя (обязательное)
      $table->string('middle_name')->nullable(); // Отчество (опциональное)
      $table->string('position'); // Должность (обязательное)
      $table->string('photo')->nullable(); // Фотография (опциональное)
      $table->text('address')->nullable(); // Адрес (опциональное)
      $table->string('email')->nullable(); // Email (опциональное)
      $table->softDeletes();
      $table->timestamps();

      // Индексы
      $table->index('organization_id');
      $table->index('position');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('organization_staff');
  }
};
