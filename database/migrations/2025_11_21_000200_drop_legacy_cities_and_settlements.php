<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Удаляем legacy-колонки city_id и settlement_id из таблиц
        if (Schema::hasTable('organizations')) {
            Schema::table('organizations', function (Blueprint $table) {
                if (Schema::hasColumn('organizations', 'city_id')) {
                    $table->dropColumn('city_id');
                }
                if (Schema::hasColumn('organizations', 'settlement_id')) {
                    $table->dropColumn('settlement_id');
                }
            });
        }

        if (Schema::hasTable('donations')) {
            Schema::table('donations', function (Blueprint $table) {
                if (Schema::hasColumn('donations', 'city_id')) {
                    $table->dropColumn('city_id');
                }
            });
        }

        if (Schema::hasTable('suggested_organizations')) {
            Schema::table('suggested_organizations', function (Blueprint $table) {
                if (Schema::hasColumn('suggested_organizations', 'city_id')) {
                    $table->dropColumn('city_id');
                }
            });
        }

        // Наконец, удаляем таблицы cities и settlements
        if (Schema::hasTable('settlements')) {
            Schema::drop('settlements');
        }

        if (Schema::hasTable('cities')) {
            Schema::drop('cities');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Обратное восстановление legacy-структуры не реализуем,
        // так как переход на localities считается окончательным.
    }
};
