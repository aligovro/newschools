<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$wp = DB::connection('blagoqr');
$blogId = 49;
$wpPrefix = "wp_{$blogId}_";

// 1. Проверяем: есть ли wp_49_usermeta (blog-specific usermeta)?
$tables = $wp->select("SHOW TABLES LIKE 'wp_%usermeta%'");
$tableNames = array_map(fn($t) => array_values((array)$t)[0], $tables);
echo "Tables with usermeta: " . implode(', ', $tableNames) . "\n";

// 2. Какие meta_key с edu_year / user_type есть в wp_usermeta? (в т.ч. с префиксом wp_49_)
$allEduKeys = $wp->table('wp_usermeta')
    ->where('meta_key', 'like', '%edu%')
    ->orWhere('meta_key', 'like', '%user_type%')
    ->select('meta_key')
    ->distinct()
    ->pluck('meta_key');
echo "meta_key with edu/user_type in wp_usermeta: " . $allEduKeys->implode(', ') . "\n";

// 3. Пользователи blog 49: кто жертвовал? Берём телефоны из wp_49_payment_logs и wp_49 donators
$normalize = fn($p) => $p ? preg_replace('/\D/', '', trim($p)) : null;
$paymentLogsTable = "{$wpPrefix}payment_logs";
$phonesFromLogs = [];
try {
    $raw = $wp->table($paymentLogsTable)->whereNotNull('user_phone')->pluck('user_phone');
    $phonesFromLogs = $raw->map($normalize)->filter()->unique()->values()->toArray();
} catch (\Throwable $e) {
    echo "payment_logs: " . $e->getMessage() . "\n";
}
$donatorsMeta = $wp->table("{$wpPrefix}postmeta")
    ->whereIn('meta_key', ['tel', 'user_phone', 'phone', 'phone_number'])
    ->get();
$phonesFromDonators = $donatorsMeta->pluck('meta_value')->map($normalize)->filter()->unique()->values()->toArray();
$allPhones = array_values(array_unique(array_merge($phonesFromLogs, $phonesFromDonators)));
echo "Unique phones from blog 49 (payment_logs + donators): " . count($allPhones) . "\n";

// 4. Сколько пользователей в wp_usermeta с user_phone из этого списка И с edu_year?
// wp_usermeta.user_phone может быть в разном формате — берём всех с user_phone и фильтруем
$allUserPhones = $wp->table('wp_usermeta')
    ->where('meta_key', 'user_phone')
    ->get();
$phoneToUser = [];
foreach ($allUserPhones as $r) {
    $norm = $normalize($r->meta_value);
    if ($norm) $phoneToUser[$norm] = $r->user_id;
}
$userIdsWithPhone = collect($allPhones)->map(fn($p) => $phoneToUser[$p] ?? null)->filter()->unique()->values();
echo "Users in wp_usermeta with these phones (blog 49 donors): " . $userIdsWithPhone->count() . "\n";

$withEduYear = $wp->table('wp_usermeta')
    ->whereIn('user_id', $userIdsWithPhone)
    ->where('meta_key', 'edu_year')
    ->where('meta_value', '2003')
    ->count();
echo "Of those, with edu_year=2003 (usermeta): $withEduYear\n";

// 5. Донаторы blog 49 — есть ли edu_year в postmeta? (форма при донате могла отправить)
$donatorMetaKeys = $wp->table("{$wpPrefix}postmeta as pm")
    ->join("{$wpPrefix}posts as p", 'p.ID', '=', 'pm.post_id')
    ->where('p.post_type', 'donator')
    ->where(function ($q) {
        $q->where('pm.meta_key', 'like', '%edu%')
          ->orWhere('pm.meta_key', 'like', '%year%')
          ->orWhere('pm.meta_key', 'like', '%vipusk%')
          ->orWhere('pm.meta_key', 'like', '%type%');
    })
    ->select('pm.meta_key')
    ->distinct()
    ->pluck('meta_key');
echo "Donator postmeta keys (edu/year/vipusk/type): " . $donatorMetaKeys->implode(', ') . "\n";

$donatorsWithEdu2003 = $wp->table("{$wpPrefix}postmeta as pm")
    ->join("{$wpPrefix}posts as p", 'p.ID', '=', 'pm.post_id')
    ->where('p.post_type', 'donator')
    ->whereIn('pm.meta_key', ['edu_year', 'edu_god', 'year', 'vipusk'])
    ->where('pm.meta_value', '2003')
    ->count();
echo "Donators with edu_year/edu_god/year/vipusk=2003 in postmeta: $donatorsWithEdu2003\n";

// Все ключи postmeta у донаторов (первые 30 уникальных)
$allDonatorKeys = $wp->table("{$wpPrefix}postmeta as pm")
    ->join("{$wpPrefix}posts as p", 'p.ID', '=', 'pm.post_id')
    ->where('p.post_type', 'donator')
    ->select('pm.meta_key')
    ->distinct()
    ->limit(50)
    ->pluck('meta_key');
echo "All donator meta_key (sample): " . $allDonatorKeys->implode(', ') . "\n";

// 6. post_title донаторов — может "Выпуск 2003 г." хранится там?
$titles = $wp->table("{$wpPrefix}posts")
    ->where('post_type', 'donator')
    ->where('post_title', 'like', '%2003%')
    ->pluck('post_title');
echo "Donators with '2003' in post_title: " . $titles->count() . " — " . $titles->take(5)->implode(' | ') . "\n";

$allTitlesSample = $wp->table("{$wpPrefix}posts")
    ->where('post_type', 'donator')
    ->select('post_title')
    ->distinct()
    ->limit(20)
    ->pluck('post_title');
echo "Sample donator post_title: " . $allTitlesSample->implode(' | ') . "\n";

// 7. 7 пользователей с edu_year=2003 — сколько у них платежей в payment_logs blog 49?
$userIds2003 = $wp->table('wp_usermeta')
    ->whereIn('user_id', $userIdsWithPhone)
    ->where('meta_key', 'edu_year')
    ->where('meta_value', '2003')
    ->pluck('user_id');
$phones2003 = $wp->table('wp_usermeta')
    ->whereIn('user_id', $userIds2003)
    ->where('meta_key', 'user_phone')
    ->pluck('meta_value', 'user_id')
    ->map($normalize)
    ->toArray();
$payments2003 = $wp->table($paymentLogsTable)
    ->selectRaw('user_phone, COUNT(*) as cnt')
    ->whereIn(DB::raw("REPLACE(REPLACE(REPLACE(REPLACE(user_phone, ' ', ''), '-', ''), '+', ''), '(', '')"), 
        array_values($phones2003))
    ->groupBy('user_phone')
    ->get();
// Проще: через payment_logs.user_phone
$phones2003Normalized = array_values($phones2003);
$paymentsFor2003 = 0;
foreach ($wp->table($paymentLogsTable)->whereNotNull('user_phone')->get() as $log) {
    $norm = $normalize($log->user_phone);
    if (in_array($norm, $phones2003Normalized)) $paymentsFor2003++;
}
echo "Payments for users with edu_year=2003: $paymentsFor2003\n";
