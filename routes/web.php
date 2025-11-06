<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\OrganizationController;
use App\Http\Controllers\Dashboard\SiteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MainSiteController;
use App\Http\Controllers\Dashboard\OrganizationMenuPageController;
use App\Http\Controllers\Dashboard\OrganizationAdminController;
use App\Http\Controllers\Dashboard\OrganizationCreationController;
use App\Http\Controllers\SiteConstructorController;
use App\Http\Controllers\Dashboard\OrganizationSiteController;
use App\Http\Controllers\Dashboard\ProjectController;
use App\Http\Controllers\Dashboard\SuggestedSchoolController;
use App\Http\Controllers\Dashboard\SitePageController;

Route::get('/', [MainSiteController::class, 'index'])->name('home');
Route::get('/organizations', [MainSiteController::class, 'organizations'])->name('main-site.organizations');
Route::get('/organization/{slug}', [MainSiteController::class, 'organization'])->name('main-site.organization');
Route::get('/projects', [App\Http\Controllers\PublicProjectController::class, 'index'])->name('main-site.projects');
Route::get('/project/{slug}', [App\Http\Controllers\PublicProjectController::class, 'show'])->name('main-site.project');

// Legacy public organization routes (deprecated)
Route::prefix('old-api')->group(function () {
    Route::get('/organizations', [App\Http\Controllers\PublicOrganizationController::class, 'index'])->name('organizations.index');
    Route::get('/organizations/{organization}', [App\Http\Controllers\PublicOrganizationController::class, 'show'])->name('organizations.show');
    Route::get('/api/organizations/{organization}', [App\Http\Controllers\PublicOrganizationController::class, 'api'])->name('organizations.api');
});
Route::get('/api/organization-types', [App\Http\Controllers\PublicOrganizationController::class, 'types'])->name('organizations.types');
Route::get('/api/regions', [App\Http\Controllers\PublicOrganizationController::class, 'regions'])->name('organizations.regions');

// Тестовая страница для проверки Tailwind CSS
Route::get('/tailwind-test', function () {
    return Inertia::render('TailwindTestPage');
})->name('tailwind-test');

