<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('widgets')->insertOrIgnore([
            'name' => 'Партнёры (логотипы)',
            'widget_slug' => 'partners_slider',
            'description' => 'Слайдер логотипов партнёров с названием и ссылкой',
            'icon' => '🤝',
            'category' => 'content',
            'fields_config' => json_encode([
                [
                    'key' => 'title',
                    'label' => 'Заголовок секции',
                    'type' => 'text',
                    'default' => 'Партнёры фонда',
                ],
                [
                    'key' => 'show_title',
                    'label' => 'Показывать заголовок',
                    'type' => 'boolean',
                    'default' => true,
                ],
                [
                    'key' => 'partners',
                    'label' => 'Партнёры (JSON)',
                    'type' => 'json',
                    'default' => '[]',
                ],
                [
                    'key' => 'slidesPerView',
                    'label' => 'Слайдов на экране (desktop)',
                    'type' => 'number',
                    'default' => 4,
                ],
                [
                    'key' => 'autoplay',
                    'label' => 'Автопрокрутка',
                    'type' => 'boolean',
                    'default' => true,
                ],
                [
                    'key' => 'loop',
                    'label' => 'Зациклить',
                    'type' => 'boolean',
                    'default' => true,
                ],
            ]),
            'settings_config' => json_encode([]),
            'component_name' => 'PartnersSliderWidget',
            'is_active' => true,
            'allowed_site_types' => json_encode(['organization', 'main']),
            'sort_order' => 19,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('widgets')
            ->where('widget_slug', 'partners_slider')
            ->delete();
    }
};
