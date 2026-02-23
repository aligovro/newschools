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

// Тестовый автоплатеж по одному номеру — раз в сутки, только если задан AUTOPAYMENT_TEST_PHONE
if ((string) config('payments.recurring.autopayment_test_phone') !== '') {
    Schedule::command('donations:process-recurring-test')
        ->daily()
        ->withoutOverlapping(60);
}
