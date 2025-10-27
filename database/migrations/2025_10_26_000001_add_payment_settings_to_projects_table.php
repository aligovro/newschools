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
    if (!Schema::hasTable('projects')) {
      return;
    }

    Schema::table('projects', function (Blueprint $table) {
      if (!Schema::hasColumn('projects', 'payment_settings')) {
        $table->json('payment_settings')->nullable()->after('seo_settings');
      }
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    if (!Schema::hasTable('projects')) {
      return;
    }

    Schema::table('projects', function (Blueprint $table) {
      if (Schema::hasColumn('projects', 'payment_settings')) {
        $table->dropColumn('payment_settings');
      }
    });
  }
};
