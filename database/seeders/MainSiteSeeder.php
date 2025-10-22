<?php

namespace Database\Seeders;

use App\Models\Site;
use App\Models\Domain;
use App\Models\Organization;
use App\Enums\SiteStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MainSiteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Проверяем, не существует ли уже главный сайт
        $existingMainSite = Site::where('site_type', 'main')->first();

        if ($existingMainSite) {
            $this->command->info('Главный сайт уже существует. Пропускаем создание.');
            return;
        }

        // Создаем специальную организацию для главного сайта
        $mainOrganization = Organization::firstOrCreate(
            ['slug' => 'main-site'],
            [
                'name' => 'Главный сайт',
                'slug' => 'main-site',
                'description' => 'Специальная организация для главного сайта системы',
                'type' => 'foundation',
                'status' => 'active',
                'is_public' => true,
            ]
        );

        // Создаем домен для главного сайта
        $mainDomain = Domain::create([
            'organization_id' => $mainOrganization->id,
            'domain' => 'main-' . time(), // Уникальный домен
            'custom_domain' => null,
            'subdomain' => 'main-' . time(),
            'is_primary' => true,
            'is_ssl_enabled' => true,
            'status' => 'active',
            'verified_at' => now(),
            'expires_at' => now()->addYear(),
            'ssl_config' => [
                'certificate_type' => 'letsencrypt',
                'auto_renewal' => true,
            ],
            'dns_records' => [
                'A' => [
                    'name' => '@',
                    'value' => config('app.url'),
                    'ttl' => 3600,
                ],
                'CNAME' => [
                    'name' => 'www',
                    'value' => config('app.url'),
                    'ttl' => 3600,
                ],
            ],
        ]);

        // Создаем главный сайт через DB::table для обхода трейта HasSlug
        $mainSiteId = DB::table('sites')->insertGetId([
            'organization_id' => $mainOrganization->id,
            'domain_id' => $mainDomain->id,
            'name' => 'Главный сайт',
            'slug' => 'main-site-' . time(),
            'description' => 'Главный сайт системы управления образовательными организациями',
            'template' => 'main-template-default',
            'site_type' => 'main',
            'layout_config' => json_encode([
                'header' => [
                    'type' => 'fixed',
                    'background' => 'white',
                    'show_logo' => true,
                    'show_navigation' => true,
                    'show_search' => true,
                    'show_user_menu' => true,
                ],
                'footer' => [
                    'type' => 'main',
                    'show_links' => true,
                    'show_social' => true,
                    'show_contact' => true,
                    'show_legal' => true,
                    'show_newsletter' => true,
                ],
                'sidebar' => [
                    'enabled' => false,
                    'position' => 'right',
                ],
                'breadcrumbs' => [
                    'enabled' => true,
                    'show_home' => true,
                ],
            ]),
            'theme_config' => json_encode([
                'primary_color' => '#3B82F6',
                'secondary_color' => '#6B7280',
                'accent_color' => '#F59E0B',
                'background_color' => '#FFFFFF',
                'text_color' => '#1F2937',
                'font_family' => 'Inter',
                'font_size' => '16px',
                'line_height' => '1.6',
                'border_radius' => '8px',
                'box_shadow' => '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            ]),
            'content_blocks' => json_encode([
                [
                    'type' => 'hero',
                    'title' => 'Добро пожаловать на главный сайт',
                    'subtitle' => 'Система управления образовательными организациями',
                    'description' => 'Платформа для создания и управления сайтами школ, гимназий, лицеев и других образовательных учреждений',
                    'background_image' => null,
                    'button_text' => 'Начать работу',
                    'button_url' => '/organizations',
                    'button_style' => 'primary',
                ],
                [
                    'type' => 'text',
                    'content' => '<h2>О системе</h2><p>Наша платформа предоставляет все необходимые инструменты для создания современных сайтов образовательных организаций. Вы можете легко настроить дизайн, добавить контент и управлять всеми аспектами вашего сайта.</p>',
                    'text_align' => 'left',
                    'background_color' => '#F8FAFC',
                    'text_color' => '#1F2937',
                ],
                [
                    'type' => 'projects',
                    'title' => 'Последние проекты',
                    'limit' => 6,
                    'columns' => 3,
                    'show_description' => true,
                    'show_progress' => true,
                    'show_image' => true,
                ],
                [
                    'type' => 'news',
                    'title' => 'Новости',
                    'limit' => 6,
                    'columns' => 3,
                    'show_excerpt' => true,
                    'show_date' => true,
                    'show_image' => true,
                ],
            ]),
            'navigation_config' => json_encode([
                'main_menu' => [
                    [
                        'title' => 'Главная',
                        'url' => '/',
                        'icon' => 'home',
                        'children' => [],
                    ],
                    [
                        'title' => 'Организации',
                        'url' => '/organizations',
                        'icon' => 'building',
                        'children' => [
                            [
                                'title' => 'Все организации',
                                'url' => '/organizations',
                            ],
                            [
                                'title' => 'Школы',
                                'url' => '/organizations?type=school',
                            ],
                            [
                                'title' => 'Гимназии',
                                'url' => '/organizations?type=gymnasium',
                            ],
                            [
                                'title' => 'Лицеи',
                                'url' => '/organizations?type=lyceum',
                            ],
                        ],
                    ],
                    [
                        'title' => 'Проекты',
                        'url' => '/projects',
                        'icon' => 'project',
                        'children' => [],
                    ],
                    [
                        'title' => 'Новости',
                        'url' => '/news',
                        'icon' => 'news',
                        'children' => [],
                    ],
                    [
                        'title' => 'Контакты',
                        'url' => '/contact',
                        'icon' => 'contact',
                        'children' => [],
                    ],
                ],
                'footer_menu' => [
                    [
                        'title' => 'О системе',
                        'url' => '/about',
                    ],
                    [
                        'title' => 'Помощь',
                        'url' => '/help',
                    ],
                    [
                        'title' => 'Документация',
                        'url' => '/docs',
                    ],
                    [
                        'title' => 'API',
                        'url' => '/api/docs',
                    ],
                ],
            ]),
            'seo_config' => json_encode([
                'meta_title' => 'Главный сайт - Система управления образовательными организациями',
                'meta_description' => 'Платформа для создания и управления сайтами школ, гимназий, лицеев и других образовательных учреждений. Современные инструменты для образовательных организаций.',
                'meta_keywords' => 'образование, школы, гимназии, лицеи, сайты, управление, платформа',
                'og_title' => 'Главный сайт - Система управления образовательными организациями',
                'og_description' => 'Платформа для создания и управления сайтами образовательных организаций',
                'og_image' => null,
                'canonical_url' => config('app.url'),
                'robots' => 'index,follow',
                'schema_markup' => [
                    'type' => 'WebSite',
                    'name' => 'Главный сайт',
                    'description' => 'Система управления образовательными организациями',
                    'url' => config('app.url'),
                ],
            ]),
            'custom_settings' => json_encode([
                'enable_registration' => true,
                'enable_comments' => true,
                'enable_newsletter' => true,
                'enable_social_sharing' => true,
                'enable_search' => true,
                'enable_analytics' => true,
                'enable_cookies_notice' => true,
                'maintenance_mode' => false,
                'maintenance_message' => 'Сайт временно недоступен. Ведутся технические работы.',
                'contact_email' => 'admin@example.com',
                'contact_phone' => '+7 (000) 000-00-00',
                'social_links' => [
                    'facebook' => null,
                    'twitter' => null,
                    'instagram' => null,
                    'youtube' => null,
                    'telegram' => null,
                    'vk' => null,
                ],
            ]),
            'logo' => null,
            'favicon' => null,
            'status' => SiteStatus::Published->value,
            'is_public' => true,
            'is_maintenance_mode' => false,
            'maintenance_message' => 'Сайт временно недоступен. Ведутся технические работы.',
            'published_at' => now(),
            'last_updated_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Главный сайт успешно создан!');
        $this->command->info('ID организации: ' . $mainOrganization->id);
        $this->command->info('ID сайта: ' . $mainSiteId);
        $this->command->info('ID домена: ' . $mainDomain->id);
        $this->command->info('URL: ' . config('app.url') . '/sites/main-site-' . time());
    }
}
