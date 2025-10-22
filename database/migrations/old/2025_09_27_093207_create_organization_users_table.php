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
        Schema::create('organization_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['admin', 'editor', 'moderator', 'viewer'])->default('viewer'); // Роль в организации
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('pending'); // Статус пользователя в организации
            $table->json('permissions')->nullable(); // Дополнительные разрешения
            $table->timestamp('joined_at')->nullable(); // Дата присоединения
            $table->timestamp('last_active_at')->nullable(); // Последняя активность
            $table->timestamps();
            
            // Индексы
            $table->unique(['organization_id', 'user_id']);
            $table->index(['user_id', 'status']);
            $table->index(['organization_id', 'role']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_users');
    }
};
