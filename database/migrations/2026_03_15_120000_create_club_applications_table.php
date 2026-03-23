<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('club_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->foreignId('club_id')->nullable()->constrained('organization_clubs')->nullOnDelete();
            $table->string('club_name');           // snapshot на момент подачи
            $table->string('applicant_name');
            $table->string('phone', 30);
            $table->text('comment')->nullable();
            $table->string('status', 20)->default('pending'); // pending | approved | rejected
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index('club_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('club_applications');
    }
};
