<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Обработка регулярных пожертвований - запускаем каждый час
Schedule::command('donations:process-recurring')
    ->hourly()
    ->withoutOverlapping()
    ->runInBackground();
