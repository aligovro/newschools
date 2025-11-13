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
        Schema::create('yookassa_partner_merchants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->onDelete('cascade');
            $table->string('status', 32)->default('draft'); // draft, pending, active, rejected, blocked
            $table->string('external_id', 191)->nullable()->index();
            $table->string('onboarding_id', 191)->nullable()->index();
            $table->string('contract_id', 191)->nullable();
            $table->string('payout_account_id', 191)->nullable();
            $table->string('payout_status', 32)->nullable();
            $table->json('credentials')->nullable(); // shop_id, secret_key, webhook_secret, access_token
            $table->json('settings')->nullable(); // additional partner settings
            $table->json('documents')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yookassa_partner_merchants');
    }
};
