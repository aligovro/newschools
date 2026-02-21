<?php

/**
 * Скрипт для сверки данных payments.json с данными в системе (organization 29)
 * Запуск: php verify_payments_import.php
 */

$paymentsPath = __DIR__ . '/blagoqr_import/payments.json';
if (!file_exists($paymentsPath)) {
    die("Файл payments.json не найден\n");
}

$json = json_decode(file_get_contents($paymentsPath), true);
$items = $json['items'] ?? [];
$count = count($items);
$totalSum = 0;
foreach ($items as $item) {
    $totalSum += (float) ($item['sum'] ?? 0);
}

echo "=== payments.json ===\n";
echo "Записей: $count, Сумма: " . number_format($totalSum, 2) . " руб\n\n";

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$orgId = 29;
$donationsTotal = \App\Models\Donation::where('organization_id', $orgId)->where('status', 'completed')->sum('amount');
$donationsCount = \App\Models\Donation::where('organization_id', $orgId)->where('status', 'completed')->count();

echo "=== Donations (org $orgId) ===\n";
echo "Успешных: $donationsCount, Сумма: " . number_format($donationsTotal / 100, 2) . " руб\n\n";

$logsSucceeded = \Illuminate\Support\Facades\DB::table('blagoqr_import_payment_logs')
    ->where('organization_id', $orgId)->where('status', 'succeeded')->count();
$logsSucceededSum = \Illuminate\Support\Facades\DB::table('blagoqr_import_payment_logs')
    ->where('organization_id', $orgId)->where('status', 'succeeded')->sum('payment_amount');
echo "=== payment_logs succeeded ===\n";
echo "Записей: $logsSucceeded, Сумма: " . number_format($logsSucceededSum, 2) . " руб\n\n";

$jsonIds = array_column($items, 'id');
$logsWpIds = \Illuminate\Support\Facades\DB::table('blagoqr_import_payment_logs')
    ->where('organization_id', $orgId)->pluck('wp_id')->map(fn($id) => (int)$id)->all();
$inJsonNotInLogs = count(array_diff($jsonIds, $logsWpIds));
$inLogsNotInJson = count(array_diff($logsWpIds, $jsonIds));

echo "=== Сопоставление ===\n";
echo "JSON id нет в payment_logs: $inJsonNotInLogs\n";
echo "payment_logs wp_id нет в JSON: $inLogsNotInJson\n";

$statusCounts = \Illuminate\Support\Facades\DB::table('blagoqr_import_payment_logs')
    ->where('organization_id', $orgId)->whereIn('wp_id', $jsonIds)
    ->selectRaw('status, count(*) as cnt')->groupBy('status')->pluck('cnt', 'status');
echo "Статусы для JSON id: " . json_encode($statusCounts->toArray(), JSON_UNESCAPED_UNICODE) . "\n";
