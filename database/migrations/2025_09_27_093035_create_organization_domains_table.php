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
        Schema::create('organization_domains', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('domain')->unique(); // Домен организации (например, org123.organizations.loc)
            $table->string('custom_domain')->nullable()->unique(); // Кастомный домен (например, org-name.ru)
            $table->string('subdomain')->nullable(); // Поддомен если используется
            $table->boolean('is_primary')->default(false); // Основной ли это домен
            $table->boolean('is_ssl_enabled')->default(true); // Включен ли SSL
            $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('pending');
            $table->timestamp('verified_at')->nullable(); // Когда домен был верифицирован
            $table->timestamp('expires_at')->nullable(); // Срок действия домена
            $table->json('ssl_config')->nullable(); // Конфигурация SSL
            $table->json('dns_records')->nullable(); // DNS записи
            $table->timestamps();
            
            // Индексы
            $table->index(['organization_id', 'is_primary']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_domains');
    }
};
