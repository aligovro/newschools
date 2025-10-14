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
                'slug' => 'menu',
                'description' => 'Универсальный виджет меню - можно добавить в любую позицию',
                'icon' => '🧭',
                'category' => 'navigation',
                'component_name' => 'MenuWidget',
                'is_active' => true,
                'sort_order' => 1,
            ],

            // ГЛАВНЫЙ БАННЕР
            [
                'name' => 'Главный баннер',
                'slug' => 'hero',
                'description' => 'Главный баннер - одиночный слайд или слайдер с несколькими слайдами',
                'icon' => '🎯',
                'category' => 'hero',
                'component_name' => 'HeroWidget',
                'is_active' => true,
                'sort_order' => 2,
            ],

            // ОСНОВНОЙ КОНТЕНТ
            [
                'name' => 'Текстовый блок',
                'slug' => 'text',
                'description' => 'Мощный текстовый редактор с поддержкой форматирования, списков, цитат, ссылок и настройками стилей',
                'icon' => '📝',
                'category' => 'content',
                'component_name' => 'TextWidget',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'name' => 'Проекты',
                'slug' => 'projects',
                'description' => 'Список проектов с прогрессом',
                'icon' => '🚀',
                'category' => 'content',
                'component_name' => 'ProjectsWidget',
                'is_active' => true,
                'sort_order' => 11,
            ],
            [
                'name' => 'Статистика',
                'slug' => 'stats',
                'description' => 'Блок со статистикой и цифрами',
                'icon' => '📊',
                'category' => 'content',
                'component_name' => 'StatsWidget',
                'is_active' => true,
                'sort_order' => 12,
            ],
            [
                'name' => 'Рейтинг регионов',
                'slug' => 'region_rating',
                'description' => 'Рейтинг регионов по пожертвованиям с поиском и фильтрацией',
                'icon' => '🗺️',
                'category' => 'content',
                'component_name' => 'RegionRatingWidget',
                'is_active' => true,
                'sort_order' => 13,
            ],
            [
                'name' => 'Список пожертвований',
                'slug' => 'donations_list',
                'description' => 'Список последних пожертвований с фильтрацией и поиском',
                'icon' => '💰',
                'category' => 'content',
                'component_name' => 'DonationsListWidget',
                'is_active' => true,
                'sort_order' => 14,
            ],

            // УНИВЕРСАЛЬНАЯ ФОРМА (конструктор форм)
            [
                'name' => 'Форма',
                'slug' => 'form',
                'description' => 'Универсальный конструктор форм - создавайте любые формы с нужными полями',
                'icon' => '📋',
                'category' => 'forms',
                'component_name' => 'FormWidget',
                'is_active' => true,
                'sort_order' => 15,
            ],

            // МЕДИА
            [
                'name' => 'Изображение',
                'slug' => 'image',
                'description' => 'Одиночное изображение с подписью',
                'icon' => '🖼️',
                'category' => 'media',
                'component_name' => 'ImageWidget',
                'is_active' => true,
                'sort_order' => 20,
            ],
            [
                'name' => 'Галерея',
                'slug' => 'gallery',
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
                'slug' => 'donation',
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
                ['slug' => $widgetData['slug']],
                $widgetData
            );
        }

        $this->command->info('✅ Создано/обновлено виджетов: ' . count($widgets));
        $this->command->info('');
        $this->command->info('Список виджетов:');
        $this->command->info('  🧭 Меню - универсальное для любой позиции');
        $this->command->info('  🎯 Главный баннер - одиночный или слайдер');
        $this->command->info('  📝 Текстовый блок');
        $this->command->info('  🚀 Проекты');
        $this->command->info('  📊 Статистика');
        $this->command->info('  🗺️ Рейтинг регионов - рейтинг по пожертвованиям');
        $this->command->info('  💰 Список пожертвований - последние поступления');
        $this->command->info('  📋 Форма - универсальный конструктор');
        $this->command->info('  🖼️ Изображение');
        $this->command->info('  🖼️ Галерея');
        $this->command->info('  💳 Виджет пожертвований');
    }
}
