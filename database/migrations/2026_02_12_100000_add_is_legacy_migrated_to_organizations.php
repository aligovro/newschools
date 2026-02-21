<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * is_legacy_migrated — флаг «организация перенесена из внешней системы».
 *
 * Когда true: автоплатежи и счётчик подписчиков берутся из organization_autopayments
 * (заполняется при sync из blagoqr_import_autopayments).
 * Когда false: данные из payment_transactions по saved_payment_method_id.
 *
 * Позволяет не обращаться к промежуточным таблицам blagoqr_import_* в основном коде.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            if (!Schema::hasColumn('organizations', 'is_legacy_migrated')) {
                $table->boolean('is_legacy_migrated')->default(false)->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            if (Schema::hasColumn('organizations', 'is_legacy_migrated')) {
                $table->dropColumn('is_legacy_migrated');
            }
        });
    }
};
