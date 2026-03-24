<?php

namespace Database\Seeders;

use App\Models\Site;
use App\Models\SiteTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

class SiteTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // default — из site_templates.sql (prod)
        $templates = [
            [
                'name' => 'Стандартный',
                'slug' => 'default',
                'description' => 'Базовый шаблон с простым дизайном',
                'preview_image' => 'templates/default-preview.jpg',
                'layout_config' => [
                    'footer' => [
                        'type' => 'default',
                        'show_links' => true,
                        'show_social' => true,
                        'show_contact' => true,
                    ],
                    'header' => [
                        'type' => 'fixed',
                        'show_logo' => true,
                        'background' => 'white',
                        'show_search' => false,
                        'show_navigation' => true,
                    ],
                    'sidebar' => [
                        'enabled' => false,
                        'position' => 'right',
                    ],
                ],
                'theme_config' => [
                    'font_size' => '16px',
                    'text_color' => '#1F2937',
                    'font_family' => 'Inter',
                    'accent_color' => '#F59E0B',
                    'primary_color' => '#3B82F6',
                    'secondary_color' => '#6B7280',
                    'background_color' => '#FFFFFF',
                ],
                'available_blocks' => [
                    'hero',
                    'text',
                    'image',
                    'gallery',
                    'slider',
                    'testimonials',
                    'contact_form',
                    'news',
                    'projects',
                ],
                'default_positions' => null,
                'custom_settings' => null,
                'is_active' => true,
                'is_premium' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Школа',
                'slug' => 'school',
                'description' => 'Шаблон для сайтов школ (организаций)',
                'preview_image' => 'templates/school-preview.jpg',
                'layout_config' => [
                    'header' => [
                        'type' => 'fixed',
                        'background' => 'transparent',
                        'show_logo' => true,
                        'show_navigation' => true,
                        'show_search' => false,
                    ],
                    'footer' => [
                        'type' => 'default',
                        'show_links' => true,
                        'show_social' => true,
                        'show_contact' => true,
                    ],
                    'sidebar' => [
                        'enabled' => false,
                        'position' => 'right',
                    ],
                ],
                'theme_config' => [
                    'primary_color' => '#3259FF',
                    'secondary_color' => '#6B7280',
                    'accent_color' => '#96BDFF',
                    'background_color' => '#FFFFFF',
                    'text_color' => '#1A1A1A',
                    'font_family' => 'Montserrat',
                    'font_size' => '16px',
                ],
                'available_blocks' => [
                    'school_hero',
                    'school_subscribe',
                    'hero',
                    'text',
                    'image',
                    'gallery',
                    'slider',
                    'contact_form',
                    'news',
                    'projects',
                    'donation',
                    'menu',
                    'contact',
                    'form',
                    'teachers_slider',
                    'partners_slider',
                    'clubs',
                    'club_schedule',
                    'video_lessons',
                ],
                'is_premium' => false,
                'sort_order' => 2,
            ],
        ];

        foreach ($templates as $templateData) {
            SiteTemplate::updateOrCreate(
                ['slug' => $templateData['slug']],
                $templateData
            );
        }

        // Одноразовая миграция: главный сайт всегда использует шаблон из config
        $mainTemplate = config('sites.defaults.template_for_main', 'default');
        Site::where('site_type', 'main')
            ->where('template', '!=', $mainTemplate)
            ->each(function (Site $site) use ($mainTemplate) {
                $site->update(['template' => $mainTemplate]);
                Cache::forget("site_widgets_config_{$site->id}");
                Cache::forget("site_position_settings_{$site->id}");
            });
        Cache::forget("site_positions_{$mainTemplate}");
    }
}
