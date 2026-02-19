<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blagoqr_import_site_mappings', function (Blueprint $table) {
            $table->foreignId('migrated_site_id')->nullable()->after('organization_id')
                ->constrained('sites')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('blagoqr_import_site_mappings', fn (Blueprint $t) => $t->dropConstrainedForeignId('migrated_site_id'));
    }
};
