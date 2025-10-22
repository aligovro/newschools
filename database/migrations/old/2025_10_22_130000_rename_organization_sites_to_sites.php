<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('organization_sites') && !Schema::hasTable('sites')) {
            Schema::rename('organization_sites', 'sites');
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('sites') && !Schema::hasTable('organization_sites')) {
            Schema::rename('sites', 'organization_sites');
        }
    }
};
