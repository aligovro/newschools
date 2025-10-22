<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('donations', function (Blueprint $table) {
      $table->unsignedBigInteger('referrer_user_id')->nullable()->after('donor_id');
      $table->index(['organization_id', 'referrer_user_id', 'status'], 'donations_org_referrer_status_idx');
    });
  }

  public function down(): void
  {
    Schema::table('donations', function (Blueprint $table) {
      $table->dropIndex('donations_org_referrer_status_idx');
      $table->dropColumn('referrer_user_id');
    });
  }
};
