<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Расширение blagoqr_import_usermeta для миграции профиля ЛК (last_name, region).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
            $table->string('last_name', 100)->nullable()->after('edu_year');
            $table->string('region_slug', 100)->nullable()->after('last_name');
        });
    }

    public function down(): void
    {
        Schema::table('blagoqr_import_usermeta', function (Blueprint $table) {
            $table->dropColumn(['last_name', 'region_slug']);
        });
    }
};
