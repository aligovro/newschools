<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\OrganizationController;
use App\Http\Controllers\Dashboard\SiteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MainSiteController;
use App\Http\Controllers\Dashboard\OrganizationAdminController;
use App\Http\Controllers\Dashboard\OrganizationCreationController;
use App\Http\Controllers\SiteConstructorController;
use App\Http\Controllers\Dashboard\OrganizationSiteController;
use App\Http\Controllers\Dashboard\BegetDomainController;
use App\Http\Controllers\Dashboard\ProjectController;
use App\Http\Controllers\Dashboard\NewsController as DashboardNewsController;
use App\Http\Controllers\Dashboard\SuggestedOrganizationController;
use App\Http\Controllers\Dashboard\ReportsOverviewController;
use App\Http\Controllers\Dashboard\SitePageController;
use App\Http\Controllers\Webhook\YooKassaPartnerWebhookController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\PublicProjectController;
use App\Http\Controllers\PublicSponsorController;
use App\Http\Controllers\PublicProjectDonationsController;
use App\Http\Controllers\PublicOrganizationDonationsController;
use App\Http\Controllers\PublicAlumniController;
use App\Http\Controllers\PublicOrganizationController;
use App\Http\Controllers\SitePreviewController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Dashboard\ImageUploadController;
use App\Http\Controllers\Dashboard\GlobalSettingsController;
use App\Http\Controllers\Dashboard\OrganizationConsoleController;
use App\Http\Controllers\Dashboard\OrganizationSettingsController;
use App\Http\Controllers\Dashboard\OrganizationPaymentsController;
use App\Http\Controllers\Dashboard\OrganizationTelegramController;
use App\Http\Controllers\Dashboard\WidgetController;
use App\Http\Controllers\Dashboard\OrganizationStaffController;
use App\Http\Controllers\Dashboard\OrganizationReportsController;
use App\Http\Controllers\Dashboard\YooKassa\OAuthController as YooKassaOAuthController;
use App\Http\Controllers\Api\SiteController as ApiSiteController;
use App\Http\Controllers\Api\ProjectController as ApiProjectController;
use App\Http\Controllers\Api\FormWidgetController;
use App\Http\Controllers\Api\FormSubmissionController;
use App\Http\Controllers\PaymentReturnController;
use App\Http\Controllers\PublicSitePageController;
use App\Http\Controllers\SiteStylesController;

Route::get('/', [PublicSitePageController::class, 'showHomeOrPage'])->name('home');

// Скомпилированные стили сайта (SCSS → CSS на лету, без npm build)
Route::get('/site-css/{id}', [SiteStylesController::class, 'show'])->name('site-css.show')->whereNumber('id');
Route::get('/organizations', [MainSiteController::class, 'organizations'])->name('main-site.organizations');
Route::get('/organization/{slug}', [MainSiteController::class, 'organization'])->name('main-site.organization');
Route::get('/projects', [PublicProjectController::class, 'index'])->name('main-site.projects');
Route::get('/project/{slug}', [PublicProjectController::class, 'show'])->name('main-site.project');
Route::get('/news', [MainSiteController::class, 'news'])->name('main-site.news');
Route::get('/news/{slug}', [MainSiteController::class, 'showNews'])->name('main-site.news.show');
Route::get('/project/{project:slug}/sponsors', [PublicSponsorController::class, 'projectSponsors'])->name('main-site.project.sponsors');
Route::get('/project/{project:slug}/donations/top', [PublicProjectDonationsController::class, 'topByDonor'])->name('main-site.project.donations.top');
Route::get('/project/{project:slug}/donations/top-recurring', [PublicProjectDonationsController::class, 'topRecurring'])->name('main-site.project.donations.top-recurring');
Route::get('/project/{project:slug}/donations', [PublicProjectDonationsController::class, 'allDonations'])->name('main-site.project.donations');
Route::get('/organization/{organization:slug}/sponsors', [PublicSponsorController::class, 'organizationSponsors'])->name('main-site.organization.sponsors');
Route::get('/organization/{organization:slug}/alumni', [PublicAlumniController::class, 'organizationAlumni'])->name('main-site.organization.alumni');
Route::get('/organization/{organization:slug}/donations/top', [PublicOrganizationDonationsController::class, 'topByDonor'])->name('main-site.organization.donations.top');
Route::get('/organization/{organization:slug}/donations/top-recurring', [PublicOrganizationDonationsController::class, 'topRecurring'])->name('main-site.organization.donations.top-recurring');
Route::get('/organization/{organization:slug}/donations', [PublicOrganizationDonationsController::class, 'allDonations'])->name('main-site.organization.donations');

