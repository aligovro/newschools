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
    Schema::create('users', function (Blueprint $table) {
      $table->id();
      $table->string('name');
      $table->string('email')->unique();
      $table->timestamp('email_verified_at')->nullable();
      $table->string('password');
      $table->boolean('is_active')->default(true);
      $table->foreignId('referred_by_id')->nullable()->constrained('users')->onDelete('set null');
      $table->text('two_factor_secret')->nullable();
      $table->text('two_factor_recovery_codes')->nullable();
      $table->timestamp('two_factor_confirmed_at')->nullable();
      $table->rememberToken();
      $table->foreignId('organization_id')->nullable()->constrained('organizations')->onDelete('set null');
      $table->foreignId('site_id')->nullable()->constrained('sites')->onDelete('set null');
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'is_active']);
      $table->index(['site_id', 'is_active']);
      $table->index('is_active');
      $table->index('referred_by_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('users');
  }
};
