<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\SlugController;
use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\Api\WidgetImageController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Controllers\OrganizationMenuController;
use App\Http\Controllers\OrganizationMenuItemController;
use App\Http\Controllers\RegionRatingController;
use App\Http\Controllers\DonationsListController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\OrganizationCreationController;

// Получение текущего пользователя для API
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Payment Routes
|--------------------------------------------------------------------------
*/

// Платежи
Route::prefix('payments')->group(function () {
    // Создание платежа
    Route::post('/', [PaymentController::class, 'create']);

    // Получение доступных методов платежа
    Route::get('/methods', [PaymentController::class, 'methods']);

    // Получение статистики платежей
    Route::get('/statistics', [PaymentController::class, 'statistics']);

    // Получение списка транзакций
    Route::get('/transactions', [PaymentController::class, 'transactions']);

    // Получение статуса платежа
    Route::get('/status/{transactionId}', [PaymentController::class, 'status']);

    // Отмена платежа
    Route::post('/{transactionId}/cancel', [PaymentController::class, 'cancel']);

    // Возврат платежа
    Route::post('/{transactionId}/refund', [PaymentController::class, 'refund']);

    // Получение детальной информации о транзакции
    Route::get('/{transactionId}', [PaymentController::class, 'show']);
});

// Webhook'и платежных систем
Route::prefix('payments/webhook')->group(function () {
    // Webhook с привязкой к транзакции
    Route::post('/{gatewaySlug}/{transactionId}', [PaymentWebhookController::class, 'handle']);

    // Общий webhook без привязки к транзакции
    Route::post('/{gatewaySlug}', [PaymentWebhookController::class, 'handleGeneral']);

    // Логи webhook'ов для отладки
    Route::get('/{gatewaySlug}/logs', [PaymentWebhookController::class, 'logs']);

    // Тестовый endpoint для проверки webhook'ов
    Route::post('/{gatewaySlug}/test', [PaymentWebhookController::class, 'test']);
});
// Дополнительные маршруты для интеграций
Route::prefix('integrations')->group(function () {
    // SBP
    Route::prefix('sbp')->group(function () {
        Route::post('/webhook', [PaymentWebhookController::class, 'handleGeneral'])
            ->defaults('gatewaySlug', 'sbp');
    });

    // ЮKassa (Сбербанк)
    Route::prefix('yookassa')->group(function () {
        Route::post('/webhook', [PaymentWebhookController::class, 'handleGeneral'])
            ->defaults('gatewaySlug', 'yookassa');
    });

    // Тинькофф
    Route::prefix('tinkoff')->group(function () {
        Route::post('/webhook', [PaymentWebhookController::class, 'handleGeneral'])
            ->defaults('gatewaySlug', 'tinkoff');
    });
});

/*
|--------------------------------------------------------------------------
| Organization Menu Routes
|--------------------------------------------------------------------------
*/

// Маршруты для меню организаций
Route::prefix('organizations/{organization}/menus')->group(function () {
    Route::get('/', [OrganizationMenuController::class, 'index']);
    Route::post('/', [OrganizationMenuController::class, 'store']);
    Route::get('/{location}', [OrganizationMenuController::class, 'getByLocation']);
    Route::get('/menu/{menu}', [OrganizationMenuController::class, 'show']);
    Route::put('/menu/{menu}', [OrganizationMenuController::class, 'update']);
    Route::delete('/menu/{menu}', [OrganizationMenuController::class, 'destroy']);
    Route::patch('/menu/{menu}/toggle', [OrganizationMenuController::class, 'toggle']);

    // Маршруты для элементов меню
    Route::prefix('menu/{menu}/items')->group(function () {
        Route::get('/', [OrganizationMenuItemController::class, 'index']);
        Route::post('/', [OrganizationMenuItemController::class, 'store']);
        Route::get('/{item}', [OrganizationMenuItemController::class, 'show']);
        Route::put('/{item}', [OrganizationMenuItemController::class, 'update']);
        Route::delete('/{item}', [OrganizationMenuItemController::class, 'destroy']);
        Route::patch('/{item}/toggle', [OrganizationMenuItemController::class, 'toggle']);
        Route::put('/order', [OrganizationMenuItemController::class, 'updateOrder']);
    });
});

/*
|--------------------------------------------------------------------------
| Slug Generation Routes
|--------------------------------------------------------------------------
*/

// Маршруты для генерации slug'ов
Route::prefix('slug')->group(function () {
    Route::post('/generate', [SlugController::class, 'generate']);
});

/*
|--------------------------------------------------------------------------
| Widget Routes
|--------------------------------------------------------------------------
*/

// Маршруты для управления виджетами
Route::prefix('widgets')->group(function () {
    Route::get('/', [WidgetController::class, 'index']);
    Route::get('/categories', [WidgetController::class, 'categories']);
    Route::get('/positions', [WidgetController::class, 'positions']);
    Route::get('/positions/{positionId}/widgets', [WidgetController::class, 'forPosition']);
    Route::get('/template/{templateId}', [WidgetController::class, 'forTemplate']);
    Route::get('/{id}', [WidgetController::class, 'show']);
    Route::get('/{id}/config', [WidgetController::class, 'config']);
    Route::post('/{id}/preview', [WidgetController::class, 'preview']);

    // Маршруты для загрузки изображений виджетов
    Route::prefix('images')->middleware(['web', 'auth'])->group(function () {
        Route::post('/upload', [WidgetImageController::class, 'upload']);
        Route::delete('/delete', [WidgetImageController::class, 'delete']);
    });
});

/*
|--------------------------------------------------------------------------
| Site Widget Management Routes
|--------------------------------------------------------------------------
*/

