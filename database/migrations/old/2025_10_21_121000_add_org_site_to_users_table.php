<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->foreignId('organization_id')->nullable()->after('remember_token')->constrained('organizations')->onDelete('set null');
      $table->foreignId('site_id')->nullable()->after('organization_id')->constrained('organization_sites')->onDelete('set null');
    });
  }

  public function down(): void
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropConstrainedForeignId('organization_id');
      $table->dropConstrainedForeignId('site_id');
    });
  }
};
