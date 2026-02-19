<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blagoqr_import_projects', function (Blueprint $table) {
            $table->foreignId('migrated_project_id')->nullable()->after('raw_data')
                ->constrained('projects')->onDelete('set null');
        });

        Schema::table('blagoqr_import_payment_logs', function (Blueprint $table) {
            $table->foreignId('migrated_transaction_id')->nullable()->after('raw_data')
                ->constrained('payment_transactions')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('blagoqr_import_projects', fn (Blueprint $t) => $t->dropConstrainedForeignId('migrated_project_id'));
        Schema::table('blagoqr_import_payment_logs', fn (Blueprint $t) => $t->dropConstrainedForeignId('migrated_transaction_id'));
    }
};
