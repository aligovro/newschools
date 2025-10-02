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
use App\Http\Controllers\OrganizationCreationController;
use App\Http\Controllers\SiteConstructorController;
use App\Http\Controllers\OrganizationSiteController;

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
    Route::get('/organizations/{organization}/create-site', [OrganizationCreationController::class, 'createSite'])->name('organizations.create-site');
    Route::post('/organizations/{organization}/sites', [OrganizationCreationController::class, 'storeSite'])->name('organizations.store-site');


    // API routes for organization creation
    Route::post('/api/check-slug', [OrganizationCreationController::class, 'checkSlug'])->name('api.check-slug');
    Route::get('/api/regions', [OrganizationCreationController::class, 'getRegions'])->name('api.regions');
    Route::get('/api/cities-by-region', [OrganizationCreationController::class, 'getCitiesByRegion'])->name('api.cities-by-region');
    Route::get('/api/settlements-by-city', [OrganizationCreationController::class, 'getSettlementsByCity'])->name('api.settlements-by-city');
    Route::post('/api/upload-logo', [OrganizationCreationController::class, 'uploadLogo'])->name('api.upload-logo');
    Route::post('/api/upload-images', [OrganizationCreationController::class, 'uploadImages'])->name('api.upload-images');

    // Image upload routes
    Route::post('/api/upload/organization-logo', [App\Http\Controllers\ImageUploadController::class, 'uploadOrganizationLogo'])->name('api.upload.organization-logo');
    Route::post('/api/upload/slider-image', [App\Http\Controllers\ImageUploadController::class, 'uploadSliderImage'])->name('api.upload.slider-image');
    Route::post('/api/upload/gallery-image', [App\Http\Controllers\ImageUploadController::class, 'uploadGalleryImage'])->name('api.upload.gallery-image');
    Route::delete('/api/upload/delete-image', [App\Http\Controllers\ImageUploadController::class, 'deleteImage'])->name('api.upload.delete-image');
    Route::get('/api/upload/image-info', [App\Http\Controllers\ImageUploadController::class, 'getImageInfo'])->name('api.upload.image-info');

    // Global settings management (super admin only)
    Route::prefix('admin')->name('admin.')->group(function () {
      Route::get('/global-settings', [App\Http\Controllers\GlobalSettingsController::class, 'index'])->name('global-settings.index');
      Route::post('/global-settings/terminology', [App\Http\Controllers\GlobalSettingsController::class, 'updateTerminology'])->name('global-settings.terminology');
      Route::post('/global-settings/system', [App\Http\Controllers\GlobalSettingsController::class, 'updateSystemSettings'])->name('global-settings.system');
      Route::post('/global-settings/organization-defaults', [App\Http\Controllers\GlobalSettingsController::class, 'updateDefaultOrganizationSettings'])->name('global-settings.organization-defaults');
      Route::post('/global-settings/features', [App\Http\Controllers\GlobalSettingsController::class, 'updateFeatureFlags'])->name('global-settings.features');
      Route::post('/global-settings/system-config', [App\Http\Controllers\GlobalSettingsController::class, 'updateSystemConfig'])->name('global-settings.system-config');
      Route::get('/global-settings/export', [App\Http\Controllers\GlobalSettingsController::class, 'export'])->name('global-settings.export');
      Route::post('/global-settings/import', [App\Http\Controllers\GlobalSettingsController::class, 'import'])->name('global-settings.import');
      Route::post('/global-settings/reset', [App\Http\Controllers\GlobalSettingsController::class, 'reset'])->name('global-settings.reset');
      Route::post('/global-settings/preview-terminology', [App\Http\Controllers\GlobalSettingsController::class, 'previewTerminology'])->name('global-settings.preview-terminology');
      Route::post('/global-settings/clear-cache', [App\Http\Controllers\GlobalSettingsController::class, 'clearCache'])->name('global-settings.clear-cache');

      // Main site settings management
      Route::get('/main-site-settings', [App\Http\Controllers\MainSiteSettingsController::class, 'index'])->name('main-site-settings.index');
      Route::post('/main-site-settings/basic', [App\Http\Controllers\MainSiteSettingsController::class, 'updateBasicSettings'])->name('main-site-settings.basic');
      Route::post('/main-site-settings/seo', [App\Http\Controllers\MainSiteSettingsController::class, 'updateSeoSettings'])->name('main-site-settings.seo');
      Route::post('/main-site-settings/contact', [App\Http\Controllers\MainSiteSettingsController::class, 'updateContactSettings'])->name('main-site-settings.contact');
      Route::post('/main-site-settings/analytics', [App\Http\Controllers\MainSiteSettingsController::class, 'updateAnalyticsSettings'])->name('main-site-settings.analytics');
      Route::post('/main-site-settings/payments', [App\Http\Controllers\MainSiteSettingsController::class, 'updatePaymentSettings'])->name('main-site-settings.payments');
      Route::post('/main-site-settings/notifications', [App\Http\Controllers\MainSiteSettingsController::class, 'updateNotificationSettings'])->name('main-site-settings.notifications');
      Route::post('/main-site-settings/integrations', [App\Http\Controllers\MainSiteSettingsController::class, 'updateIntegrationSettings'])->name('main-site-settings.integrations');
      Route::post('/main-site-settings/clear-cache', [App\Http\Controllers\MainSiteSettingsController::class, 'clearCache'])->name('main-site-settings.clear-cache');
      Route::post('/main-site-settings/reset', [App\Http\Controllers\MainSiteSettingsController::class, 'reset'])->name('main-site-settings.reset');
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
        Route::get('/', [App\Http\Controllers\OrganizationConsoleController::class, 'index'])->name('index');
        Route::get('/statistics', [App\Http\Controllers\OrganizationConsoleController::class, 'statistics'])->name('statistics');
        Route::get('/revenue', [App\Http\Controllers\OrganizationConsoleController::class, 'revenue'])->name('revenue');
        Route::get('/members', [App\Http\Controllers\OrganizationConsoleController::class, 'members'])->name('members');
        Route::get('/projects', [App\Http\Controllers\OrganizationConsoleController::class, 'projects'])->name('projects');
        Route::get('/notifications', [App\Http\Controllers\OrganizationConsoleController::class, 'notifications'])->name('notifications');
        Route::post('/quick-action', [App\Http\Controllers\OrganizationConsoleController::class, 'quickAction'])->name('quick-action');
      });

      // Настройки организации
      Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrganizationSettingsController::class, 'index'])->name('index');
        Route::put('/general', [App\Http\Controllers\OrganizationSettingsController::class, 'updateGeneral'])->name('update-general');
        Route::put('/site', [App\Http\Controllers\OrganizationSettingsController::class, 'updateSiteSettings'])->name('update-site');
        Route::put('/payments', [App\Http\Controllers\OrganizationSettingsController::class, 'updatePaymentSettings'])->name('update-payments');
        Route::put('/notifications', [App\Http\Controllers\OrganizationSettingsController::class, 'updateNotificationSettings'])->name('update-notifications');
        Route::put('/integrations', [App\Http\Controllers\OrganizationSettingsController::class, 'updateIntegrationSettings'])->name('update-integrations');
        Route::post('/test-telegram', [App\Http\Controllers\OrganizationSettingsController::class, 'testTelegramBot'])->name('test-telegram');
        Route::get('/export', [App\Http\Controllers\OrganizationSettingsController::class, 'exportSettings'])->name('export');
        Route::post('/import', [App\Http\Controllers\OrganizationSettingsController::class, 'importSettings'])->name('import');
        Route::post('/reset', [App\Http\Controllers\OrganizationSettingsController::class, 'resetToDefaults'])->name('reset');
      });

      // Платежи
      Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrganizationPaymentsController::class, 'index'])->name('index');
        Route::get('/transactions', [App\Http\Controllers\OrganizationPaymentsController::class, 'transactions'])->name('transactions');
        Route::post('/create', [App\Http\Controllers\OrganizationPaymentsController::class, 'createPayment'])->name('create');
        Route::post('/webhook/yookassa', [App\Http\Controllers\OrganizationPaymentsController::class, 'yookassaWebhook'])->name('yookassa-webhook');
        Route::post('/refund/{donation}', [App\Http\Controllers\OrganizationPaymentsController::class, 'refund'])->name('refund');
        Route::get('/export', [App\Http\Controllers\OrganizationPaymentsController::class, 'export'])->name('export');
        Route::get('/settings', [App\Http\Controllers\OrganizationPaymentsController::class, 'settings'])->name('settings');
        Route::put('/settings', [App\Http\Controllers\OrganizationPaymentsController::class, 'updateSettings'])->name('update-settings');
        Route::post('/test', [App\Http\Controllers\OrganizationPaymentsController::class, 'testPayment'])->name('test');
      });

      // Редактор главной страницы
      Route::prefix('homepage')->name('homepage.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrganizationHomepageController::class, 'index'])->name('index');
        Route::put('/content', [App\Http\Controllers\OrganizationHomepageController::class, 'updateContent'])->name('update-content');
        Route::put('/components', [App\Http\Controllers\OrganizationHomepageController::class, 'updateComponents'])->name('update-components');
        Route::post('/components', [App\Http\Controllers\OrganizationHomepageController::class, 'addComponent'])->name('add-component');
        Route::delete('/components', [App\Http\Controllers\OrganizationHomepageController::class, 'removeComponent'])->name('remove-component');
        Route::patch('/components/reorder', [App\Http\Controllers\OrganizationHomepageController::class, 'reorderComponents'])->name('reorder-components');
        Route::post('/template', [App\Http\Controllers\OrganizationHomepageController::class, 'applyTemplate'])->name('apply-template');
        Route::get('/preview', [App\Http\Controllers\OrganizationHomepageController::class, 'preview'])->name('preview');
        Route::post('/publish', [App\Http\Controllers\OrganizationHomepageController::class, 'publish'])->name('publish');
        Route::post('/unpublish', [App\Http\Controllers\OrganizationHomepageController::class, 'unpublish'])->name('unpublish');
        Route::post('/upload-image', [App\Http\Controllers\OrganizationHomepageController::class, 'uploadImage'])->name('upload-image');
      });

      // Telegram бот
      Route::prefix('telegram')->name('telegram.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrganizationTelegramController::class, 'index'])->name('index');
        Route::post('/setup', [App\Http\Controllers\OrganizationTelegramController::class, 'setupBot'])->name('setup');
        Route::post('/test-message', [App\Http\Controllers\OrganizationTelegramController::class, 'sendTestMessage'])->name('test-message');
        Route::post('/send-donation-notification', [App\Http\Controllers\OrganizationTelegramController::class, 'sendDonationNotification'])->name('send-donation-notification');
        Route::get('/stats', [App\Http\Controllers\OrganizationTelegramController::class, 'getBotStats'])->name('stats');
        Route::post('/webhook/setup', [App\Http\Controllers\OrganizationTelegramController::class, 'setupWebhook'])->name('setup-webhook');
        Route::delete('/webhook', [App\Http\Controllers\OrganizationTelegramController::class, 'removeWebhook'])->name('remove-webhook');
        Route::post('/webhook', [App\Http\Controllers\OrganizationTelegramController::class, 'handleWebhook'])->name('webhook');
      });

      // Отчеты
      Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [App\Http\Controllers\OrganizationReportsController::class, 'index'])->name('index');
        Route::post('/revenue', [App\Http\Controllers\OrganizationReportsController::class, 'generateRevenueReport'])->name('revenue');
        Route::post('/members', [App\Http\Controllers\OrganizationReportsController::class, 'generateMembersReport'])->name('members');
        Route::post('/projects', [App\Http\Controllers\OrganizationReportsController::class, 'generateProjectsReport'])->name('projects');
        Route::post('/comprehensive', [App\Http\Controllers\OrganizationReportsController::class, 'generateComprehensiveReport'])->name('comprehensive');
        Route::post('/export', [App\Http\Controllers\OrganizationReportsController::class, 'exportReport'])->name('export');
      });

      // Конструктор сайтов
      Route::prefix('sites')->name('sites.')->group(function () {
        Route::get('/builder/{site}', [SiteConstructorController::class, 'builder'])->name('builder');
        Route::put('/save/{site}', [SiteConstructorController::class, 'save'])->name('save');
        Route::post('/add-widget/{site}', [SiteConstructorController::class, 'addWidget'])->name('add-widget');
        Route::put('/update-widget/{site}', [SiteConstructorController::class, 'updateWidget'])->name('update-widget');
        Route::delete('/remove-widget/{site}', [SiteConstructorController::class, 'removeWidget'])->name('remove-widget');
        Route::patch('/reorder-widgets/{site}', [SiteConstructorController::class, 'reorderWidgets'])->name('reorder-widgets');
        Route::post('/apply-color-scheme/{site}', [SiteConstructorController::class, 'applyColorScheme'])->name('apply-color-scheme');
        Route::get('/preview/{site}', [SiteConstructorController::class, 'preview'])->name('preview');
        Route::post('/publish/{site}', [SiteConstructorController::class, 'publish'])->name('publish');
        Route::post('/unpublish/{site}', [SiteConstructorController::class, 'unpublish'])->name('unpublish');
      });

      // API для виджетов
      Route::prefix('api/widgets')->name('widgets.')->group(function () {
        Route::get('/', [App\Http\Controllers\WidgetController::class, 'index'])->name('index');
        Route::get('/template/{template}', [App\Http\Controllers\WidgetController::class, 'getForTemplate'])->name('template');
        Route::get('/site/{site}', [App\Http\Controllers\WidgetController::class, 'getForSite'])->name('site');
        Route::post('/site/{site}/add', [App\Http\Controllers\WidgetController::class, 'addToSite'])->name('add');
        Route::put('/site/{site}/widget/{widget}', [App\Http\Controllers\WidgetController::class, 'updateSiteWidget'])->name('update');
        Route::delete('/site/{site}/widget/{widget}', [App\Http\Controllers\WidgetController::class, 'removeFromSite'])->name('remove');
        Route::patch('/site/{site}/reorder', [App\Http\Controllers\WidgetController::class, 'reorderWidgets'])->name('reorder');
        Route::get('/config/{widget}', [App\Http\Controllers\WidgetController::class, 'getConfig'])->name('config');
        Route::get('/template/{template}/positions', [App\Http\Controllers\WidgetController::class, 'getTemplatePositions'])->name('positions');
        Route::get('/position/{position}/widgets', [App\Http\Controllers\WidgetController::class, 'getWidgetsForPosition'])->name('position-widgets');
      });

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
      Route::get('/sites', [OrganizationSiteController::class, 'index'])->name('sites.index');
      Route::get('/sites/create', [OrganizationSiteController::class, 'create'])->name('sites.create');
      Route::post('/sites', [OrganizationSiteController::class, 'store'])->name('sites.store');
      Route::get('/sites/{site}/edit', [OrganizationSiteController::class, 'edit'])->name('sites.edit');
      Route::get('/sites/{site}/builder', [OrganizationSiteController::class, 'editWithBuilder'])->name('sites.builder');
      Route::put('/sites/{site}', [OrganizationSiteController::class, 'update'])->name('sites.update');
      Route::delete('/sites/{site}', [OrganizationSiteController::class, 'destroy'])->name('sites.destroy');
      Route::patch('/sites/{site}/publish', [OrganizationSiteController::class, 'publish'])->name('sites.publish');
      Route::patch('/sites/{site}/unpublish', [OrganizationSiteController::class, 'unpublish'])->name('sites.unpublish');
      Route::patch('/sites/{site}/archive', [OrganizationSiteController::class, 'archive'])->name('sites.archive');
      Route::patch('/sites/{site}/enable-maintenance', [OrganizationSiteController::class, 'enableMaintenanceMode'])->name('sites.enable-maintenance');
      Route::patch('/sites/{site}/disable-maintenance', [OrganizationSiteController::class, 'disableMaintenanceMode'])->name('sites.disable-maintenance');

      // Site pages management
      Route::post('/sites/{site}/pages', [OrganizationSiteController::class, 'storePage'])->name('sites.store-page');
      Route::put('/sites/{site}/pages/{page}', [OrganizationSiteController::class, 'updatePage'])->name('sites.update-page');
      Route::delete('/sites/{site}/pages/{page}', [OrganizationSiteController::class, 'destroyPage'])->name('sites.destroy-page');
      Route::patch('/sites/{site}/pages/{page}/publish', [OrganizationSiteController::class, 'publishPage'])->name('sites.publish-page');
      Route::patch('/sites/{site}/pages/{page}/unpublish', [OrganizationSiteController::class, 'unpublishPage'])->name('sites.unpublish-page');
    });

    // Sites management
    Route::get('/sites', [SiteController::class, 'index'])->name('sites.index');
    Route::get('/sites/{site}', [SiteController::class, 'show'])->name('sites.show');
    Route::post('/sites', [SiteController::class, 'store'])->name('sites.store');
    Route::put('/sites/{site}', [SiteController::class, 'update'])->name('sites.update');
    Route::patch('/sites/{site}', [SiteController::class, 'update'])->name('sites.update');
    Route::delete('/sites/{site}', [SiteController::class, 'destroy'])->name('sites.destroy');

    // Site widgets management
    Route::post('/sites/{site}/widgets', [App\Http\Controllers\Api\SiteController::class, 'addWidget'])->name('sites.add-widget');
    Route::put('/sites/{site}/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'updateWidget'])->name('sites.update-widget');
    Route::delete('/sites/{site}/widgets/{widgetId}', [App\Http\Controllers\Api\SiteController::class, 'deleteWidget'])->name('sites.delete-widget');
    Route::post('/sites/{site}/widgets/{widgetId}/move', [App\Http\Controllers\Api\SiteController::class, 'moveWidget'])->name('sites.move-widget');
    Route::get('/sites/{site}/config', [App\Http\Controllers\Api\SiteController::class, 'getConfig'])->name('sites.get-config');

    // Statistics
    Route::get('/statistics', function () {
      return Inertia::render('statistics/StatisticsPage');
    })->name('statistics.index');

    // Settings
    Route::get('/settings', function () {
      return Inertia::render('settings/SettingsPage', [
        'globalSettings' => app(\App\Services\GlobalSettingsService::class)->getSettings(),
        'mainSiteSettings' => app(\App\Services\MainSiteSettingsService::class)->getSettings(),
        'userSettings' => \Illuminate\Support\Facades\Auth::user(),
      ]);
    })->name('settings.index');
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

// Public site routes (catch-all for organization domains) - должен быть в самом конце
Route::get('/{path?}', [App\Http\Controllers\PublicSiteController::class, 'show'])
  ->where('path', '.*')
  ->name('public.site');
