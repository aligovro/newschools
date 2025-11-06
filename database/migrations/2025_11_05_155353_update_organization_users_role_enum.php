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
    // MySQL doesn't support modifying enum directly, so we need to use DB raw query
    \Illuminate\Support\Facades\DB::statement("ALTER TABLE organization_users MODIFY COLUMN role ENUM('admin', 'organization_admin', 'graduate', 'sponsor', 'editor', 'moderator', 'viewer') DEFAULT 'viewer'");
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    \Illuminate\Support\Facades\DB::statement("ALTER TABLE organization_users MODIFY COLUMN role ENUM('admin', 'editor', 'moderator', 'viewer') DEFAULT 'viewer'");
  }
};
