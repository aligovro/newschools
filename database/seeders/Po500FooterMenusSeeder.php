<?php

namespace Database\Seeders;

use App\Models\Domain;
use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\SiteWidget;
use App\Models\Widget;
use App\Models\WidgetPosition;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

/**
 * Сидер меню футера для сайта po500.loc (BlagoQR-пресет).
 *
 * Добавляет на позиции footer-col-2, footer-col-3, footer-col-4 три меню
 * в том же формате, что и главное меню — через конструктор (виджет menu,
 * site_widget_menu_items, configs).
 *
 * Запуск: php artisan db:seed --class=Po500FooterMenusSeeder
 *
 * Можно указать домен через переменную окружения:
 *   SITE_DOMAIN=po500.loc php artisan db:seed --class=Po500FooterMenusSeeder
 */
class Po500FooterMenusSeeder extends Seeder
{
    private const DEFAULT_DOMAIN = 'po500.loc';

    /** @var array<int, array{title: string, items: array<int, array{title: string, url: string}>}> */
    private const FOOTER_MENUS = [
        2 => [
            'title' => 'Проекты',
            'items' => [
                ['title' => 'Ремонт школы', 'url' => '/projects?category=repair'],
                ['title' => 'Кружки и секции', 'url' => '/projects?category=circles'],
                ['title' => 'Спортивные', 'url' => '/projects?category=sport'],
                ['title' => 'Образование', 'url' => '/projects?category=education'],
                ['title' => 'Другие', 'url' => '/projects?category=other'],
                ['title' => 'Все проекты', 'url' => '/projects'],
            ],
        ],
        3 => [
            'title' => 'Школа',
            'items' => [
                ['title' => 'О школе', 'url' => '/about'],
                ['title' => 'Преподаватели', 'url' => '/teachers'],
                ['title' => 'Видео уроки', 'url' => '/video-lessons'],
                ['title' => 'Наши доноры', 'url' => '/donors'],
                ['title' => 'Отчеты', 'url' => '/reports'],
                ['title' => 'Контакты', 'url' => '/contacts'],
            ],
        ],
        4 => [
            'title' => 'Кружки и секции',
            'items' => [
                ['title' => 'Шахматный клуб', 'url' => '/circles/chess'],
                ['title' => 'Баскетбольная секция', 'url' => '/circles/basketball'],
                ['title' => 'Академия танца «SHADA»', 'url' => '/circles/dance'],
                ['title' => 'Школа плавания', 'url' => '/circles/swimming'],
                ['title' => 'Керамика и лепка', 'url' => '/circles/ceramics'],
                ['title' => 'Все кружки и секции', 'url' => '/circles'],
            ],
        ],
    ];

    public function run(): void
    {
        $domainName = env('SITE_DOMAIN', self::DEFAULT_DOMAIN);
        $site = $this->resolveSite($domainName);

        if (!$site) {
            $this->command->error("Сайт для домена «{$domainName}» не найден.");
            $this->command->info('Проверьте домен в таблицах domains/sites или задайте SITE_DOMAIN.');
            return;
        }

        $template = SiteTemplate::where('slug', $site->template)->first();
        if (!$template) {
            $this->command->error("Шаблон «{$site->template}» не найден.");
            return;
        }

        $menuWidget = Widget::where('widget_slug', 'menu')->first();
        if (!$menuWidget) {
            $this->command->error('Виджет «menu» не найден. Выполните AllWidgetsSeeder.');
            return;
        }

        $this->ensureFooterColPositions($template);

        foreach (self::FOOTER_MENUS as $colIndex => $menuData) {
            $positionSlug = "footer-col-{$colIndex}";
            $position = WidgetPosition::where('template_id', $template->id)
                ->where('slug', $positionSlug)
                ->first();

            if (!$position) {
                $this->command->warn("Позиция «{$positionSlug}» отсутствует, пропускаем.");
                continue;
            }

            $existing = SiteWidget::where('site_id', $site->id)
                ->where('position_id', $position->id)
                ->where('widget_slug', 'menu')
                ->first();

            if ($existing) {
                $this->command->info("Меню «{$menuData['title']}» уже есть в {$positionSlug}, обновляем.");
                $siteWidget = $existing;
            } else {
                $siteWidget = SiteWidget::create([
                    'site_id' => $site->id,
                    'widget_id' => $menuWidget->id,
                    'position_id' => $position->id,
                    'name' => "Футер — {$menuData['title']}",
                    'position_name' => $position->name,
                    'position_slug' => $position->slug,
                    'widget_slug' => 'menu',
                    'sort_order' => 1,
                    'is_active' => true,
                    'is_visible' => true,
                ]);
                $this->command->info("Создано меню «{$menuData['title']}» в {$positionSlug}.");
            }

            $items = [];
            foreach ($menuData['items'] as $i => $item) {
                $items[] = [
                    'id' => "footer-{$colIndex}-" . ($i + 1),
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'type' => 'internal',
                    'newTab' => false,
                    'order' => $i + 1,
                ];
            }

            $config = [
                'title' => $menuData['title'],
                'show_title' => true,
                'orientation' => 'column',
                'items' => $items,
            ];

            $siteWidget->syncConfig($config);
        }

        Cache::forget("site_widgets_config_{$site->id}");
        $this->command->info('Готово.');
    }

    private function resolveSite(string $domainName): ?Site
    {
        $domain = Domain::where('domain', $domainName)
            ->orWhere('custom_domain', $domainName)
            ->first();

        if (!$domain) {
            $site = Site::where('slug', str_replace('.', '-', $domainName))->first();
            return $site ?? Site::where('slug', 'po500')->first();
        }

        return $domain->sites()->first();
    }

    private function ensureFooterColPositions(SiteTemplate $template): void
    {
        $footerCols = [
            ['slug' => 'footer-col-2', 'name' => 'Колонка футера 2', 'sort_order' => 52],
            ['slug' => 'footer-col-3', 'name' => 'Колонка футера 3', 'sort_order' => 53],
            ['slug' => 'footer-col-4', 'name' => 'Колонка футера 4', 'sort_order' => 54],
        ];

        foreach ($footerCols as $col) {
            WidgetPosition::updateOrCreate(
                [
                    'template_id' => $template->id,
                    'slug' => $col['slug'],
                ],
                [
                    'name' => $col['name'],
                    'description' => 'Колонка подвала сайта',
                    'area' => 'footer',
                    'sort_order' => $col['sort_order'],
                    'allowed_widgets' => [],
                    'layout_config' => [
                        'width' => 'full',
                        'alignment' => 'left',
                        'padding' => '0',
                        'margin' => '0',
                    ],
                    'is_required' => false,
                    'is_active' => true,
                ]
            );
        }

        Cache::forget("site_positions_{$template->slug}");
    }
}
