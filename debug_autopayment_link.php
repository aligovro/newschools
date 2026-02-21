<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$wp = DB::connection('blagoqr');
$blogId = 49;
$wpPrefix = "wp_{$blogId}_";

// Сколько payment_logs имеют wp_autopayment_post_id в нашей импорт-таблице?
$ours = DB::table('blagoqr_import_payment_logs as pl')
    ->join('blagoqr_import_site_mappings as m', 'm.id', '=', 'pl.import_site_mapping_id')
    ->where('m.wp_blog_id', $blogId)
    ->selectRaw('COUNT(*) as total, SUM(CASE WHEN pl.wp_autopayment_post_id IS NOT NULL THEN 1 ELSE 0 END) as with_ap')
    ->first();
echo "blagoqr_import_payment_logs (blog 49): total={$ours->total}, with wp_autopayment_post_id={$ours->with_ap}\n";

// Сколько payment_transactions имеют saved_payment_method_id = legacy_*?
$tx = DB::table('payment_transactions')
    ->where('organization_id', 29)
    ->where('status', 'completed')
    ->whereRaw("JSON_UNQUOTE(JSON_EXTRACT(payment_details, '$.saved_payment_method_id')) LIKE 'legacy_%'")
    ->count();
echo "payment_transactions org 29 with legacy_*: $tx\n";

// avtoplatezh (без _) — значение, _avtoplatezh — ACF field key
$sampleDonator = $wp->table("{$wpPrefix}postmeta")
    ->where('meta_key', 'avtoplatezh')
    ->whereNotNull('meta_value')
    ->limit(5)
    ->get(['post_id', 'meta_key', 'meta_value']);
echo "Donators with avtoplatezh (value): " . $sampleDonator->count() . "\n";
foreach ($sampleDonator as $r) {
    echo "  post_id={$r->post_id} avtoplatezh={$r->meta_value}\n";
}

// Сколько донаторов имеют avtoplatezh?
$donatorsWithAv = $wp->table("{$wpPrefix}postmeta")->where('meta_key', 'avtoplatezh')->whereNotNull('meta_value')->count();
echo "Donators with avtoplatezh: $donatorsWithAv\n";

// Сколько payment_logs имеют post_id?
$logsWithPostId = $wp->table("{$wpPrefix}payment_logs")->whereNotNull('post_id')->where('post_id', '>', 0)->count();
$logsTotal = $wp->table("{$wpPrefix}payment_logs")->count();
echo "payment_logs with post_id: $logsWithPostId / $logsTotal\n";

// Автоплатежи — какие ключи в postmeta для связи с payment_logs?
$apMeta = $wp->table("{$wpPrefix}postmeta as pm")
    ->join("{$wpPrefix}posts as p", 'p.ID', '=', 'pm.post_id')
    ->where('p.post_type', 'autopayments')
    ->where(function ($q) {
        $q->where('pm.meta_key', 'like', '%payment%')->orWhere('pm.meta_key', 'like', '%log%');
    })
    ->select('pm.meta_key')
    ->distinct()
    ->pluck('meta_key');
echo "Autopayment meta keys (payment/log): " . $apMeta->implode(', ') . "\n";
