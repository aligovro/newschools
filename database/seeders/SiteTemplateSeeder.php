<?php

namespace Database\Seeders;

use App\Models\SiteTemplate;
use Illuminate\Database\Seeder;

class SiteTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'name' => 'Стандартный',
                'slug' => 'default',
                'description' => 'Базовый шаблон с простым дизайном',
                'preview_image' => 'templates/default-preview.jpg',
                'layout_config' => [
                    'header' => [
                        'type' => 'fixed',
                        'background' => 'white',
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
                    'primary_color' => '#3B82F6',
                    'secondary_color' => '#6B7280',
                    'accent_color' => '#F59E0B',
                    'background_color' => '#FFFFFF',
                    'text_color' => '#1F2937',
                    'font_family' => 'Inter',
                    'font_size' => '16px',
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
                'is_premium' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Современный',
                'slug' => 'modern',
                'description' => 'Современный шаблон с градиентами и анимациями',
                'preview_image' => 'templates/modern-preview.jpg',
                'layout_config' => [
                    'header' => [
                        'type' => 'sticky',
                        'background' => 'transparent',
                        'show_logo' => true,
                        'show_navigation' => true,
                        'show_search' => true,
                    ],
                    'footer' => [
                        'type' => 'modern',
                        'show_links' => true,
                        'show_social' => true,
                        'show_contact' => true,
                        'show_newsletter' => true,
                    ],
                    'sidebar' => [
                        'enabled' => false,
                        'position' => 'right',
                    ],
                ],
                'theme_config' => [
                    'primary_color' => '#6366F1',
                    'secondary_color' => '#8B5CF6',
                    'accent_color' => '#F59E0B',
                    'background_color' => '#F8FAFC',
                    'text_color' => '#1E293B',
                    'font_family' => 'Poppins',
                    'font_size' => '16px',
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
                    'stats',
                    'features',
                    'pricing',
                ],
                'is_premium' => false,
                'sort_order' => 2,
            ],
            [
                'name' => 'Минималистичный',
                'slug' => 'minimal',
                'description' => 'Чистый и минималистичный дизайн',
                'preview_image' => 'templates/minimal-preview.jpg',
                'layout_config' => [
                    'header' => [
                        'type' => 'simple',
                        'background' => 'white',
                        'show_logo' => true,
                        'show_navigation' => true,
                        'show_search' => false,
                    ],
                    'footer' => [
                        'type' => 'minimal',
                        'show_links' => false,
                        'show_social' => false,
                        'show_contact' => true,
                    ],
                    'sidebar' => [
                        'enabled' => false,
                        'position' => 'right',
                    ],
                ],
                'theme_config' => [
                    'primary_color' => '#000000',
                    'secondary_color' => '#6B7280',
                    'accent_color' => '#000000',
                    'background_color' => '#FFFFFF',
                    'text_color' => '#000000',
                    'font_family' => 'Helvetica',
                    'font_size' => '16px',
                ],
                'available_blocks' => [
                    'hero',
                    'text',
                    'image',
                    'gallery',
                    'contact_form',
                ],
                'is_premium' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Корпоративный',
                'slug' => 'corporate',
                'description' => 'Профессиональный корпоративный дизайн',
                'preview_image' => 'templates/corporate-preview.jpg',
                'layout_config' => [
                    'header' => [
                        'type' => 'fixed',
                        'background' => 'white',
                        'show_logo' => true,
                        'show_navigation' => true,
                        'show_search' => true,
                    ],
                    'footer' => [
                        'type' => 'corporate',
                        'show_links' => true,
                        'show_social' => true,
                        'show_contact' => true,
                        'show_legal' => true,
                    ],
                    'sidebar' => [
                        'enabled' => true,
                        'position' => 'left',
                    ],
                ],
                'theme_config' => [
                    'primary_color' => '#1E40AF',
                    'secondary_color' => '#374151',
                    'accent_color' => '#059669',
                    'background_color' => '#FFFFFF',
                    'text_color' => '#111827',
                    'font_family' => 'Roboto',
                    'font_size' => '16px',
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
                    'team',
                    'services',
                    'about',
                ],
                'is_premium' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($templates as $templateData) {
            SiteTemplate::create($templateData);
        }
    }
}
