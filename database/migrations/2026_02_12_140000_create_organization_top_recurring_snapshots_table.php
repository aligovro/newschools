<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Снапшот «Топ регулярно-поддерживающих».
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('organization_top_recurring_snapshots')) {
            return;
        }
        Schema::create('organization_top_recurring_snapshots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('donor_label', 100)->index();
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->unsignedInteger('donations_count')->default(0);
            $table->timestamps();
            $table->unique(['organization_id', 'donor_label'], 'org_top_recurring_org_label_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_top_recurring_snapshots');
    }
};
