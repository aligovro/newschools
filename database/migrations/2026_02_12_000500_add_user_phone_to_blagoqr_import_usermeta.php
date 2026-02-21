<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Добавить user_phone в blagoqr_import_usermeta.
 * Нужно для БД, созданных до добавления колонки в create_blagoqr_import_tables
 * (импорт дампа, старые окружения).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('blagoqr_import_usermeta', 'user_phone')) {
            Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
                $table->string('user_phone', 30)->nullable()->index()->after('wp_user_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('blagoqr_import_usermeta', 'user_phone')) {
            Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
                $table->dropColumn('user_phone');
            });
        }
    }
};
