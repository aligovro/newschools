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
    Schema::table('donations', function (Blueprint $table) {
      $table->foreignId('locality_id')->nullable()->after('region_id')->constrained('localities')->onDelete('set null');
      $table->index(['locality_id', 'status']);
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('donations', function (Blueprint $table) {
      $table->dropForeign(['locality_id']);
      $table->dropIndex(['locality_id', 'status']);
      $table->dropColumn('locality_id');
    });
  }
};
