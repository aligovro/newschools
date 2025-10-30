<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            if (!Schema::hasColumn('sites', 'payment_settings')) {
                $table->json('payment_settings')->nullable()->after('seo_config');
            }
        });

        // Мигрируем старые настройки из custom_settings.payments в payment_settings
        try {
            $sites = DB::table('sites')
                ->select('id', 'custom_settings', 'payment_settings')
                ->get();
            foreach ($sites as $site) {
                if (!empty($site->payment_settings)) {
                    continue;
                }
                if (empty($site->custom_settings)) {
                    continue;
                }
                $custom = json_decode($site->custom_settings, true);
                if (json_last_error() !== JSON_ERROR_NONE || empty($custom['payments'])) {
                    continue;
                }
                DB::table('sites')
                    ->where('id', $site->id)
                    ->update(['payment_settings' => json_encode($custom['payments'])]);
            }
        } catch (\Throwable $e) {
            // пропускаем тихо, если что-то пошло не так при миграции данных
        }
    }

    public function down(): void
    {
        Schema::table('sites', function (Blueprint $table) {
            if (Schema::hasColumn('sites', 'payment_settings')) {
                $table->dropColumn('payment_settings');
            }
        });
    }
};
