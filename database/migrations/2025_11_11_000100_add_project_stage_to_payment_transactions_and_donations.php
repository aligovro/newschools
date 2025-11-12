<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->foreignId('project_stage_id')
                ->nullable()
                ->after('project_id')
                ->constrained('project_stages')
                ->nullOnDelete();

            $table->index(['project_stage_id', 'status']);
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->foreignId('project_stage_id')
                ->nullable()
                ->after('project_id')
                ->constrained('project_stages')
                ->nullOnDelete();

            $table->index(['project_stage_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('payment_transactions', function (Blueprint $table) {
            $table->dropForeign(['project_stage_id']);
            $table->dropIndex(['project_stage_id', 'status']);
            $table->dropColumn('project_stage_id');
        });

        Schema::table('donations', function (Blueprint $table) {
            $table->dropForeign(['project_stage_id']);
            $table->dropIndex(['project_stage_id', 'status']);
            $table->dropColumn('project_stage_id');
        });
    }
};
