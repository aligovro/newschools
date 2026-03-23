<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('widgets')->insertOrIgnore([
            'name'               => 'Скачать реквизиты',
            'widget_slug'        => 'org_requisites_download',
            'description'        => 'Кнопка скачивания реквизитов организации в PDF. Отображается только если реквизиты заполнены.',
            'icon'               => 'download',
            'category'           => 'organization',
            'fields_config'      => json_encode([
                [
                    'key'         => 'button_label',
                    'label'       => 'Текст кнопки',
                    'type'        => 'text',
                    'default'     => 'Скачать реквизиты школы',
                    'placeholder' => 'Скачать реквизиты школы',
                ],
            ]),
            'settings_config'    => json_encode([]),
            'component_name'     => 'OrgRequisitesDownload',
            'is_active'          => true,
            'allowed_site_types' => json_encode(['organization']),
            'sort_order'         => 50,
            'created_at'         => now(),
            'updated_at'         => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('widgets')
            ->where('widget_slug', 'org_requisites_download')
            ->delete();
    }
};
