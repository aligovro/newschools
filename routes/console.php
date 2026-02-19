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
    ->withoutOverlapping(config('payments.recurring.cron_lock_minutes', 65))
    ->runInBackground();
