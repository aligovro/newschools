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
        Schema::table('organization_settings', function (Blueprint $table) {
            // Расширенные настройки сайта
            $table->json('advanced_layout_config')->nullable()->after('layout_config');
            $table->json('seo_settings')->nullable()->after('advanced_layout_config');
            $table->json('social_media_settings')->nullable()->after('seo_settings');

            // Настройки аналитики
            $table->json('analytics_settings')->nullable()->after('social_media_settings');

            // Настройки безопасности
            $table->json('security_settings')->nullable()->after('analytics_settings');

            // Настройки резервного копирования
            $table->json('backup_settings')->nullable()->after('security_settings');

            // Настройки интеграций
            $table->json('external_integrations')->nullable()->after('backup_settings');

            // Настройки уведомлений (расширенные)
            $table->json('advanced_notification_settings')->nullable()->after('external_integrations');

            // Настройки темы и стилей
            $table->json('theme_settings')->nullable()->after('advanced_notification_settings');

            // Настройки производительности
            $table->json('performance_settings')->nullable()->after('theme_settings');

            // Метаданные настроек
            $table->json('settings_metadata')->nullable()->after('performance_settings');

            // Индексы для быстрого поиска
            $table->index(['theme']);
            $table->index(['dark_mode']);
            $table->index(['maintenance_mode']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organization_settings', function (Blueprint $table) {
            // Удаляем индексы
            $table->dropIndex(['theme']);
            $table->dropIndex(['dark_mode']);
            $table->dropIndex(['maintenance_mode']);

            // Удаляем колонки
            $table->dropColumn([
                'advanced_layout_config',
                'seo_settings',
                'social_media_settings',
                'analytics_settings',
                'security_settings',
                'backup_settings',
                'external_integrations',
                'advanced_notification_settings',
                'theme_settings',
                'performance_settings',
                'settings_metadata',
            ]);
        });
    }
};
