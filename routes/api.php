<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\Api\SlugController;
use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\Api\WidgetImageController;
use App\Http\Controllers\Api\SiteController;
use App\Http\Controllers\Api\ProjectsController;
use App\Http\Controllers\Api\AlumniStatsController;
use App\Http\Controllers\OrganizationMenuController;
use App\Http\Controllers\RegionRatingController;
use App\Http\Controllers\CitySupportersController;
use App\Http\Controllers\DonationsListController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\OrganizationCreationController;
use App\Http\Controllers\PublicOrganizationController;
use App\Services\GlobalSettingsService;
use App\Models\City;
use App\Http\Controllers\Api\AuthController;

// Получение текущего пользователя для API
Route::get('/user', [AuthController::class, 'me'])->middleware('auth:sanctum');

// Auth (Sanctum tokens)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

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
    Route::put('/positions/{positionId}/layout', [WidgetController::class, 'updatePositionLayout']);
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

    // Позиции: настройки отображения и макета для конкретного сайта
    Route::get('/positions/{positionSlug}/settings', [SiteController::class, 'getPositionSettings']);
    Route::put('/positions/{positionSlug}/settings', [SiteController::class, 'savePositionSettings']);
    Route::get('/positions/routes', [SiteController::class, 'getAvailablePublicRoutes']);
    Route::get('/positions/pages', [SiteController::class, 'getSitePages']);
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

// Публичные карты/организации API
Route::prefix('public')->group(function () {
    // Пользователь по сессии (web), для предпросмотра/мультисайта
    Route::middleware(['web'])->get('/session-user', [AuthController::class, 'me']);
    Route::middleware(['web'])->post('/session-logout', [AuthController::class, 'webLogout']);
    Route::middleware(['web'])->get('/session-logout', [AuthController::class, 'webLogout']);
    // Конфиг карт: ключи и город по умолчанию
    Route::get('/maps-config', function (GlobalSettingsService $settingsService) {
        $settings = $settingsService->getSettings();
        $integrations = $settings->integration_settings ?? [];
        $system = $settings->system_settings ?? [];
        return response()->json([
            'yandexMapApiKey' => $integrations['yandex_map_apikey'] ?? null,
            'yandexSuggestApiKey' => $integrations['yandex_suggest_apikey'] ?? null,
            'defaultCityId' => $system['default_city_id'] ?? null,
            'defaultCityFallback' => $system['default_city_fallback'] ?? 'Москва',
        ]);
    });

    // Список публичных организаций (JSON)
    Route::get('/organizations', [PublicOrganizationController::class, 'apiIndex']);

    // Последние проекты (публично)
    Route::get('/projects/latest', [ProjectsController::class, 'latest']);

    // Статистика выпускников (публичный доступ)
    Route::get('/alumni-stats', [AlumniStatsController::class, 'index']);

    // Резолвинг города по названию (после геокодинга)
    Route::get('/cities/resolve', function (Request $request) {
        $name = trim((string) $request->get('name', ''));
        if ($name === '') {
            return response()->json(['error' => 'Empty name'], 422);
        }
        $city = City::where('name', 'like', $name)
            ->orWhere('name', 'like', "%$name%")
            ->orderByRaw("CASE WHEN name = ? THEN 0 ELSE 1 END", [$name])
            ->first();
        return response()->json([
            'city' => $city ? [
                'id' => $city->id,
                'name' => $city->name,
                'region_id' => $city->region_id,
                'latitude' => $city->latitude,
                'longitude' => $city->longitude,
            ] : null,
        ]);
    });

    // Публичные API для работы с городами
    Route::get('/cities', [PublicOrganizationController::class, 'cities']);
    Route::get('/cities/detect', [PublicOrganizationController::class, 'detectCity']);

    // Публичные методы оплаты (для виджета пожертвований на главном сайте)
    Route::get('/payment-methods', [App\Http\Controllers\DonationWidgetController::class, 'getPaymentMethodsPublic']);

    // Топ поддерживающих городов (публично, для главного сайта)
    Route::get('/city-supporters', [CitySupportersController::class, 'getTopCitiesPublic']);

    // Предложение новой школы (публичный доступ)
    Route::post('/suggest-school', [App\Http\Controllers\Api\Public\SuggestedSchoolController::class, 'suggest']);
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

// Маршруты для топа поддерживающих городов
Route::prefix('organizations/{organization}/city-supporters')->group(function () {
    // Получение топа городов (публичный доступ)
    Route::get('/', [CitySupportersController::class, 'getTopCities']);
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
