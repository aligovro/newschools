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
    // Переименовываем таблицу organization_projects в projects
    Schema::rename('organization_projects', 'projects');
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // Возвращаем обратно название таблицы
    Schema::rename('projects', 'organization_projects');
  }
};
