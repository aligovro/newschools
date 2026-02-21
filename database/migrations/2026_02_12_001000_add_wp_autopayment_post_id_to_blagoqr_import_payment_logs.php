<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Добавляет wp_autopayment_post_id в blagoqr_import_payment_logs.
 * Нужно для таблиц, созданных старыми миграциями или восстановленных из дампа.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('blagoqr_import_payment_logs')) {
            return;
        }

        Schema::table('blagoqr_import_payment_logs', function (Blueprint $table) {
            if (! Schema::hasColumn('blagoqr_import_payment_logs', 'wp_autopayment_post_id')) {
                $table->unsignedBigInteger('wp_autopayment_post_id')->nullable()->after('post_id')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('blagoqr_import_payment_logs', function (Blueprint $table) {
            if (Schema::hasColumn('blagoqr_import_payment_logs', 'wp_autopayment_post_id')) {
                $table->dropColumn('wp_autopayment_post_id');
            }
        });
    }
};
