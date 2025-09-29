<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\OrganizationSlider;
use App\Models\OrganizationSliderSlide;
use Illuminate\Database\Seeder;

class SliderSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    // Получаем первую организацию
    $organization = Organization::first();

    if (!$organization) {
      $this->command->warn('No organizations found. Please run OrganizationSeeder first.');
      return;
    }

    // Создаем главный слайдер
    $heroSlider = $organization->sliders()->create([
      'name' => 'Главный слайдер',
      'type' => 'hero',
      'position' => 'hero',
      'settings' => [
        'autoplay' => true,
        'autoplay_delay' => 5000,
        'show_arrows' => true,
        'show_dots' => true,
        'height' => '100vh',
        'overlay_opacity' => 0.4,
        'text_position' => 'center',
        'animation' => 'fade',
      ],
      'is_active' => true,
      'sort_order' => 0,
    ]);

    // Добавляем слайды для главного слайдера
    $heroSlider->slides()->createMany([
      [
        'title' => 'Добро пожаловать на нашу платформу',
        'subtitle' => 'Поддерживай школы города',
        'description' => 'Присоединяйся к сообществу людей, которые заботятся о будущем образования. Поддерживай школы, участвуй в проектах и следи за их развитием.',
        'background_image' => 'sliders/hero-bg-1.jpg',
        'button_text' => 'Начать поддержку',
        'button_url' => '/organizations',
        'button_style' => 'primary',
        'is_active' => true,
        'sort_order' => 0,
      ],
      [
        'title' => 'Создавай проекты',
        'subtitle' => 'Реализуй свои идеи',
        'description' => 'Создавай проекты для улучшения образования, привлекай финансирование и воплощай свои идеи в жизнь вместе с единомышленниками.',
        'background_image' => 'sliders/hero-bg-2.jpg',
        'button_text' => 'Создать проект',
        'button_url' => '/projects/create',
        'button_style' => 'outline',
        'is_active' => true,
        'sort_order' => 1,
      ],
      [
        'title' => 'Отслеживай прогресс',
        'subtitle' => 'Видишь результат',
        'description' => 'Следи за тем, как твоя поддержка помогает школам развиваться. Получай отчеты о достижениях и видишь реальный результат своих действий.',
        'background_image' => 'sliders/hero-bg-3.jpg',
        'button_text' => 'Посмотреть отчеты',
        'button_url' => '/reports',
        'button_style' => 'secondary',
        'is_active' => true,
        'sort_order' => 2,
      ],
    ]);

    // Создаем контентный слайдер
    $contentSlider = $organization->sliders()->create([
      'name' => 'Популярные проекты',
      'type' => 'content',
      'position' => 'content',
      'settings' => [
        'autoplay' => false,
        'show_arrows' => true,
        'show_dots' => true,
        'items_per_view' => 3,
        'items_per_view_mobile' => 1,
        'gap' => 20,
        'animation' => 'slide',
        'infinite' => true,
      ],
      'is_active' => true,
      'sort_order' => 1,
    ]);

    // Добавляем слайды для контентного слайдера
    $contentSlider->slides()->createMany([
      [
        'title' => 'Новое оборудование для кабинета физики',
        'description' => 'Современные лабораторные приборы помогут ученикам лучше понимать физические законы и проводить интересные эксперименты.',
        'image' => 'sliders/project-1.jpg',
        'button_text' => 'Поддержать проект',
        'button_url' => '/projects/1',
        'button_style' => 'primary',
        'is_active' => true,
        'sort_order' => 0,
      ],
      [
        'title' => 'Библиотека для начальной школы',
        'description' => 'Создаем уютное пространство для чтения с современными книгами и удобными местами для занятий.',
        'image' => 'sliders/project-2.jpg',
        'button_text' => 'Поддержать проект',
        'button_url' => '/projects/2',
        'button_style' => 'primary',
        'is_active' => true,
        'sort_order' => 1,
      ],
      [
        'title' => 'Спортивная площадка',
        'description' => 'Новое покрытие и оборудование для спортивной площадки помогут детям заниматься спортом в комфортных условиях.',
        'image' => 'sliders/project-3.jpg',
        'button_text' => 'Поддержать проект',
        'button_url' => '/projects/3',
        'button_style' => 'primary',
        'is_active' => true,
        'sort_order' => 2,
      ],
    ]);

    // Создаем слайдер галереи
    $gallerySlider = $organization->sliders()->create([
      'name' => 'Галерея достижений',
      'type' => 'gallery',
      'position' => 'content',
      'settings' => [
        'autoplay' => true,
        'autoplay_delay' => 4000,
        'show_arrows' => true,
        'show_dots' => true,
        'items_per_view' => 4,
        'items_per_view_mobile' => 2,
        'gap' => 15,
        'animation' => 'slide',
        'lightbox' => true,
      ],
      'is_active' => true,
      'sort_order' => 2,
    ]);

    // Добавляем слайды для галереи
    $gallerySlider->slides()->createMany([
      [
        'title' => 'Открытие нового кабинета',
        'image' => 'sliders/gallery-1.jpg',
        'is_active' => true,
        'sort_order' => 0,
      ],
      [
        'title' => 'Ученики на уроке',
        'image' => 'sliders/gallery-2.jpg',
        'is_active' => true,
        'sort_order' => 1,
      ],
      [
        'title' => 'Спортивные соревнования',
        'image' => 'sliders/gallery-3.jpg',
        'is_active' => true,
        'sort_order' => 2,
      ],
      [
        'title' => 'Выпускной вечер',
        'image' => 'sliders/gallery-4.jpg',
        'is_active' => true,
        'sort_order' => 3,
      ],
    ]);

    $this->command->info('Sliders created successfully!');
  }
}