// Публичные API для организаций (используются через /api/public/organizations)
Route::get('/api/organization-types', [PublicOrganizationController::class, 'types'])->name('organizations.types');
Route::get('/api/regions', [PublicOrganizationController::class, 'regions'])->name('organizations.regions');

// Тестовая страница для проверки Tailwind CSS
Route::get('/tailwind-test', function () {
    return Inertia::render('TailwindTestPage');
})->name('tailwind-test');

// Публичный маршрут для превью сайта (только опубликованные)
Route::get('/sites/{slug}/preview', [SitePreviewController::class, 'preview'])->name('sites.preview');

// Profile routes
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::match(['put', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update.public');
});

// Личный кабинет на сайтах организаций (my-account)
Route::middleware(['auth'])->group(function () {
    Route::get('/my-account', [App\Http\Controllers\SiteAccountController::class, 'index'])->name('site-account.index');
    Route::get('/my-account/{section}', [App\Http\Controllers\SiteAccountController::class, 'show'])
        ->where('section', 'personal|payments|auto-payments|cards|invite')
        ->defaults('section', 'personal')
        ->name('site-account.show');
});

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

        Route::get('/yookassa/merchants', function () {
            return Inertia::render('dashboard/yookassa/MerchantsPage');
        })->name('yookassa.merchants');

        Route::get('/yookassa/payments', function () {
            return Inertia::render('dashboard/yookassa/PaymentsPage');
        })->name('yookassa.payments');

        Route::get('/yookassa/payouts', function () {
            return Inertia::render('dashboard/yookassa/PayoutsPage');
        })->name('yookassa.payouts');

        Route::get('/yookassa/settings', function () {
            return Inertia::render('dashboard/yookassa/SettingsPage');
        })->name('yookassa.settings');


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
            // Beget: привязка доменов
            Route::get('/{site}/beget/domains', [BegetDomainController::class, 'domains'])->name('beget.domains');
            Route::post('/{site}/beget/bind', [BegetDomainController::class, 'bind'])->name('beget.bind');
            Route::delete('/{site}/beget/unbind', [BegetDomainController::class, 'unbind'])->name('beget.unbind');
        });

        // Organization staff management
        Route::prefix('organizations/{organization}/staff')->name('organizations.staff.')->group(function () {
            Route::get('/check-director', [OrganizationStaffController::class, 'checkDirector'])->name('check-director');
            Route::get('/', [OrganizationStaffController::class, 'index'])->name('index');
            Route::post('/', [OrganizationStaffController::class, 'store'])->name('store');
            Route::get('/{staff:id}', [OrganizationStaffController::class, 'show'])->name('show');
            Route::put('/{staff:id}', [OrganizationStaffController::class, 'update'])->name('update');
            Route::delete('/{staff:id}', [OrganizationStaffController::class, 'destroy'])->name('destroy');
        });

        // Projects management (all projects for super admin)
        Route::get('/projects', [ProjectController::class, 'all'])->name('projects.index');
        Route::get('/news', [DashboardNewsController::class, 'all'])->name('news.index');
        Route::get('/news/create', [DashboardNewsController::class, 'create'])->name('news.create');
        Route::post('/news', [DashboardNewsController::class, 'store'])->name('news.store');
        Route::get('/news/{news}', [DashboardNewsController::class, 'show'])->name('news.show');
        Route::get('/news/{news}/edit', [DashboardNewsController::class, 'edit'])->name('news.edit');
        Route::put('/news/{news}', [DashboardNewsController::class, 'update'])->name('news.update');
        Route::delete('/news/{news}', [DashboardNewsController::class, 'destroy'])->name('news.destroy');

        Route::get('/reports', [ReportsOverviewController::class, 'index'])->name('reports.index');

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
        Route::post('/api/upload/organization-logo', [ImageUploadController::class, 'uploadOrganizationLogo'])->name('api.upload.organization-logo');
        Route::post('/api/upload/bank-requisites-logo', [ImageUploadController::class, 'uploadBankRequisitesLogo'])->name('api.upload.bank-requisites-logo');
        Route::post('/api/upload/slider-image', [ImageUploadController::class, 'uploadSliderImage'])->name('api.upload.slider-image');
        Route::post('/api/upload/gallery-image', [ImageUploadController::class, 'uploadGalleryImage'])->name('api.upload.gallery-image');
        Route::post('/api/upload/news-cover-image', [ImageUploadController::class, 'uploadNewsCoverImage'])->name('api.upload.news-cover-image');
        Route::post('/api/upload/news-gallery-image', [ImageUploadController::class, 'uploadNewsGalleryImage'])->name('api.upload.news-gallery-image');
        Route::post('/api/upload/text-widget-image', [ImageUploadController::class, 'uploadTextWidgetImage'])->name('api.upload.text-widget-image');
        Route::delete('/api/upload/delete-image', [ImageUploadController::class, 'deleteImage'])->name('api.upload.delete-image');
        Route::get('/api/upload/image-info', [ImageUploadController::class, 'getImageInfo'])->name('api.upload.image-info');

        // Suggested schools management (super admin only)
        Route::get('/suggested-organizations', [SuggestedOrganizationController::class, 'index'])->name('suggested-organizations.index');

        // Global settings management (super admin only)
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/global-settings', [GlobalSettingsController::class, 'index'])->name('global-settings.index');
            Route::post('/global-settings/terminology', [GlobalSettingsController::class, 'updateTerminology'])->name('global-settings.terminology');
            Route::post('/global-settings/system', [GlobalSettingsController::class, 'updateSystemSettings'])->name('global-settings.system');
            Route::post('/global-settings/organization-defaults', [GlobalSettingsController::class, 'updateDefaultOrganizationSettings'])->name('global-settings.organization-defaults');
            Route::post('/global-settings/features', [GlobalSettingsController::class, 'updateFeatureFlags'])->name('global-settings.features');
            Route::post('/global-settings/system-config', [GlobalSettingsController::class, 'updateSystemConfig'])->name('global-settings.system-config');
            Route::post('/global-settings/integrations', [GlobalSettingsController::class, 'updateIntegrationSettings'])->name('global-settings.integrations');
            Route::post('/global-settings/payments', [GlobalSettingsController::class, 'updatePaymentSettings'])->name('global-settings.payments');
            Route::get('/global-settings/export', [GlobalSettingsController::class, 'export'])->name('global-settings.export');
            Route::post('/global-settings/import', [GlobalSettingsController::class, 'import'])->name('global-settings.import');
            Route::post('/global-settings/reset', [GlobalSettingsController::class, 'reset'])->name('global-settings.reset');
            Route::post('/global-settings/preview-terminology', [GlobalSettingsController::class, 'previewTerminology'])->name('global-settings.preview-terminology');
            Route::post('/global-settings/clear-cache', [GlobalSettingsController::class, 'clearCache'])->name('global-settings.clear-cache');
        });

        // Organization workspace (shared admin area)
        Route::prefix('organizations/{organization}')->name('organizations.')->middleware('organization.admin')->group(function () {
            Route::get('/users', [OrganizationAdminController::class, 'users'])->name('users');
            Route::get('/settings', [OrganizationAdminController::class, 'settings'])->name('settings');
            Route::get('/gallery', [OrganizationAdminController::class, 'gallery'])->name('gallery');
            Route::get('/payments', [OrganizationAdminController::class, 'payments'])->name('payments');
            Route::get('/analytics', [OrganizationAdminController::class, 'analytics'])->name('analytics');

            Route::prefix('console')->name('console.')->group(function () {
                Route::get('/', [OrganizationConsoleController::class, 'index'])->name('index');
                Route::get('/statistics', [OrganizationConsoleController::class, 'statistics'])->name('statistics');
                Route::get('/revenue', [OrganizationConsoleController::class, 'revenue'])->name('revenue');
                Route::get('/members', [OrganizationConsoleController::class, 'members'])->name('members');
                Route::get('/projects', [OrganizationConsoleController::class, 'projects'])->name('projects');
                Route::get('/notifications', [OrganizationConsoleController::class, 'notifications'])->name('notifications');
                Route::post('/quick-action', [OrganizationConsoleController::class, 'quickAction'])->name('quick-action');
            });

            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/', [OrganizationSettingsController::class, 'index'])->name('index');
                Route::put('/general', [OrganizationSettingsController::class, 'updateGeneral'])->name('update-general');
                Route::put('/site', [OrganizationSettingsController::class, 'updateSiteSettings'])->name('update-site');
                Route::put('/payments', [OrganizationSettingsController::class, 'updatePaymentSettings'])->name('update-payments');
                Route::put('/bank-requisites', [OrganizationSettingsController::class, 'updateBankRequisites'])->name('update-bank-requisites');
                Route::put('/notifications', [OrganizationSettingsController::class, 'updateNotificationSettings'])->name('update-notifications');
                Route::put('/integrations', [OrganizationSettingsController::class, 'updateIntegrationSettings'])->name('update-integrations');
                Route::post('/test-telegram', [OrganizationSettingsController::class, 'testTelegramBot'])->name('test-telegram');
                Route::get('/export', [OrganizationSettingsController::class, 'exportSettings'])->name('export');
                Route::post('/import', [OrganizationSettingsController::class, 'importSettings'])->name('import');
                Route::post('/reset', [OrganizationSettingsController::class, 'resetToDefaults'])->name('reset');
            });

            Route::prefix('payments')->name('payments.')->group(function () {
                Route::get('/', [OrganizationPaymentsController::class, 'index'])->name('index');
                Route::get('/transactions', [OrganizationPaymentsController::class, 'transactions'])->name('transactions');
                Route::get('/autopayments', [OrganizationPaymentsController::class, 'autopayments'])->name('autopayments');
                Route::post('/create', [OrganizationPaymentsController::class, 'createPayment'])->name('create');
                Route::post('/webhook/yookassa', [OrganizationPaymentsController::class, 'yookassaWebhook'])->name('yookassa-webhook');
                Route::post('/refund/{donation}', [OrganizationPaymentsController::class, 'refund'])->name('refund');
                Route::get('/export', [OrganizationPaymentsController::class, 'export'])->name('export');
                Route::get('/settings', [OrganizationPaymentsController::class, 'settings'])->name('settings');
                Route::put('/settings', [OrganizationPaymentsController::class, 'updateSettings'])->name('update-settings');
                Route::post('/test', [OrganizationPaymentsController::class, 'testPayment'])->name('test');
            });

            Route::prefix('telegram')->name('telegram.')->group(function () {
                Route::get('/', [OrganizationTelegramController::class, 'index'])->name('index');
                Route::post('/setup', [OrganizationTelegramController::class, 'setupBot'])->name('setup');
                Route::post('/test-message', [OrganizationTelegramController::class, 'sendTestMessage'])->name('test-message');
                Route::post('/send-donation-notification', [OrganizationTelegramController::class, 'sendDonationNotification'])->name('send-donation-notification');
                Route::get('/stats', [OrganizationTelegramController::class, 'getBotStats'])->name('stats');
                Route::post('/webhook/setup', [OrganizationTelegramController::class, 'setupWebhook'])->name('setup-webhook');
                Route::delete('/webhook', [OrganizationTelegramController::class, 'removeWebhook'])->name('remove-webhook');
                Route::post('/webhook', [OrganizationTelegramController::class, 'handleWebhook'])->name('webhook');
            });

            Route::prefix('api/widgets')->name('widgets.')->group(function () {
                Route::get('/', [WidgetController::class, 'index'])->name('index');
                Route::get('/template/{template}', [WidgetController::class, 'getForTemplate'])->name('template');
                Route::get('/site/{site}', [WidgetController::class, 'getForSite'])->name('site');
                Route::post('/site/{site}/add', [WidgetController::class, 'addToSite'])->name('add');
                Route::put('/site/{site}/widget/{widget}', [WidgetController::class, 'updateSiteWidget'])->name('update');
                Route::delete('/site/{site}/widget/{widget}', [WidgetController::class, 'removeFromSite'])->name('remove');
                Route::patch('/site/{site}/reorder', [WidgetController::class, 'reorderWidgets'])->name('reorder');
                Route::get('/config/{widget}', [WidgetController::class, 'getConfig'])->name('config');
                Route::get('/template/{template}/positions', [WidgetController::class, 'getTemplatePositions'])->name('positions');
                Route::get('/position/{position}/widgets', [WidgetController::class, 'getWidgetsForPosition'])->name('position-widgets');
            });

            Route::get('/news', [DashboardNewsController::class, 'index'])->name('news.index');
            Route::get('/news/create', [DashboardNewsController::class, 'create'])->name('news.create');
            Route::post('/news', [DashboardNewsController::class, 'store'])->name('news.store');
            Route::get('/news/{news}', [DashboardNewsController::class, 'show'])->name('news.show');
            Route::get('/news/{news}/edit', [DashboardNewsController::class, 'edit'])->name('news.edit');
            Route::put('/news/{news}', [DashboardNewsController::class, 'update'])->name('news.update');
            Route::delete('/news/{news}', [DashboardNewsController::class, 'destroy'])->name('news.destroy');

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

            Route::prefix('reports')->name('reports.')->group(function () {
                Route::get('/', [OrganizationReportsController::class, 'index'])->name('index');
                Route::get('/projects', [OrganizationReportsController::class, 'projectOptions'])->name('projects');
                Route::get('/projects/{project}/stages', [OrganizationReportsController::class, 'projectStages'])->name('projects.stages');
                Route::get('/{report}/runs', [OrganizationReportsController::class, 'runs'])->name('runs');
                Route::post('/', [OrganizationReportsController::class, 'store'])->name('store');
                Route::patch('/{report}', [OrganizationReportsController::class, 'update'])->name('update');
                Route::delete('/{report}', [OrganizationReportsController::class, 'destroy'])->name('destroy');
                Route::post('/generate', [OrganizationReportsController::class, 'generate'])->name('generate');
                Route::post('/export', [OrganizationReportsController::class, 'export'])->name('export');
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

        // Админский просмотр сайта (включая неопубликованные)
        // Должен быть после builder, но перед общим /sites/{site}
        Route::get('/sites/{id}/view', [SitePreviewController::class, 'adminView'])->name('sites.admin-view');

        // Site widgets management
        Route::post('/sites/{site}/widgets', [ApiSiteController::class, 'addWidget'])->name('sites.add-widget');
        Route::put('/sites/{site}/widgets/{widgetId}', [ApiSiteController::class, 'updateWidget'])->name('sites.update-widget');
        Route::delete('/sites/{site}/widgets/{widgetId}', [ApiSiteController::class, 'deleteWidget'])->name('sites.delete-widget');
        Route::post('/sites/{site}/widgets/{widgetId}/move', [ApiSiteController::class, 'moveWidget'])->name('sites.move-widget');
        Route::get('/sites/{site}/config', [ApiSiteController::class, 'getConfig'])->name('sites.get-config');

        // Statistics
        Route::get('/statistics', [DashboardController::class, 'statistics'])->name('statistics.index');

        // Settings
        Route::get('/settings', [DashboardController::class, 'settings'])->name('settings.index');
    });
});

