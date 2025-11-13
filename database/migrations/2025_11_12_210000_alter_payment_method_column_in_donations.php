<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE donations MODIFY payment_method VARCHAR(50) NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement(
            "ALTER TABLE donations MODIFY payment_method ENUM('card','sbp','yoomoney','qiwi','webmoney','bank_transfer','cash') NULL"
        );
    }
};


