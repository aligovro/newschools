<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Промежуточные таблицы для импорта из внешней системы (WP и др.).
 * Используются ТОЛЬКО модулем blagoqr_import. Основное приложение к ним не обращается.
 * После завершения миграции таблицы можно удалить.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blagoqr_import_site_mappings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wp_blog_id')->index();
            $table->string('domain')->index();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('migrated_site_id')->nullable()->constrained('sites')->onDelete('set null');
            $table->string('status', 20)->default('pending')->index();
            $table->json('stats')->nullable();
            $table->json('wp_options')->nullable();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();
            $table->unique(['wp_blog_id', 'organization_id']);
        });

        Schema::create('blagoqr_import_payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->unsignedBigInteger('wp_id')->index();
            $table->string('user_phone', 20)->nullable()->index();
            $table->unsignedBigInteger('post_id')->nullable()->index();
            $table->unsignedBigInteger('wp_autopayment_post_id')->nullable()->index();
            $table->timestamp('request_time')->nullable();
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->string('status', 20)->nullable()->index();
            $table->string('transaction_id')->nullable()->index();
            $table->decimal('payment_amount', 10, 2)->nullable();
            $table->boolean('is_recurring')->default(false)->index();
            $table->json('raw_data')->nullable();
            $table->foreignId('migrated_transaction_id')->nullable()->constrained('payment_transactions')->onDelete('set null');
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_id'], 'blagoqr_pl_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_donators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->unsignedBigInteger('wp_post_id')->index();
            $table->unsignedBigInteger('post_author')->nullable();
            $table->string('post_title')->nullable();
            $table->longText('post_content')->nullable();
            $table->timestamp('post_date')->nullable();
            $table->string('post_status', 20)->nullable();
            $table->json('postmeta')->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_don_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_autopayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->unsignedBigInteger('wp_post_id')->index();
            $table->unsignedBigInteger('post_author')->nullable();
            $table->string('post_title')->nullable();
            $table->longText('post_content')->nullable();
            $table->timestamp('post_date')->nullable();
            $table->string('post_status', 20)->nullable();
            $table->json('postmeta')->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_ap_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_projects', function (Blueprint $table) {
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
            $table->foreignId('migrated_project_id')->nullable()->constrained('projects')->onDelete('set null');
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_proj_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_pages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->unsignedBigInteger('wp_post_id')->index();
            $table->unsignedBigInteger('post_author')->nullable();
            $table->string('post_title')->nullable();
            $table->longText('post_content')->nullable();
            $table->string('post_name')->nullable();
            $table->unsignedBigInteger('post_parent')->default(0);
            $table->string('post_status', 20)->nullable();
            $table->timestamp('post_date')->nullable();
            $table->json('postmeta')->nullable();
            $table->json('raw_data')->nullable();
            $table->foreignId('migrated_page_id')->nullable()->constrained('site_pages')->onDelete('set null');
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_page_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_posts', function (Blueprint $table) {
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
            $table->foreignId('migrated_news_id')->nullable()->constrained('news')->onDelete('set null');
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_post_mapping_wp_unique');
        });

        Schema::create('blagoqr_import_usermeta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('import_site_mapping_id')->constrained('blagoqr_import_site_mappings')->onDelete('cascade');
            $table->unsignedBigInteger('wp_user_id')->index();
            $table->string('user_phone', 30)->nullable()->index();
            $table->string('user_type', 50)->nullable()->index();
            $table->string('edu_year', 20)->nullable()->index();
            $table->string('last_name', 100)->nullable();
            $table->string('region_slug', 100)->nullable();
            $table->text('saved_payment_methods')->nullable();
            $table->timestamps();
            $table->unique(['import_site_mapping_id', 'wp_user_id'], 'blagoqr_um_mapping_user_unique');
        });

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

    public function down(): void
    {
        Schema::dropIfExists('blagoqr_import_region_payments');
        Schema::dropIfExists('blagoqr_import_reports');
        Schema::dropIfExists('blagoqr_import_usermeta');
        Schema::dropIfExists('blagoqr_import_posts');
        Schema::dropIfExists('blagoqr_import_pages');
        Schema::dropIfExists('blagoqr_import_projects');
        Schema::dropIfExists('blagoqr_import_autopayments');
        Schema::dropIfExists('blagoqr_import_donators');
        Schema::dropIfExists('blagoqr_import_payment_logs');
        Schema::dropIfExists('blagoqr_import_site_mappings');
    }
};
