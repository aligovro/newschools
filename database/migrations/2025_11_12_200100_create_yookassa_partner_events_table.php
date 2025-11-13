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
        Schema::create('yookassa_partner_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type', 128);
            $table->string('object_id', 191)->nullable();
            $table->string('object_type', 64)->nullable();
            $table->json('payload');
            $table->timestamp('processed_at')->nullable();
            $table->string('processing_status', 32)->default('pending');
            $table->text('processing_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('yookassa_partner_events');
    }
};

