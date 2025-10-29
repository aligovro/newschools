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
    Schema::table('project_stages', function (Blueprint $table) {
      $table->enum('status', ['pending', 'active', 'completed', 'cancelled'])->default('pending')->after('order');
      $table->date('start_date')->nullable()->after('status');
      $table->date('end_date')->nullable()->after('start_date');
    });
  }

  public function down(): void
  {
    Schema::table('project_stages', function (Blueprint $table) {
      $table->dropColumn(['status', 'start_date', 'end_date']);
    });
  }
};
