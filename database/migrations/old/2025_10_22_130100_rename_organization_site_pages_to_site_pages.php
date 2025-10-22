<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    if (Schema::hasTable('organization_site_pages') && !Schema::hasTable('site_pages')) {
      Schema::rename('organization_site_pages', 'site_pages');
    }
  }

  public function down(): void
  {
    if (Schema::hasTable('site_pages') && !Schema::hasTable('organization_site_pages')) {
      Schema::rename('site_pages', 'organization_site_pages');
    }
  }
};
