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
        Schema::table('reports', function (Blueprint $table) {
            $table->foreignId('site_id')
                ->nullable()
                ->after('project_stage_id')
                ->constrained()
                ->nullOnDelete();

            $table->index(['site_id', 'report_type']);
        });

        Schema::table('report_runs', function (Blueprint $table) {
            $table->foreignId('site_id')
                ->nullable()
                ->after('project_stage_id')
                ->constrained()
                ->nullOnDelete();

            $table->index(['site_id', 'report_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_runs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('site_id');
            $table->dropIndex('report_runs_site_id_report_type_index');
        });

        Schema::table('reports', function (Blueprint $table) {
            $table->dropConstrainedForeignId('site_id');
            $table->dropIndex('reports_site_id_report_type_index');
        });
    }
};
