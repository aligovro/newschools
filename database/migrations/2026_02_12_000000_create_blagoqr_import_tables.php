<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Промежуточные таблицы для импорта из blagoqr_prod (WP мультисайт).
 * Временные — после миграции данных можно удалить миграцией drop.
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
            $table->string('status', 20)->default('pending')->index();
            $table->json('stats')->nullable();
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
            $table->timestamp('request_time')->nullable();
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->string('status', 20)->nullable()->index();
            $table->string('transaction_id')->nullable()->index();
            $table->decimal('payment_amount', 10, 2)->nullable();
            $table->boolean('is_recurring')->default(false)->index();
            $table->json('raw_data')->nullable();
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
            $table->timestamps();

            $table->unique(['import_site_mapping_id', 'wp_post_id'], 'blagoqr_post_mapping_wp_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blagoqr_import_posts');
        Schema::dropIfExists('blagoqr_import_pages');
        Schema::dropIfExists('blagoqr_import_projects');
        Schema::dropIfExists('blagoqr_import_autopayments');
        Schema::dropIfExists('blagoqr_import_donators');
        Schema::dropIfExists('blagoqr_import_payment_logs');
        Schema::dropIfExists('blagoqr_import_site_mappings');
    }
};
