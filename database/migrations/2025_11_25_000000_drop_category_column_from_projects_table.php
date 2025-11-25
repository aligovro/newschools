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
        Schema::table('projects', function (Blueprint $table) {
            // Поле category больше не используется — удаляем его.
            // MySQL сам удалит связанные индексы, в том числе (category, status).
            if (Schema::hasColumn('projects', 'category')) {
                $table->dropColumn('category');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            if (! Schema::hasColumn('projects', 'category')) {
                $table->enum('category', [
                    'construction',
                    'equipment',
                    'sports',
                    'education',
                    'charity',
                    'events',
                    'medical',
                    'social',
                    'environmental',
                    'other',
                ])->default('other')->after('status');

                $table->index(['category', 'status']);
            }
        });
    }
};
