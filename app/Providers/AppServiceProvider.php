<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
  /**
   * Register any application services.
   */
  public function register(): void
  {
    //
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void
  {
    User::observe(UserObserver::class);

    // Поддержка PUT/PATCH запросов с FormData (для Inertia.js)
    \Illuminate\Support\Facades\Request::macro('isFormData', function () {
      return $this->header('Content-Type') === 'application/x-www-form-urlencoded' ||
        str_starts_with($this->header('Content-Type', ''), 'multipart/form-data');
    });
  }
}
