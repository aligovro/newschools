<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->unsignedBigInteger('referred_by_id')->nullable()->after('password');
      $table->index('referred_by_id', 'users_referred_by_idx');
    });
  }

  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropIndex('users_referred_by_idx');
      $table->dropColumn('referred_by_id');
    });
  }
};
