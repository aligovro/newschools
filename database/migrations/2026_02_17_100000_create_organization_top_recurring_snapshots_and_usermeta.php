<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Снапшот «Топ регулярно-поддерживающих» из blagoqr (get_autopayments) и usermeta для расчёта.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blagoqr_import_usermeta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->unsignedBigInteger('wp_user_id')->index();
            $table->string('user_type', 50)->nullable()->index();
            $table->string('edu_year', 20)->nullable()->index();
            $table->timestamps();

            $table->unique(['import_site_mapping_id', 'wp_user_id'], 'blagoqr_um_mapping_user_unique');
        });

        Schema::create('organization_top_recurring_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('donor_label', 100)->index();
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->unsignedInteger('donations_count')->default(0);
            $table->timestamps();

            $table->unique(['organization_id', 'donor_label'], 'org_top_recurring_org_label_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_top_recurring_snapshots');
        Schema::dropIfExists('blagoqr_import_usermeta');
    }
};
