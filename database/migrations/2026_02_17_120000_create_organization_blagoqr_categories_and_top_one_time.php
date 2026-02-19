<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Отдельное хранение данных по выпускам/ролям для организаций, перенесённых из blagoqr.
 * Категории доноров (Выпуск X г., Друзья лицея, Родители) и снапшот «Топ поддержавших выпусков» (разовые платежи).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('organization_blagoqr_categories')) {
            Schema::create('organization_blagoqr_categories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('organization_id');
                $table->string('key', 50)->index(); // сырой ключ из WP: 2003, friend, parent
                $table->string('label', 100);        // подпись для отображения: Выпуск 2003 г., Друзья лицея
                $table->string('type', 20)->default('graduate')->index(); // graduate|friend|parent
                $table->unsignedSmallInteger('display_order')->default(0);
                $table->timestamps();

                $table->unique(['organization_id', 'key'], 'org_blagoqr_cat_org_key_unique');
                $table->foreign('organization_id', 'org_blagoqr_cat_org_fk')->references('id')->on('organizations')->onDelete('cascade');
            });
        }

        if (! Schema::hasTable('organization_blagoqr_top_one_time_snapshots')) {
            Schema::create('organization_blagoqr_top_one_time_snapshots', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('organization_id');
                $table->string('donor_label', 100)->index();
                $table->unsignedBigInteger('total_amount')->default(0);
                $table->unsignedInteger('payments_count')->default(0);
                $table->timestamps();

                $table->unique(['organization_id', 'donor_label'], 'org_blagoqr_one_time_org_label_unique');
                $table->foreign('organization_id', 'org_blagoqr_onetime_org_fk')->references('id')->on('organizations')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_blagoqr_top_one_time_snapshots');
        Schema::dropIfExists('organization_blagoqr_categories');
    }
};
