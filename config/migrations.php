<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Prune: obsolete tables
    |--------------------------------------------------------------------------
    | Таблицы, созданные удалёнными/объединёнными миграциями. Команда
    | migrate:prune может удалить их, если они есть в БД. Добавлять сюда
    | только после того, как миграция, создающая таблицу, удалена/заменена.
    */
    'prune' => [
        'tables_to_drop' => [
            // organization_blagoqr_* — старые имена до rename в organization_*
            'organization_blagoqr_donor_categories',
            'organization_blagoqr_top_one_time_snapshots',
            'organization_blagoqr_top_recurring_snapshots',
            'organization_legacy_autopayments',
        ],
    ],

];