// Публичный маршрут для превью сайта
Route::get('/sites/{slug}/preview', [App\Http\Controllers\SitePreviewController::class, 'preview'])->name('sites.preview');

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
        Route::get('/organizations/create', [OrganizationCreationController::class, 'create'])->name('organizations.create');
        Route::post('/organizations', [OrganizationCreationController::class, 'store'])->name('organizations.store');
        Route::get('/organizations/{organization}', [OrganizationController::class, 'show'])->name('organizations.show');
        Route::get('/organizations/{organization}/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
        Route::put('/organizations/{organization}', [OrganizationController::class, 'update'])->name('organizations.update');
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy'])->name('organizations.destroy');

        // Organization sites management (REST API)
        Route::prefix('organizations/{organization}/sites')->name('organizations.sites.')->group(function () {
            Route::get('/', [OrganizationSiteController::class, 'index'])->name('index');
            Route::get('/create', [OrganizationSiteController::class, 'create'])->name('create');
            Route::post('/', [OrganizationSiteController::class, 'store'])->name('store');
            Route::get('/{site}/edit', [OrganizationSiteController::class, 'edit'])->name('edit');
            Route::get('/{site}/builder', [OrganizationSiteController::class, 'editWithBuilder'])->name('builder');
            Route::put('/{site}', [OrganizationSiteController::class, 'update'])->name('update');
            Route::delete('/{site}', [OrganizationSiteController::class, 'destroy'])->name('destroy');
            Route::patch('/{site}/publish', [OrganizationSiteController::class, 'publish'])->name('publish');
            Route::patch('/{site}/unpublish', [OrganizationSiteController::class, 'unpublish'])->name('unpublish');
            Route::patch('/{site}/archive', [OrganizationSiteController::class, 'archive'])->name('archive');
            Route::patch('/{site}/enable-maintenance', [OrganizationSiteController::class, 'enableMaintenanceMode'])->name('enable-maintenance');
            Route::patch('/{site}/disable-maintenance', [OrganizationSiteController::class, 'disableMaintenanceMode'])->name('disable-maintenance');
        });

        // Organization staff management
        Route::prefix('organizations/{organization}/staff')->name('organizations.staff.')->group(function () {
            Route::get('/check-director', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'checkDirector'])->name('check-director');
            Route::get('/', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'index'])->name('index');
            Route::post('/', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'store'])->name('store');
            Route::get('/{staff:id}', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'show'])->name('show');
            Route::put('/{staff:id}', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'update'])->name('update');
            Route::delete('/{staff:id}', [App\Http\Controllers\Dashboard\OrganizationStaffController::class, 'destroy'])->name('destroy');
        });

        // Projects management (all projects for super admin)
        Route::get('/projects', [ProjectController::class, 'all'])->name('projects.index');

        // Projects management (organization projects)
        Route::get('/organizations/{organization}/projects', [ProjectController::class, 'index'])->name('organizations.projects.index');
        Route::get('/organizations/{organization}/projects/create', [ProjectController::class, 'create'])->name('organizations.projects.create');
        Route::post('/organizations/{organization}/projects', [ProjectController::class, 'store'])->name('organizations.projects.store');
        Route::get('/organizations/{organization}/projects/{project}', [ProjectController::class, 'show'])->name('organizations.projects.show');
        Route::get('/organizations/{organization}/projects/{project}/edit', [ProjectController::class, 'edit'])->name('organizations.projects.edit');
        Route::put('/organizations/{organization}/projects/{project}', [ProjectController::class, 'update'])->name('organizations.projects.update');
        Route::post('/organizations/{organization}/projects/{project}/stages', [ProjectController::class, 'updateStages'])->name('organizations.projects.stages.save');
        Route::delete('/organizations/{organization}/projects/{project}', [ProjectController::class, 'destroy'])->name('organizations.projects.destroy');
        Route::post('/organizations/{organization}/projects/check-slug', [ProjectController::class, 'checkSlug'])->name('organizations.projects.check-slug');

        // Image upload routes
        Route::post('/api/upload/organization-logo', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'uploadOrganizationLogo'])->name('api.upload.organization-logo');
        Route::post('/api/upload/slider-image', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'uploadSliderImage'])->name('api.upload.slider-image');
        Route::post('/api/upload/gallery-image', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'uploadGalleryImage'])->name('api.upload.gallery-image');
        Route::post('/api/upload/text-widget-image', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'uploadTextWidgetImage'])->name('api.upload.text-widget-image');
        Route::delete('/api/upload/delete-image', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'deleteImage'])->name('api.upload.delete-image');
        Route::get('/api/upload/image-info', [App\Http\Controllers\Dashboard\ImageUploadController::class, 'getImageInfo'])->name('api.upload.image-info');

        // Suggested schools management (super admin only)
        Route::get('/suggested-schools', [SuggestedSchoolController::class, 'index'])->name('suggested-schools.index');
        Route::put('/suggested-schools/{suggestedSchool}', [SuggestedSchoolController::class, 'update'])->name('suggested-schools.update');
        Route::delete('/suggested-schools/{suggestedSchool}', [SuggestedSchoolController::class, 'destroy'])->name('suggested-schools.destroy');

        // Global settings management (super admin only)
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/global-settings', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'index'])->name('global-settings.index');
            Route::post('/global-settings/terminology', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateTerminology'])->name('global-settings.terminology');
            Route::post('/global-settings/system', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateSystemSettings'])->name('global-settings.system');
            Route::post('/global-settings/organization-defaults', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateDefaultOrganizationSettings'])->name('global-settings.organization-defaults');
            Route::post('/global-settings/features', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateFeatureFlags'])->name('global-settings.features');
            Route::post('/global-settings/system-config', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateSystemConfig'])->name('global-settings.system-config');
            Route::post('/global-settings/integrations', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'updateIntegrationSettings'])->name('global-settings.integrations');
            Route::get('/global-settings/export', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'export'])->name('global-settings.export');
            Route::post('/global-settings/import', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'import'])->name('global-settings.import');
            Route::post('/global-settings/reset', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'reset'])->name('global-settings.reset');
            Route::post('/global-settings/preview-terminology', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'previewTerminology'])->name('global-settings.preview-terminology');
            Route::post('/global-settings/clear-cache', [App\Http\Controllers\Dashboard\GlobalSettingsController::class, 'clearCache'])->name('global-settings.clear-cache');
        });

        // Organization menu management
        Route::get('/organizations/{organization}/menus', [OrganizationMenuPageController::class, 'index'])->name('organizations.menus.index');

        // Organization Admin Panel
        Route::prefix('organization/{organization}/admin')->name('organization.admin.')->middleware('organization.admin')->group(function () {
            Route::get('/', [OrganizationAdminController::class, 'dashboard'])->name('dashboard');
            Route::get('/menus', [OrganizationAdminController::class, 'menus'])->name('menus');
            Route::get('/pages', [OrganizationAdminController::class, 'pages'])->name('pages');
            Route::get('/pages/create', [OrganizationAdminController::class, 'createPage'])->name('pages.create');
            Route::get('/users', [OrganizationAdminController::class, 'users'])->name('users');
            Route::get('/settings', [OrganizationAdminController::class, 'settings'])->name('settings');
            Route::get('/gallery', [OrganizationAdminController::class, 'gallery'])->name('gallery');
            Route::get('/payments', [OrganizationAdminController::class, 'payments'])->name('payments');
            Route::get('/analytics', [OrganizationAdminController::class, 'analytics'])->name('analytics');

            // Консоль управления
            Route::prefix('console')->name('console.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'index'])->name('index');
                Route::get('/statistics', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'statistics'])->name('statistics');
                Route::get('/revenue', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'revenue'])->name('revenue');
                Route::get('/members', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'members'])->name('members');
                Route::get('/projects', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'projects'])->name('projects');
                Route::get('/notifications', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'notifications'])->name('notifications');
                Route::post('/quick-action', [App\Http\Controllers\Dashboard\OrganizationConsoleController::class, 'quickAction'])->name('quick-action');
            });

            // Настройки организации
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'index'])->name('index');
                Route::put('/general', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateGeneral'])->name('update-general');
                Route::put('/site', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateSiteSettings'])->name('update-site');
                Route::put('/payments', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updatePaymentSettings'])->name('update-payments');
                Route::put('/notifications', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateNotificationSettings'])->name('update-notifications');
                Route::put('/integrations', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateIntegrationSettings'])->name('update-integrations');
                Route::post('/test-telegram', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'testTelegramBot'])->name('test-telegram');
                Route::get('/export', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'exportSettings'])->name('export');
                Route::post('/import', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'importSettings'])->name('import');
                Route::post('/reset', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'resetToDefaults'])->name('reset');
            });

            // Платежи
            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'index'])->name('index');
                Route::get('/transactions', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'transactions'])->name('transactions');
                Route::post('/create', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'createPayment'])->name('create');
                Route::post('/webhook/yookassa', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'yookassaWebhook'])->name('yookassa-webhook');
                Route::post('/refund/{donation}', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'refund'])->name('refund');
                Route::get('/export', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'export'])->name('export');
                Route::get('/settings', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'settings'])->name('settings');
                Route::put('/settings', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'updateSettings'])->name('update-settings');
                Route::post('/test', [App\Http\Controllers\Dashboard\OrganizationPaymentsController::class, 'testPayment'])->name('test');
            });


            // Telegram бот
            Route::prefix('telegram')->name('telegram.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'index'])->name('index');
                Route::post('/setup', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'setupBot'])->name('setup');
                Route::post('/test-message', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'sendTestMessage'])->name('test-message');
                Route::post('/send-donation-notification', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'sendDonationNotification'])->name('send-donation-notification');
                Route::get('/stats', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'getBotStats'])->name('stats');
                Route::post('/webhook/setup', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'setupWebhook'])->name('setup-webhook');
                Route::delete('/webhook', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'removeWebhook'])->name('remove-webhook');
                Route::post('/webhook', [App\Http\Controllers\Dashboard\OrganizationTelegramController::class, 'handleWebhook'])->name('webhook');
            });

            // Отчеты
            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'index'])->name('index');
                Route::post('/revenue', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'generateRevenueReport'])->name('revenue');
                Route::post('/members', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'generateMembersReport'])->name('members');
                Route::post('/projects', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'generateProjectsReport'])->name('projects');
                Route::post('/comprehensive', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'generateComprehensiveReport'])->name('comprehensive');
                Route::post('/export', [App\Http\Controllers\Dashboard\OrganizationReportsController::class, 'exportReport'])->name('export');
            });

            // Конструктор сайтов (legacy routes removed; use canonical /sites/{site}/builder)

            // API для виджетов
            Route::prefix('api/widgets')->name('widgets.')->group(function () {
                Route::get('/', [App\Http\Controllers\Dashboard\WidgetController::class, 'index'])->name('index');
                Route::get('/template/{template}', [App\Http\Controllers\Dashboard\WidgetController::class, 'getForTemplate'])->name('template');
                Route::get('/site/{site}', [App\Http\Controllers\Dashboard\WidgetController::class, 'getForSite'])->name('site');
                Route::post('/site/{site}/add', [App\Http\Controllers\Dashboard\WidgetController::class, 'addToSite'])->name('add');
                Route::put('/site/{site}/widget/{widget}', [App\Http\Controllers\Dashboard\WidgetController::class, 'updateSiteWidget'])->name('update');
                Route::delete('/site/{site}/widget/{widget}', [App\Http\Controllers\Dashboard\WidgetController::class, 'removeFromSite'])->name('remove');
                Route::patch('/site/{site}/reorder', [App\Http\Controllers\Dashboard\WidgetController::class, 'reorderWidgets'])->name('reorder');
                Route::get('/config/{widget}', [App\Http\Controllers\Dashboard\WidgetController::class, 'getConfig'])->name('config');
                Route::get('/template/{template}/positions', [App\Http\Controllers\Dashboard\WidgetController::class, 'getTemplatePositions'])->name('positions');
                Route::get('/position/{position}/widgets', [App\Http\Controllers\Dashboard\WidgetController::class, 'getWidgetsForPosition'])->name('position-widgets');
            });

            // Projects management (интегрировано в панель админа организации)
            Route::prefix('projects')->name('projects.')->group(function () {
                Route::get('/', [ProjectController::class, 'index'])->name('index');
                Route::get('/create', [ProjectController::class, 'create'])->name('create');
                Route::post('/', [ProjectController::class, 'store'])->name('store');
                Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
                Route::get('/{project}/edit', [ProjectController::class, 'edit'])->name('edit');
                Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
                Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
                Route::post('/check-slug', [ProjectController::class, 'checkSlug'])->name('check-slug');
            });
        });

        // Sites management
        Route::get('/sites', [SiteController::class, 'index'])->name('sites.index');
        Route::get('/sites/{site}', [SiteController::class, 'show'])->name('sites.show');
        Route::post('/sites', [SiteController::class, 'store'])->name('sites.store');
        Route::put('/sites/{site}', [SiteController::class, 'update'])->name('sites.update');
        Route::patch('/sites/{site}', [SiteController::class, 'update'])->name('sites.update');
        Route::delete('/sites/{site}', [SiteController::class, 'destroy'])->name('sites.destroy');

        // Site pages management
        Route::prefix('sites/{site}')->name('sites.')->group(function () {
            Route::get('/pages', [SitePageController::class, 'index'])->name('pages.index');
            Route::get('/pages/create', [SitePageController::class, 'create'])->name('pages.create');
            Route::post('/pages', [SitePageController::class, 'store'])->name('pages.store');
            Route::get('/pages/{page}', [SitePageController::class, 'show'])->name('pages.show');
            Route::get('/pages/{page}/edit', [SitePageController::class, 'edit'])->name('pages.edit');
            Route::put('/pages/{page}', [SitePageController::class, 'update'])->name('pages.update');
            Route::delete('/pages/{page}', [SitePageController::class, 'destroy'])->name('pages.destroy');
        });

        // Site builder
        Route::get('/sites/{site}/builder', [SiteController::class, 'builder'])->name('sites.builder');

        // Site widgets management
        Route::post('/sites/{site}/widgets', [App\Http\Controllers\Api\SiteController::class, 'addWidget'])->name('sites.add-widget');
        Route::put('/sites/{site}/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'updateWidget'])->name('sites.update-widget');
        Route::delete('/sites/{site}/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'deleteWidget'])->name('sites.delete-widget');
        Route::post('/sites/{site}/widgets/{widgetId}/move', [App\Http\Controllers\Api\SiteController::class, 'moveWidget'])->name('sites.move-widget');
        Route::get('/sites/{site}/config', [App\Http\Controllers\Api\SiteController::class, 'getConfig'])->name('sites.get-config');

        // Statistics
        Route::get('/statistics', [DashboardController::class, 'statistics'])->name('statistics.index');

        // Settings
        Route::get('/settings', [DashboardController::class, 'settings'])->name('settings.index');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Site configuration routes - модульная система
Route::prefix('api/sites/{id}')->middleware('auth')->group(function () {
    // Основные настройки сайта
    Route::post('/settings/basic', [App\Http\Controllers\Api\SiteController::class, 'saveBasicSettings'])
        ->name('sites.save-basic-settings');
    Route::post('/settings/design', [App\Http\Controllers\Api\SiteController::class, 'saveDesignSettings'])
        ->name('sites.save-design-settings');
    Route::post('/settings/seo', [App\Http\Controllers\Api\SiteController::class, 'saveSeoSettings'])
        ->name('sites.save-seo-settings');

    // Интеграции: Telegram
    Route::post('/settings/telegram', [App\Http\Controllers\Api\SiteController::class, 'saveTelegramSettings'])
        ->name('sites.save-telegram-settings');

    // Платежи сайта
    Route::post('/settings/payments', [App\Http\Controllers\Api\SiteController::class, 'savePaymentSettings'])
        ->name('sites.save-payment-settings');

    // Макет сайта
    Route::post('/settings/layout', [App\Http\Controllers\Api\SiteController::class, 'saveLayoutSettings'])
        ->name('sites.save-layout-settings');

    // Виджеты
    Route::post('/widgets', [App\Http\Controllers\Api\SiteController::class, 'addWidget'])
        ->name('sites.add-widget');
    Route::put('/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'updateWidget'])
        ->name('sites.update-widget');
    Route::delete('/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'deleteWidget'])
        ->name('sites.delete-widget');
    Route::post('/widgets/{widgetId}/move', [App\Http\Controllers\Api\SiteController::class, 'moveWidget'])
        ->name('sites.move-widget');

    // Конфигурация
    Route::get('/config', [App\Http\Controllers\Api\SiteController::class, 'getConfig'])
        ->name('sites.get-config');

    // Превью
    Route::get('/preview', [App\Http\Controllers\Api\SiteController::class, 'preview'])
        ->name('sites.preview');
});

// Project configuration routes
Route::prefix('api/projects/{id}')->middleware('auth')->group(function () {
    // Платежные настройки проекта
    Route::post('/settings/payments', [App\Http\Controllers\Api\ProjectController::class, 'savePaymentSettings'])
        ->name('projects.save-payment-settings');
});

Route::get('/dashboard/api/regions/{id}', [\App\Http\Controllers\RegionController::class, 'show']);
Route::get('/dashboard/api/cities/{id}', [\App\Http\Controllers\CityController::class, 'show']);

// Публичные страницы сайтов (должен быть последним, чтобы не конфликтовать с другими роутами)
// Страницы главного сайта: /{slug} (например, /kontakty)
// Исключаем известные маршруты, чтобы не перехватывать их
Route::get('/{slug}', [App\Http\Controllers\PublicSitePageController::class, 'showMainSitePage'])
    ->where('slug', '^(?!api|dashboard|organizations|organization|projects|project|old-api|tailwind-test|sites|login|register|password|email|verify).+')
    ->name('public.page.show');
