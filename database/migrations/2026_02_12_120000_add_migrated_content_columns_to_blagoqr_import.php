<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blagoqr_import_pages', function (Blueprint $table) {
            $table->foreignId('migrated_page_id')->nullable()->after('raw_data')
                ->constrained('site_pages')->onDelete('set null');
        });

        Schema::table('blagoqr_import_posts', function (Blueprint $table) {
            $table->foreignId('migrated_news_id')->nullable()->after('raw_data')
                ->constrained('news')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('blagoqr_import_pages', fn (Blueprint $t) => $t->dropConstrainedForeignId('migrated_page_id'));
        Schema::table('blagoqr_import_posts', fn (Blueprint $t) => $t->dropConstrainedForeignId('migrated_news_id'));
    }
};
