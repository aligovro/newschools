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
    Schema::table('organization_sites', function (Blueprint $table) {
      // Сначала удаляем внешний ключ
      $table->dropForeign(['domain_id']);

      // Делаем поле nullable
      $table->foreignId('domain_id')->nullable()->change();

      // Добавляем внешний ключ обратно
      $table->foreign('domain_id')->references('id')->on('domains')->onDelete('set null');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('organization_sites', function (Blueprint $table) {
      // Удаляем внешний ключ
      $table->dropForeign(['domain_id']);

      // Делаем поле обязательным
      $table->foreignId('domain_id')->nullable(false)->change();

      // Добавляем внешний ключ обратно
      $table->foreign('domain_id')->references('id')->on('domains')->onDelete('cascade');
    });
  }
};
