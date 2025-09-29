<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentWebhookController;
use App\Http\Controllers\OrganizationMenuController;
use App\Http\Controllers\OrganizationMenuItemController;

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
