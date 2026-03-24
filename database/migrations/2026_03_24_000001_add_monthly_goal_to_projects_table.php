<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            // Ежемесячная цель сбора (в копейках, как target_amount)
            $table->bigInteger('monthly_goal_amount')->nullable()->after('target_amount');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('monthly_goal_amount');
        });
    }
};
