<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Bootstrap для модуля импорта из blagoqr_prod (WP мультисайт).
 * Регистрирует модуль только при наличии конфигурации и папки blagoqr_import.
 * Модуль не попадает в Git — предназначен только для локальной миграции.
 */
class BlagoqrImportServiceProvider extends ServiceProvider
{
    private const MODULE_PATH = 'blagoqr_import/src';
    private const MODULE_PROVIDER = \BlagoqrImport\BlagoqrImportServiceProvider::class;

    public function register(): void
    {
        if ($this->canLoadModule()) {
            $this->app->register(self::MODULE_PROVIDER);
        } else {
            $this->app->bind(
                \App\Contracts\MigratedSiteWidgetsServiceInterface::class,
                \App\Services\NullMigratedSiteWidgetsService::class
            );
        }
    }

    private function canLoadModule(): bool
    {
        if (! env('BLAGOQR_DB_DATABASE')) {
            return false;
        }

        if (! file_exists(base_path(self::MODULE_PATH))) {
            return false;
        }

        return true;
    }
}
