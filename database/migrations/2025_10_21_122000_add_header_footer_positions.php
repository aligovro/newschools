<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();
        $positions = [
            // Header sub-positions (generic columns)
            ['name' => 'Шапка: Колонка 1', 'slug' => 'header-col-1', 'area' => 'header', 'order' => 1, 'allowed_widgets' => ['image', 'menu', 'text', 'auth_menu']],
            ['name' => 'Шапка: Колонка 2', 'slug' => 'header-col-2', 'area' => 'header', 'order' => 2, 'allowed_widgets' => ['image', 'menu', 'text', 'auth_menu']],
            ['name' => 'Шапка: Колонка 3', 'slug' => 'header-col-3', 'area' => 'header', 'order' => 3, 'allowed_widgets' => ['image', 'menu', 'text', 'auth_menu']],
            ['name' => 'Шапка: Колонка 4', 'slug' => 'header-col-4', 'area' => 'header', 'order' => 4, 'allowed_widgets' => ['image', 'menu', 'text', 'auth_menu']],
            // Full width header area
            ['name' => 'Шапка (полная ширина)', 'slug' => 'header', 'area' => 'header', 'order' => 5, 'allowed_widgets' => ['menu', 'text', 'image', 'auth_menu']],

            // Footer columns
            ['name' => 'Подвал: Колонка 1', 'slug' => 'footer-col-1', 'area' => 'footer', 'order' => 1, 'allowed_widgets' => ['menu', 'text', 'image', 'contact']],
            ['name' => 'Подвал: Колонка 2', 'slug' => 'footer-col-2', 'area' => 'footer', 'order' => 2, 'allowed_widgets' => ['menu', 'text', 'image', 'contact']],
            ['name' => 'Подвал: Колонка 3', 'slug' => 'footer-col-3', 'area' => 'footer', 'order' => 3, 'allowed_widgets' => ['menu', 'text', 'image', 'contact']],
            ['name' => 'Подвал: Колонка 4', 'slug' => 'footer-col-4', 'area' => 'footer', 'order' => 4, 'allowed_widgets' => ['menu', 'text', 'image', 'contact']],
        ];

        // Определяем шаблон по умолчанию (первый) или создаем его при отсутствии
        $defaultTemplateId = DB::table('site_templates')->value('id');
        if (!$defaultTemplateId) {
            $defaultTemplateId = DB::table('site_templates')->insertGetId([
                'name' => 'Default Template',
                'slug' => 'default',
                'description' => 'Automatically created by migration',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // Rename old header slugs if exist
        $renameMap = [
            'header-left' => 'header-col-1',
            'header-menu' => 'header',
            'header-auth' => 'header-col-3',
            'header-extra' => 'header-col-4',
        ];
        foreach ($renameMap as $old => $new) {
            if (
                DB::table('widget_positions')->where('slug', $old)->exists() &&
                !DB::table('widget_positions')->where('slug', $new)->exists()
            ) {
                DB::table('widget_positions')->where('slug', $old)->update(['slug' => $new]);
            }
        }

        foreach ($positions as $pos) {
            $exists = DB::table('widget_positions')->where('slug', $pos['slug'])->exists();
            if (!$exists) {
                DB::table('widget_positions')->insert([
                    'template_id' => $defaultTemplateId,
                    'name' => $pos['name'],
                    'slug' => $pos['slug'],
                    'description' => null,
                    'area' => $pos['area'],
                    'order' => $pos['order'],
                    'allowed_widgets' => json_encode($pos['allowed_widgets']),
                    'layout_config' => json_encode([]),
                    'is_required' => false,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        $slugs = [
            'header-left',
            'header-menu',
            'header-auth',
            'header-extra',
            'footer-col-1',
            'footer-col-2',
            'footer-col-3',
            'footer-col-4',
        ];
        DB::table('widget_positions')->whereIn('slug', $slugs)->delete();
    }
};
