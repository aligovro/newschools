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
    if (Schema::hasTable('donations')) {
      Schema::table('donations', function (Blueprint $table) {
        $table->foreignId('region_id')->nullable()->after('organization_id')->constrained()->onDelete('set null');
        $table->index('region_id');
      });
    }
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('donations', function (Blueprint $table) {
      $table->dropForeign(['region_id']);
      $table->dropIndex(['region_id']);
      $table->dropColumn('region_id');
    });
  }
};
