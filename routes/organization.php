<?php

use App\Http\Controllers\SitePageController;
use Illuminate\Support\Facades\Route;

// Маршруты для управления страницами организации
Route::middleware(['auth', 'verified'])->group(function () {
  Route::prefix('organization/{organization}')->name('organization.')->group(function () {
    // Страницы
    Route::resource('pages', SitePageController::class);

    // Дополнительные маршруты для страниц
    Route::post('pages/{page}/duplicate', [SitePageController::class, 'duplicate'])
      ->name('pages.duplicate');
    Route::post('pages/{page}/update-status', [SitePageController::class, 'updateStatus'])
      ->name('pages.update-status');

    // API маршруты для страниц
    Route::get('api/pages', [SitePageController::class, 'apiPages'])
      ->name('api.pages');
  });
});
