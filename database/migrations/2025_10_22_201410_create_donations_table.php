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
        Schema::create('donations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_transaction_id')->nullable()->constrained('payment_transactions')->onDelete('set null');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('region_id')->nullable()->constrained('regions')->onDelete('set null');
            $table->foreignId('locality_id')->nullable()->constrained('localities')->onDelete('set null');
            $table->foreignId('fundraiser_id')->nullable()->constrained('fundraisers')->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained('projects')->onDelete('cascade');
            $table->foreignId('project_stage_id')->nullable()->constrained('project_stages')->onDelete('set null');
            $table->foreignId('donor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('referrer_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->bigInteger('amount');
            $table->string('currency', 3)->default('RUB');
      $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
      $table->string('payment_method', 50)->nullable();
            $table->string('payment_id')->nullable();
            $table->string('transaction_id')->nullable();
            $table->boolean('is_anonymous')->default(false);
            $table->string('donor_name')->nullable();
            $table->string('donor_email')->nullable();
            $table->string('donor_phone')->nullable();
            $table->text('donor_message')->nullable();
            $table->boolean('send_receipt')->default(true);
            $table->string('receipt_email')->nullable();
            $table->json('payment_details')->nullable();
            $table->json('webhook_data')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            // Индексы
            $table->index(['organization_id', 'status']);
            $table->index(['region_id', 'status']);
            $table->index(['fundraiser_id', 'status']);
            $table->index(['project_id', 'status']);
            $table->index(['donor_id', 'status']);
            $table->index(['referrer_user_id', 'status']);
            $table->index('status');
            $table->index('payment_method');
            $table->index('paid_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
