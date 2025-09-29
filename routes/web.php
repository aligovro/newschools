<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrganizationMenuPageController;
use App\Http\Controllers\OrganizationAdminController;

Route::get('/', [HomeController::class, 'index'])->name('home');

// Public organization routes
Route::get('/organizations', [App\Http\Controllers\PublicOrganizationController::class, 'index'])->name('organizations.index');
Route::get('/organizations/{organization}', [App\Http\Controllers\PublicOrganizationController::class, 'show'])->name('organizations.show');
Route::get('/api/organizations/{organization}', [App\Http\Controllers\PublicOrganizationController::class, 'api'])->name('organizations.api');
Route::get('/api/organization-types', [App\Http\Controllers\PublicOrganizationController::class, 'types'])->name('organizations.types');
Route::get('/api/regions', [App\Http\Controllers\PublicOrganizationController::class, 'regions'])->name('organizations.regions');

// Тестовая страница для проверки Tailwind CSS
Route::get('/tailwind-test', function () {
    return Inertia::render('TailwindTestPage');
})->name('tailwind-test');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users management
    Route::prefix('dashboard')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::post('/users/{user}/assign-role', [UserController::class, 'assignRole'])->name('users.assign-role');
        Route::delete('/users/{user}/remove-role', [UserController::class, 'removeRole'])->name('users.remove-role');

        // Organizations management
        Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/organizations/{organization}', [OrganizationController::class, 'show'])->name('organizations.show');
        Route::post('/organizations', [OrganizationController::class, 'store'])->name('organizations.store');
        Route::put('/organizations/{organization}', [OrganizationController::class, 'update'])->name('organizations.update');
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy'])->name('organizations.destroy');

        // Organization menu management
        Route::get('/organizations/{organization}/menus', [OrganizationMenuPageController::class, 'index'])->name('organizations.menus.index');

        // Organization Admin Panel
        Route::prefix('organization/{organization}/admin')->name('organization.admin.')->middleware('org.admin')->group(function () {
            Route::get('/', [OrganizationAdminController::class, 'dashboard'])->name('dashboard');
            Route::get('/menus', [OrganizationAdminController::class, 'menus'])->name('menus');
            Route::get('/pages', [OrganizationAdminController::class, 'pages'])->name('pages');
            Route::get('/pages/create', [OrganizationAdminController::class, 'createPage'])->name('pages.create');
            Route::get('/users', [OrganizationAdminController::class, 'users'])->name('users');
            Route::get('/settings', [OrganizationAdminController::class, 'settings'])->name('settings');
            Route::get('/gallery', [OrganizationAdminController::class, 'gallery'])->name('gallery');
            Route::get('/payments', [OrganizationAdminController::class, 'payments'])->name('payments');
            Route::get('/analytics', [OrganizationAdminController::class, 'analytics'])->name('analytics');

            // Sliders management
            Route::get('/sliders', [App\Http\Controllers\OrganizationSliderController::class, 'index'])->name('sliders.index');
            Route::get('/sliders/create', [App\Http\Controllers\OrganizationSliderController::class, 'create'])->name('sliders.create');
            Route::post('/sliders', [App\Http\Controllers\OrganizationSliderController::class, 'store'])->name('sliders.store');
            Route::get('/sliders/{slider}/edit', [App\Http\Controllers\OrganizationSliderController::class, 'edit'])->name('sliders.edit');
            Route::put('/sliders/{slider}', [App\Http\Controllers\OrganizationSliderController::class, 'update'])->name('sliders.update');
            Route::delete('/sliders/{slider}', [App\Http\Controllers\OrganizationSliderController::class, 'destroy'])->name('sliders.destroy');
            Route::patch('/sliders/reorder', [App\Http\Controllers\OrganizationSliderController::class, 'reorder'])->name('sliders.reorder');

            // Slides management
            Route::post('/sliders/{slider}/slides', [App\Http\Controllers\OrganizationSliderController::class, 'storeSlide'])->name('sliders.store-slide');
            Route::put('/sliders/{slider}/slides/{slide}', [App\Http\Controllers\OrganizationSliderController::class, 'updateSlide'])->name('sliders.update-slide');
            Route::delete('/sliders/{slider}/slides/{slide}', [App\Http\Controllers\OrganizationSliderController::class, 'destroySlide'])->name('sliders.destroy-slide');
            Route::patch('/sliders/{slider}/slides/reorder', [App\Http\Controllers\OrganizationSliderController::class, 'reorderSlides'])->name('sliders.reorder-slides');

            // Sites management
            Route::get('/sites', [App\Http\Controllers\OrganizationSiteController::class, 'index'])->name('sites.index');
            Route::get('/sites/create', [App\Http\Controllers\OrganizationSiteController::class, 'create'])->name('sites.create');
            Route::post('/sites', [App\Http\Controllers\OrganizationSiteController::class, 'store'])->name('sites.store');
            Route::get('/sites/{site}/edit', [App\Http\Controllers\OrganizationSiteController::class, 'edit'])->name('sites.edit');
            Route::get('/sites/{site}/builder', [App\Http\Controllers\OrganizationSiteController::class, 'editWithBuilder'])->name('sites.builder');
            Route::put('/sites/{site}', [App\Http\Controllers\OrganizationSiteController::class, 'update'])->name('sites.update');
            Route::delete('/sites/{site}', [App\Http\Controllers\OrganizationSiteController::class, 'destroy'])->name('sites.destroy');
            Route::patch('/sites/{site}/publish', [App\Http\Controllers\OrganizationSiteController::class, 'publish'])->name('sites.publish');
            Route::patch('/sites/{site}/unpublish', [App\Http\Controllers\OrganizationSiteController::class, 'unpublish'])->name('sites.unpublish');
            Route::patch('/sites/{site}/archive', [App\Http\Controllers\OrganizationSiteController::class, 'archive'])->name('sites.archive');
            Route::patch('/sites/{site}/enable-maintenance', [App\Http\Controllers\OrganizationSiteController::class, 'enableMaintenanceMode'])->name('sites.enable-maintenance');
            Route::patch('/sites/{site}/disable-maintenance', [App\Http\Controllers\OrganizationSiteController::class, 'disableMaintenanceMode'])->name('sites.disable-maintenance');

            // Site pages management
            Route::post('/sites/{site}/pages', [App\Http\Controllers\OrganizationSiteController::class, 'storePage'])->name('sites.store-page');
            Route::put('/sites/{site}/pages/{page}', [App\Http\Controllers\OrganizationSiteController::class, 'updatePage'])->name('sites.update-page');
            Route::delete('/sites/{site}/pages/{page}', [App\Http\Controllers\OrganizationSiteController::class, 'destroyPage'])->name('sites.destroy-page');
            Route::patch('/sites/{site}/pages/{page}/publish', [App\Http\Controllers\OrganizationSiteController::class, 'publishPage'])->name('sites.publish-page');
            Route::patch('/sites/{site}/pages/{page}/unpublish', [App\Http\Controllers\OrganizationSiteController::class, 'unpublishPage'])->name('sites.unpublish-page');
        });

        // Sites management
        Route::get('/sites', [SiteController::class, 'index'])->name('sites.index');
        Route::get('/sites/{site}', [SiteController::class, 'show'])->name('sites.show');
        Route::post('/sites', [SiteController::class, 'store'])->name('sites.store');
        Route::put('/sites/{site}', [SiteController::class, 'update'])->name('sites.update');
        Route::delete('/sites/{site}', [SiteController::class, 'destroy'])->name('sites.destroy');

        // Statistics
        Route::get('/statistics', function () {
            return Inertia::render('statistics/StatisticsPage');
        })->name('statistics.index');

        // Settings
        Route::get('/settings', function () {
            return Inertia::render('settings/SettingsPage');
        })->name('settings.index');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Public site routes (catch-all for organization domains) - должен быть в самом конце
Route::get('/{path?}', [App\Http\Controllers\PublicSiteController::class, 'show'])
    ->where('path', '.*')
    ->name('public.site');
