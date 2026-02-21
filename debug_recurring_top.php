<?php
/**
 * Диагностика «Топ регулярно-поддерживающих».
 * Запуск: php debug_recurring_top.php
 */
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$orgId = 29;

echo "=== Диагностика recurring для org_id=$orgId ===\n\n";

// 1. blagoqr_import_payment_logs — сколько с wp_autopayment_post_id?
$logsWithAp = DB::table('blagoqr_import_payment_logs')->where('organization_id', $orgId)->whereNotNull('wp_autopayment_post_id')->count();
$logsTotal = DB::table('blagoqr_import_payment_logs')->where('organization_id', $orgId)->count();
echo "1. blagoqr_import_payment_logs: $logsWithAp / $logsTotal с wp_autopayment_post_id\n";

// 2. payment_transactions — сколько с is_recurring или recurring_period?
$txRecurring = DB::table('payment_transactions')
    ->where('organization_id', $orgId)
    ->where('status', 'completed')
    ->where(function ($q) {
        $q->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
            ->orWhereRaw("JSON_EXTRACT(payment_details, '$.recurring_period') IS NOT NULL");
    })
    ->count();
$txTotal = DB::table('payment_transactions')->where('organization_id', $orgId)->where('status', 'completed')->count();
echo "2. payment_transactions (completed): $txRecurring / $txTotal с is_recurring/recurring_period\n";

// 3. Пример payment_details у recurring
$sample = DB::table('payment_transactions')
    ->where('organization_id', $orgId)
    ->where('status', 'completed')
    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.is_recurring')) = 'true'")
    ->first();
if ($sample) {
    echo "3. Пример payment_details (recurring): " . json_encode(json_decode($sample->payment_details ?? '{}'), JSON_UNESCAPED_UNICODE) . "\n";
} else {
    $anyTx = DB::table('payment_transactions')->where('organization_id', $orgId)->where('status', 'completed')->first();
    echo "3. Нет recurring tx. Пример payment_details (любой): " . substr($anyTx->payment_details ?? '{}', 0, 200) . "\n";
}

// 4. Автоплатежи — есть ли pay_period?
$aps = DB::table('blagoqr_import_autopayments')->where('organization_id', $orgId)->limit(3)->get();
echo "\n4. Пример автоплатежей (postmeta keys):\n";
foreach ($aps as $ap) {
    $meta = json_decode($ap->postmeta ?? '{}', true);
    $period = $meta['pay_period'] ?? $meta['recurring_period'] ?? $meta['period'] ?? '—';
    $status = $ap->post_status ?? '—';
    echo "   wp_post_id={$ap->wp_post_id} status=$status pay_period=$period\n";
}

// 5. organization_top_recurring_snapshots
$snapCount = DB::table('organization_top_recurring_snapshots')->where('organization_id', $orgId)->count();
echo "\n5. organization_top_recurring_snapshots: $snapCount записей\n";
