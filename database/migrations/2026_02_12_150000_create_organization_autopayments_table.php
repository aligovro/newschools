<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Автоплатежи организации (миграция + нативные).
 * subscription_key = payment_details.saved_payment_method_id.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('organization_autopayments')) {
            return;
        }
        Schema::create('organization_autopayments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('subscription_key', 100)->index();
            $table->unsignedBigInteger('source_post_id')->nullable()->index();
            $table->string('title')->nullable();
            $table->string('phone_number', 20)->nullable()->index();
            $table->unsignedInteger('amount')->default(0);
            $table->string('recurring_period', 20)->nullable();
            $table->string('payment_method_slug', 50)->nullable();
            $table->string('payment_method_id', 100)->nullable();
            $table->string('status', 20)->nullable();
            $table->timestamp('first_payment_at')->nullable();
            $table->timestamps();
            $table->unique(['organization_id', 'subscription_key'], 'org_autopayments_org_key_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_autopayments');
    }
};
