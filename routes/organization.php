<?php

use App\Http\Controllers\OrganizationPageController;
use Illuminate\Support\Facades\Route;

// Маршруты для управления страницами организации
Route::middleware(['auth', 'verified'])->group(function () {
  Route::prefix('organization/{organization}')->name('organization.')->group(function () {
    // Страницы
    Route::resource('pages', OrganizationPageController::class);

    // Дополнительные маршруты для страниц
    Route::post('pages/{page}/duplicate', [OrganizationPageController::class, 'duplicate'])
      ->name('pages.duplicate');
    Route::post('pages/{page}/update-status', [OrganizationPageController::class, 'updateStatus'])
      ->name('pages.update-status');

    // API маршруты для страниц
    Route::get('api/pages', [OrganizationPageController::class, 'apiPages'])
      ->name('api.pages');
  });
});
