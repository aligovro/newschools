<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;

class AllWidgetsSeeder extends Seeder
{
    /**
     * Создает все базовые виджеты системы
     */
    public function run(): void
    {
        $widgets = [
            // УНИВЕРСАЛЬНОЕ МЕНЮ (для любой позиции)
            [
                'name' => 'Меню',
                'widget_slug' => 'menu',
                'description' => 'Универсальный виджет меню - можно добавить в любую позицию',
                'icon' => '🧭',
                'category' => 'navigation',
                'component_name' => 'MenuWidget',
                'is_active' => true,
                'sort_order' => 1,
            ],

            // МЕНЮ АВТОРИЗАЦИИ (вход/регистрация)
            [
                'name' => 'Меню авторизации',
                'widget_slug' => 'auth_menu',
                'description' => 'Кнопки входа/регистрации с модальными окнами и поддержкой Sanctum токенов',
                'icon' => '🔐',
                'category' => 'navigation',
                'component_name' => 'AuthMenuWidget',
                'is_active' => true,
                'sort_order' => 4,
            ],

            // ГЛАВНЫЙ БАННЕР
            [
                'name' => 'Главный баннер',
                'widget_slug' => 'hero',
                'description' => 'Главный баннер - одиночный слайд или слайдер с несколькими слайдами',
                'icon' => '🎯',
                'category' => 'hero',
                'component_name' => 'HeroWidget',
                'is_active' => true,
                'sort_order' => 2,
            ],

            // УНИВЕРСАЛЬНЫЙ СЛАЙДЕР
            [
                'name' => 'Слайдер',
                'widget_slug' => 'slider',
                'description' => 'Универсальный слайдер с поддержкой различных эффектов, макетов и настроек',
                'icon' => '🎠',
                'category' => 'hero',
                'component_name' => 'SliderWidget',
                'is_active' => true,
                'sort_order' => 3,
            ],

            // ОСНОВНОЙ КОНТЕНТ
            [
                'name' => 'Текстовый блок',
                'widget_slug' => 'text',
                'description' => 'Мощный текстовый редактор с поддержкой форматирования, списков, цитат, ссылок и настройками стилей',
                'icon' => '📝',
                'category' => 'content',
                'component_name' => 'TextWidget',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'HTML блок',
                'widget_slug' => 'html',
                'description' => 'Виджет для вставки произвольного HTML кода, включая скрипты, стили, iframe и другие элементы',
                'icon' => '🌐',
                'category' => 'content',
                'component_name' => 'HtmlWidget',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Проекты',
                'widget_slug' => 'projects',
                'description' => 'Список проектов с прогрессом',
                'icon' => '🚀',
                'category' => 'content',
                'component_name' => 'ProjectsWidget',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Статистика',
                'widget_slug' => 'stats',
                'description' => 'Блок со статистикой и цифрами',
                'icon' => '📊',
                'category' => 'content',
                'component_name' => 'StatsWidget',
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'name' => 'Топ поддерживающих городов',
                'widget_slug' => 'city_supporters',
                'description' => 'Топ городов: школы, поддержавшие люди, сумма поддержки',
                'icon' => '🏙️',
                'category' => 'content',
                'component_name' => 'CitySupportersWidget',
                'is_active' => true,
                'sort_order' => 13,
            ],
            [
                'name' => 'Список пожертвований',
                'widget_slug' => 'donations_list',
                'description' => 'Список последних пожертвований с фильтрацией и поиском',
                'icon' => '💰',
                'category' => 'content',
                'component_name' => 'DonationsListWidget',
                'is_active' => true,
                'sort_order' => 14,
            ],

            // СТАТИСТИКА ВЫПУСКНИКОВ
            [
                'name' => 'Статистика выпускников',
                'widget_slug' => 'alumni_stats',
                'description' => 'Три колонки с статистикой: поддерживающие люди, сумма поддержки и реализованные проекты',
                'icon' => '🎓',
                'category' => 'content',
                'component_name' => 'AlumniStatsWidget',
                'is_active' => true,
                'sort_order' => 15,
            ],

            // РЕФЕРАЛЬНЫЙ РЕЙТИНГ
            [
                'name' => 'Рейтинг по приглашениям',
                'widget_slug' => 'referral_leaderboard',
                'description' => 'Лидерборд по приглашениям и сумме пожертвований приглашенных',
                'icon' => '👥',
                'category' => 'content',
                'component_name' => 'ReferralLeaderboardWidget',
                'is_active' => true,
                'sort_order' => 16,
            ],

            // ШКОЛЫ ГОРОДА (слайдер)
            [
                'name' => 'Школы города',
                'widget_slug' => 'city_organizations',
                'description' => 'Слайдер карточек школ выбранного города',
                'icon' => '🏫',
                'category' => 'content',
                'component_name' => 'OrganizationsSliderWidget',
                'is_active' => true,
                'sort_order' => 16,
            ],

            // УНИВЕРСАЛЬНАЯ ФОРМА (конструктор форм)
            [
                'name' => 'Форма',
                'widget_slug' => 'form',
                'description' => 'Универсальный конструктор форм - создавайте любые формы с нужными полями',
                'icon' => '📋',
                'category' => 'forms',
                'component_name' => 'FormWidget',
                'is_active' => true,
                'sort_order' => 17,
            ],

            // МЕДИА
            [
                'name' => 'Изображение',
                'widget_slug' => 'image',
                'description' => 'Одиночное изображение с подписью',
                'icon' => '🖼️',
                'category' => 'media',
                'component_name' => 'ImageWidget',
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'name' => 'Галерея',
                'widget_slug' => 'gallery',
                'description' => 'Галерея изображений с лайтбоксом',
                'icon' => '🖼️',
                'category' => 'media',
                'component_name' => 'GalleryWidget',
                'is_active' => true,
                'sort_order' => 21,
            ],

            // ПЛАТЕЖИ
            [
                'name' => 'Виджет пожертвований',
                'widget_slug' => 'donation',
                'description' => 'Прием пожертвований с поддержкой всех платежных систем и регулярных платежей',
                'icon' => '💳',
                'category' => 'payment',
                'component_name' => 'DonationWidget',
                'is_active' => true,
                'sort_order' => 30,
            ],
        ];

        foreach ($widgets as $widgetData) {
            Widget::updateOrCreate(
                ['widget_slug' => $widgetData['widget_slug']],
                $widgetData
            );
        }

        $this->command->info('✅ Создано/обновлено виджетов: ' . count($widgets));
        $this->command->info('');
        $this->command->info('Список виджетов:');
        $this->command->info('  🧭 Меню - универсальное для любой позиции');
        $this->command->info('  🔐 Меню авторизации - вход/регистрация');
        $this->command->info('  🎯 Главный баннер - одиночный или слайдер');
        $this->command->info('  🎠 Слайдер - универсальный с различными эффектами');
        $this->command->info('  📝 Текстовый блок');
        $this->command->info('  🌐 HTML блок');
        $this->command->info('  🚀 Проекты');
        $this->command->info('  📊 Статистика');
        $this->command->info('  🏙️ Топ поддерживающих городов');
        $this->command->info('  💰 Список пожертвований - последние поступления');
        $this->command->info('  🎓 Статистика выпускников - три колонки с показателями');
        $this->command->info('  👥 Рейтинг по приглашениям - лидерборд');
        $this->command->info('  📋 Форма - универсальный конструктор');
        $this->command->info('  🖼️ Изображение');
        $this->command->info('  🖼️ Галерея');
        $this->command->info('  💳 Виджет пожертвований');
    }
}
