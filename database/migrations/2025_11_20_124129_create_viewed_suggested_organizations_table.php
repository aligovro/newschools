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
        Schema::create('viewed_suggested_organizations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('suggested_organization_id')->constrained('suggested_organizations')->onDelete('cascade');
            $table->timestamp('viewed_at');
            $table->timestamps();

            // Уникальная комбинация пользователя и предложения
            $table->unique(['user_id', 'suggested_organization_id'], 'user_suggested_org_unique');

            // Индексы для быстрого поиска
            $table->index('user_id');
            $table->index('suggested_organization_id');
            $table->index('viewed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('viewed_suggested_organizations');
    }
};
