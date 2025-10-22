<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    if (Schema::hasTable('main_site_settings')) {
      Schema::drop('main_site_settings');
    }
  }

  public function down(): void
  {
    // No-op: we won't recreate this table in down to avoid data mismatch
  }
};
