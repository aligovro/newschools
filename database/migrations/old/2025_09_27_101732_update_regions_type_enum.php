<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
  /**
   * Run the migrations.
   */
  public function up(): void
  {
    // SQLite не поддерживает MODIFY COLUMN, поэтому пропускаем эту миграцию для SQLite
    if (DB::getDriverName() !== 'sqlite') {
      // Изменяем enum для добавления 'autonomous_oblast'
      DB::statement("ALTER TABLE regions MODIFY COLUMN type ENUM('region', 'republic', 'krai', 'oblast', 'autonomous_okrug', 'autonomous_oblast', 'federal_city') DEFAULT 'region'");
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // SQLite не поддерживает MODIFY COLUMN, поэтому пропускаем эту миграцию для SQLite
    if (DB::getDriverName() !== 'sqlite') {
      // Возвращаем обратно к исходному enum
      DB::statement("ALTER TABLE regions MODIFY COLUMN type ENUM('region', 'republic', 'krai', 'oblast', 'autonomous_okrug', 'federal_city') DEFAULT 'region'");
    }
  }
};
