<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_expense_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title');
            $table->bigInteger('amount_kopecks')->default(0);
            $table->string('status', 20)->default('paid'); // paid | pending
            $table->date('report_date');
            $table->string('pdf_file')->nullable();
            $table->unsignedInteger('pdf_file_size')->nullable(); // bytes
            $table->timestamps();
            $table->softDeletes();

            $table->index(['project_id', 'report_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_expense_reports');
    }
};
