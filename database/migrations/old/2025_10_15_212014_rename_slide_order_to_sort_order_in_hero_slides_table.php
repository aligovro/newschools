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
    Schema::table('site_widget_hero_slides', function (Blueprint $table) {
      $table->renameColumn('slide_order', 'sort_order');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('site_widget_hero_slides', function (Blueprint $table) {
      $table->renameColumn('sort_order', 'slide_order');
    });
  }
};
