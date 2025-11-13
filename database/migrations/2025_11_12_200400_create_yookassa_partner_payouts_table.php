<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yookassa_partner_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('yookassa_partner_merchant_id')->constrained('yookassa_partner_merchants')->onDelete('cascade');
            $table->string('external_payout_id', 191)->nullable()->index();
            $table->string('status', 64)->nullable();
            $table->unsignedBigInteger('amount')->default(0);
            $table->string('currency', 8)->default('RUB');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yookassa_partner_payouts');
    }
};

