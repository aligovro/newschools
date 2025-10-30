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
    Schema::table('organizations', function (Blueprint $table) {
      $table->unsignedBigInteger('admin_user_id')->nullable()->after('founded_at');
      $table->foreign('admin_user_id')->references('id')->on('users')->onDelete('set null');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::table('organizations', function (Blueprint $table) {
      $table->dropForeign(['admin_user_id']);
      $table->dropColumn('admin_user_id');
    });
  }
};
