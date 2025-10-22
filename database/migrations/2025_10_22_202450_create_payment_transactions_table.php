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
    Schema::create('payment_transactions', function (Blueprint $table) {
      $table->id();
      $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
      $table->foreignId('fundraiser_id')->nullable()->constrained('fundraisers')->onDelete('set null');
      $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('set null');
      $table->foreignId('payment_method_id')->constrained('payment_methods')->onDelete('cascade');
      $table->string('transaction_id');
      $table->string('external_id')->nullable();
      $table->bigInteger('amount');
      $table->string('currency', 3)->default('RUB');
      $table->string('status');
      $table->string('payment_method_slug');
      $table->json('payment_details')->nullable();
      $table->json('gateway_response')->nullable();
      $table->json('webhook_data')->nullable();
      $table->text('description')->nullable();
      $table->string('return_url')->nullable();
      $table->string('callback_url')->nullable();
      $table->string('success_url')->nullable();
      $table->string('failure_url')->nullable();
      $table->timestamp('expires_at')->nullable();
      $table->timestamp('paid_at')->nullable();
      $table->timestamp('failed_at')->nullable();
      $table->timestamp('refunded_at')->nullable();
      $table->timestamps();

      // Индексы
      $table->index(['organization_id', 'status']);
      $table->index(['fundraiser_id', 'status']);
      $table->index(['project_id', 'status']);
      $table->index(['payment_method_id', 'status']);
      $table->index(['status', 'created_at']);
      $table->index('status');
      $table->index('transaction_id');
      $table->index('external_id');
      $table->index('paid_at');
      $table->index('created_at');
      $table->unique('transaction_id');
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void
  {
    Schema::dropIfExists('payment_transactions');
  }
};
