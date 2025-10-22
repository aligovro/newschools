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
    Schema::table('projects', function (Blueprint $table) {
      // Сначала удаляем внешний ключ
      $table->dropForeign('organization_projects_organization_id_foreign');

      // Делаем поле nullable
      $table->foreignId('organization_id')->nullable()->change();

      // Добавляем внешний ключ обратно
      $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('set null');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('projects', function (Blueprint $table) {
      // Удаляем внешний ключ
      $table->dropForeign('organization_projects_organization_id_foreign');

      // Делаем поле обязательным
      $table->foreignId('organization_id')->nullable(false)->change();

      // Добавляем внешний ключ обратно
      $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
    });
  }
};