Route::post('/webhook/yookassa/partner', YooKassaPartnerWebhookController::class)
    ->name('webhook.yookassa.partner');

// OAuth callback от YooKassa (публичный роут, без авторизации)
Route::get('/yook-callback-url', [YooKassaOAuthController::class, 'handleCallback'])
    ->name('yookassa.oauth.callback');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

// Site configuration routes - модульная система
Route::prefix('api/sites/{id}')->middleware('auth')->group(function () {
    // Основные настройки сайта
    Route::post('/settings/basic', [ApiSiteController::class, 'saveBasicSettings'])
        ->name('sites.save-basic-settings');
    Route::post('/settings/design', [ApiSiteController::class, 'saveDesignSettings'])
        ->name('sites.save-design-settings');
    Route::post('/settings/seo', [ApiSiteController::class, 'saveSeoSettings'])
        ->name('sites.save-seo-settings');

    // Интеграции: Telegram
    Route::post('/settings/telegram', [ApiSiteController::class, 'saveTelegramSettings'])
        ->name('sites.save-telegram-settings');

    // Платежи сайта
    Route::post('/settings/payments', [ApiSiteController::class, 'savePaymentSettings'])
        ->name('sites.save-payment-settings');

    // Банковские реквизиты сайта
    Route::post('/bank-requisites', [ApiSiteController::class, 'saveBankRequisites'])
        ->name('sites.save-bank-requisites');
    Route::post('/monthly-goal', [ApiSiteController::class, 'saveMonthlyGoal'])
        ->name('sites.save-monthly-goal');

    // Макет сайта
    Route::post('/settings/layout', [ApiSiteController::class, 'saveLayoutSettings'])
        ->name('sites.save-layout-settings');

    // Дополнительные стили сайта (пустой или свой CSS поверх виджетов)
    Route::post('/settings/custom-styles', [ApiSiteController::class, 'saveCustomStyles'])
        ->name('sites.save-custom-styles');

    // Виджеты
    Route::post('/widgets', [ApiSiteController::class, 'addWidget'])
        ->name('sites.add-widget');
    Route::put('/widgets/{widgetId}', [ApiSiteController::class, 'updateWidget'])
        ->name('sites.update-widget');
    Route::delete('/widgets/{widgetId}', [ApiSiteController::class, 'deleteWidget'])
        ->name('sites.delete-widget');
    Route::post('/widgets/{widgetId}/move', [ApiSiteController::class, 'moveWidget'])
        ->name('sites.move-widget');

    // Конфигурация
    Route::get('/config', [ApiSiteController::class, 'getConfig'])
        ->name('sites.get-config');

    // Превью
    Route::get('/preview', [ApiSiteController::class, 'preview'])
        ->name('sites.preview');
});