// Маршруты для управления виджетами сайта
Route::prefix('dashboard/sites/{site}')->middleware(['web', 'auth', 'verified'])->group(function () {
    Route::post('/widgets', [SiteController::class, 'addWidget']);
    Route::put('/widgets/{widgetId}', [SiteController::class, 'updateWidget']);
    Route::delete('/widgets/{widgetId}', [SiteController::class, 'deleteWidget']);
    Route::post('/widgets/{widgetId}/move', [SiteController::class, 'moveWidget']);
});

// API для сохранения конфигурации сайта
Route::prefix('sites')->middleware('auth:sanctum')->group(function () {
    Route::post('/{id}/save-config', [SiteController::class, 'saveConfig']);
    Route::get('/{id}/config', [SiteController::class, 'getConfig']);
    Route::get('/{id}/preview', [SiteController::class, 'preview']);
});

/*
|--------------------------------------------------------------------------
| Form Widget Routes
|--------------------------------------------------------------------------
*/

// Маршруты для управления виджетами форм
Route::prefix('sites/{siteId}/forms')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\FormWidgetController::class, 'index']);
    Route::post('/', [App\Http\Controllers\Api\FormWidgetController::class, 'store']);
    Route::get('/{widgetId}', [App\Http\Controllers\Api\FormWidgetController::class, 'show']);
    Route::put('/{widgetId}', [App\Http\Controllers\Api\FormWidgetController::class, 'update']);
    Route::delete('/{widgetId}', [App\Http\Controllers\Api\FormWidgetController::class, 'destroy']);

    // Маршруты для экшенов
    Route::post('/{widgetId}/actions', [App\Http\Controllers\Api\FormWidgetController::class, 'createAction']);
    Route::get('/actions/available', [App\Http\Controllers\Api\FormWidgetController::class, 'getAvailableActions']);

    // Маршруты для отправок форм
    Route::prefix('{widgetId}/submissions')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\FormSubmissionController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\FormSubmissionController::class, 'submit']);
        Route::get('/{submissionId}', [App\Http\Controllers\Api\FormSubmissionController::class, 'show']);
        Route::delete('/{submissionId}', [App\Http\Controllers\Api\FormSubmissionController::class, 'destroy']);
    });
});

// Публичные маршруты для отправки форм (без аутентификации)
Route::prefix('sites/{siteId}/forms/{widgetId}')->group(function () {
    Route::post('/submit', [App\Http\Controllers\Api\FormSubmissionController::class, 'submit']);
});

/*
|--------------------------------------------------------------------------
| Donation Widget Routes
|--------------------------------------------------------------------------
*/

// Маршруты для виджета пожертвований
Route::prefix('organizations/{organization}/donation-widget')->group(function () {
    // Получение данных виджета (публичный доступ)
    Route::get('/data', [App\Http\Controllers\DonationWidgetController::class, 'getWidgetData']);

    // Получение доступных методов оплаты
    Route::get('/payment-methods', [App\Http\Controllers\DonationWidgetController::class, 'getPaymentMethods']);

    // Получение списка сборов средств
    Route::get('/fundraisers', [App\Http\Controllers\DonationWidgetController::class, 'getFundraisers']);

    // Получение списка проектов
    Route::get('/projects', [App\Http\Controllers\DonationWidgetController::class, 'getProjects']);

    // Создание пожертвования (публичный доступ)
    Route::post('/donate', [App\Http\Controllers\DonationWidgetController::class, 'createDonation']);

    // Получение статуса платежа
    Route::get('/payment-status/{transactionId}', [App\Http\Controllers\DonationWidgetController::class, 'getPaymentStatus']);
});

// Маршруты для рейтинга регионов
Route::prefix('organizations/{organization}/region-rating')->group(function () {
    // Получение рейтинга регионов (публичный доступ)
    Route::get('/', [RegionRatingController::class, 'getRegionRating']);

    // Получение статистики по регионам
    Route::get('/stats', [RegionRatingController::class, 'getRegionStats']);
});

// Маршруты для списка пожертвований
Route::prefix('organizations/{organization}/donations')->group(function () {
    // Получение списка пожертвований (публичный доступ)
    Route::get('/', [DonationsListController::class, 'getDonationsList']);

    // Получение статистики пожертвований
    Route::get('/stats', [DonationsListController::class, 'getDonationsStats']);
});

// Маршруты для реферального лидерборда
Route::prefix('organizations/{organization}/referrals')->group(function () {
    Route::get('/leaderboard', [ReferralController::class, 'leaderboard']);
});

/*
|--------------------------------------------------------------------------
| Organization Creation Routes
|--------------------------------------------------------------------------
*/

// Organization creation endpoints
Route::prefix('dashboard')->middleware(['web', 'auth', 'verified'])->group(function () {
    Route::post('/api/check-slug', [OrganizationCreationController::class, 'checkSlug']);
    Route::get('/api/regions', [OrganizationCreationController::class, 'getRegions']);
    Route::get('/api/cities-by-region', [OrganizationCreationController::class, 'getCitiesByRegion']);
    Route::get('/api/settlements-by-city', [OrganizationCreationController::class, 'getSettlementsByCity']);
    Route::get('/api/users', [OrganizationCreationController::class, 'getUsers']);
    Route::post('/api/upload-logo', [OrganizationCreationController::class, 'uploadLogo']);
    Route::post('/api/upload-images', [OrganizationCreationController::class, 'uploadImages']);

    // Роуты для изображений виджетов
    Route::post('/widgets/images/upload', [WidgetController::class, 'uploadImage']);
    Route::post('/widgets/images/delete', [WidgetController::class, 'deleteImage']);
});
