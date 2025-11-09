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
        Schema::create('report_runs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('report_id')->nullable()->constrained('reports')->nullOnDelete();
            $table->foreignId('organization_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('project_stage_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('generated_by')->nullable()->references('id')->on('users')->nullOnDelete();
            $table->string('report_type');
            $table->string('status')->default('ready');
            $table->string('format')->default('json');
            $table->json('filters')->nullable();
            $table->json('meta')->nullable();
            $table->json('summary')->nullable();
            $table->json('data')->nullable();
            $table->unsignedInteger('rows_count')->default(0);
            $table->timestamp('generated_at');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['report_id', 'generated_at']);
            $table->index(['organization_id', 'report_type']);
            $table->index(['project_id', 'project_stage_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_runs');
    }
};
