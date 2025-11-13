<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yookassa_partner_payment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_transaction_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('yookassa_partner_merchant_id')->nullable();
            $table->string('external_payment_id', 191)->nullable()->index();
            $table->string('status', 64)->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();

            $table
                ->foreign(
                    'yookassa_partner_merchant_id',
                    'ykp_payment_details_merchant_fk'
                )
                ->references('id')
                ->on('yookassa_partner_merchants')
                ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yookassa_partner_payment_details');
    }
};
