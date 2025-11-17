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
        Schema::create('project_sponsors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organization_user_id')->constrained('organization_users')->cascadeOnDelete();
            $table->enum('status', ['pending', 'active', 'paused'])->default('pending');
            $table->enum('source', ['manual', 'donation', 'subscription'])->default('manual');
            $table->unsignedBigInteger('pledge_amount')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'organization_user_id']);
            $table->index(['organization_user_id', 'status']);
            $table->index(['project_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_sponsors');
    }
};

