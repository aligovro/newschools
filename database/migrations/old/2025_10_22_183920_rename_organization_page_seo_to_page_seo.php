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
    // Переименовываем таблицу organization_page_seo в page_seo
    Schema::rename('organization_page_seo', 'page_seo');
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    // Возвращаем обратно название таблицы
    Schema::rename('page_seo', 'organization_page_seo');
  }
};
