<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    if (Schema::hasTable('sites')) {
      Schema::table('sites', function (Blueprint $table) {
        // organization_id may not exist (defensive), add nullable if exists
        if (Schema::hasColumn('sites', 'organization_id')) {
          $table->unsignedBigInteger('organization_id')->nullable()->change();
        }
        if (!Schema::hasColumn('sites', 'site_type')) {
          $table->enum('site_type', ['organization', 'main'])->default('organization')->after('template');
          $table->index('site_type');
        }
      });
    }
  }

  public function down(): void
  {
    if (Schema::hasTable('sites')) {
      Schema::table('sites', function (Blueprint $table) {
        if (Schema::hasColumn('sites', 'site_type')) {
          $table->dropIndex(['site_type']);
          $table->dropColumn('site_type');
        }
        // Can't reliably revert organization_id nullability
      });
    }
  }
};