// Project configuration routes
Route::prefix('api/projects/{id}')->middleware('auth')->group(function () {
    // Платежные настройки проекта
    Route::post('/settings/payments', [ApiProjectController::class, 'savePaymentSettings'])
        ->name('projects.save-payment-settings');
    
    // Банковские реквизиты проекта
    Route::post('/bank-requisites', [ApiProjectController::class, 'saveBankRequisites'])
        ->name('projects.save-bank-requisites');
    Route::post('/monthly-goal', [ApiProjectController::class, 'saveMonthlyGoal'])
        ->name('projects.save-monthly-goal');
});

// Organization configuration routes
Route::prefix('api/organizations/{organization}')->middleware('auth')->group(function () {
    // Банковские реквизиты организации
    Route::post('/bank-requisites', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateBankRequisitesApi'])
        ->name('organizations.save-bank-requisites');
    Route::post('/monthly-goal', [App\Http\Controllers\Dashboard\OrganizationSettingsController::class, 'updateMonthlyGoalApi'])
        ->name('organizations.save-monthly-goal');
});

Route::get('/dashboard/api/regions/{id}', [RegionController::class, 'show']);
Route::get('/dashboard/api/localities/{id}', [CityController::class, 'show']);

// Обработка возврата после оплаты
Route::get('/payment/return', [PaymentReturnController::class, 'return'])->name('payment.return');

// Публичные страницы сайтов (должен быть последним, чтобы не конфликтовать с другими роутами)
// /{slug} — главный сайт или сайт организации (по домену)
Route::get('/{slug}', [PublicSitePageController::class, 'showHomeOrPage'])
    ->where('slug', '^(?!api|dashboard|organizations|organization|projects|project|tailwind-test|sites|login|register|password|email|verify).+')
    ->name('public.page.show');
