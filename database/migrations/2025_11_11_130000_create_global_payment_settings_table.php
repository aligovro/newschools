<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_payment_settings', function (Blueprint $table) {
            $table->id();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Migrate existing settings from global_settings if the column exists
        if (Schema::hasTable('global_settings') && Schema::hasColumn('global_settings', 'default_payment_settings')) {
            $existing = DB::table('global_settings')
                ->select('default_payment_settings')
                ->orderBy('id')
                ->first();

            $settings = $existing?->default_payment_settings ?? [];

            DB::table('global_payment_settings')->insert([
                'id' => 1,
                'settings' => json_encode($settings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Schema::table('global_settings', function (Blueprint $table) {
                $table->dropColumn('default_payment_settings');
            });
        } else {
            // Ensure a default row exists even if there was nothing to migrate
            DB::table('global_payment_settings')->insert([
                'id' => 1,
                'settings' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('global_settings')) {
            Schema::table('global_settings', function (Blueprint $table) {
                if (!Schema::hasColumn('global_settings', 'default_payment_settings')) {
                    $table->json('default_payment_settings')->nullable();
                }
            });

            $current = DB::table('global_payment_settings')->select('settings')->first();

            if ($current) {
                DB::table('global_settings')->update([
                    'default_payment_settings' => $current->settings,
                ]);
            }
        }

        Schema::dropIfExists('global_payment_settings');
    }
};
