<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Дополнительные таблицы и колонки для полной миграции из blagoqr:
 * - blagoqr_import_reports (отчёты с PDF)
 * - blagoqr_import_region_payments (региональные данные)
 * - wp_options JSON в site_mappings
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('blagoqr_import_site_mappings', 'wp_options')) {
            Schema::table('blagoqr_import_site_mappings', function (Blueprint $table) {
                $table->json('wp_options')->nullable()->after('stats');
            });
        }

        if (Schema::hasTable('blagoqr_import_usermeta') && ! Schema::hasColumn('blagoqr_import_usermeta', 'saved_payment_methods')) {
            Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
                $table->text('saved_payment_methods')->nullable()->after('region_slug');
            });
        }

        if (! Schema::hasTable('blagoqr_import_reports')) {
            Schema::create('blagoqr_import_reports', function (Blueprint $table) {
                $table->id();
                $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
                $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
                $table->unsignedBigInteger('wp_post_id')->index();
                $table->unsignedBigInteger('post_author')->nullable();
                $table->string('post_title')->nullable();
                $table->longText('post_content')->nullable();
                $table->longText('post_excerpt')->nullable();
                $table->string('post_name')->nullable();
                $table->string('post_status', 20)->nullable();
                $table->timestamp('post_date')->nullable();
                $table->json('postmeta')->nullable();
                $table->json('raw_data')->nullable();
                $table->unsignedBigInteger('migrated_report_id')->nullable();
                $table->timestamps();

                $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_report_mapping_wp_unique');
            });
        }

        if (! Schema::hasTable('blagoqr_import_region_payments')) {
            Schema::create('blagoqr_import_region_payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
                $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
                $table->unsignedBigInteger('wp_payment_id')->index();
                $table->string('region_key', 10)->nullable()->index();
                $table->decimal('amount', 10, 2)->default(0);
                $table->unsignedBigInteger('wp_user_id')->nullable();
                $table->unsignedBigInteger('wp_project_id')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->json('raw_data')->nullable();
                $table->timestamps();

                $table->unique(['import_site_mapping_id', 'wp_payment_id'], 'blagoqr_regpay_mapping_wp_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('blagoqr_import_region_payments');
        Schema::dropIfExists('blagoqr_import_reports');

        if (Schema::hasColumn('blagoqr_import_site_mappings', 'wp_options')) {
            Schema::table('blagoqr_import_site_mappings', function (Blueprint $table) {
                $table->dropColumn('wp_options');
            });
        }

        if (Schema::hasTable('blagoqr_import_usermeta') && Schema::hasColumn('blagoqr_import_usermeta', 'saved_payment_methods')) {
            Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
                $table->dropColumn('saved_payment_methods');
            });
        }
    }
};
