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
    Schema::create('domains', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->string('domain');
      $table->string('custom_domain')->nullable();
      $table->string('subdomain')->nullable();
      $table->boolean('is_primary')->default(false);
      $table->boolean('is_ssl_enabled')->default(true);
      $table->enum('status', ['active', 'inactive', 'pending', 'suspended'])->default('pending');
      $table->timestamp('verified_at')->nullable();
      $table->timestamp('expires_at')->nullable();
      $table->json('ssl_config')->nullable();
      $table->json('dns_records')->nullable();
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index('domain');
      $table->index('custom_domain');
      $table->index('subdomain');
      $table->index('is_primary');
      $table->index('status');
      $table->unique('domain');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('domains');
  }
};
