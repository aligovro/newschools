<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Organization;
use App\Models\OrganizationMenu;
use App\Models\OrganizationMenuItem;

class OrganizationMenuSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $organizations = Organization::all();

    foreach ($organizations as $organization) {
      $this->createDefaultMenus($organization);
    }
  }

  private function createDefaultMenus(Organization $organization)
  {
    // Создаем главное меню в шапке
    $headerMenu = $organization->menus()->create([
      'name' => 'Главное меню',
      'location' => 'header',
      'is_active' => true,
      'description' => 'Основное навигационное меню в шапке сайта',
    ]);

    // Создаем элементы главного меню
    $this->createHeaderMenuItems($headerMenu, $organization);

    // Создаем меню в подвале
    $footerMenu = $organization->menus()->create([
      'name' => 'Меню подвала',
      'location' => 'footer',
      'is_active' => true,
      'description' => 'Дополнительные ссылки в подвале сайта',
    ]);

    // Создаем элементы меню подвала
    $this->createFooterMenuItems($footerMenu, $organization);

    // Создаем боковое меню
    $sidebarMenu = $organization->menus()->create([
      'name' => 'Боковое меню',
      'location' => 'sidebar',
      'is_active' => true,
      'description' => 'Боковое навигационное меню',
    ]);

    // Создаем элементы бокового меню
    $this->createSidebarMenuItems($sidebarMenu, $organization);

    // Создаем мобильное меню
    $mobileMenu = $organization->menus()->create([
      'name' => 'Мобильное меню',
      'location' => 'mobile',
      'is_active' => true,
      'description' => 'Мобильное навигационное меню',
    ]);

    // Создаем элементы мобильного меню
    $this->createMobileMenuItems($mobileMenu, $organization);
  }

  private function createHeaderMenuItems(OrganizationMenu $menu, Organization $organization)
  {
    $items = [
      [
        'title' => 'Главная',
        'route_name' => 'site.home',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'title' => 'О нас',
        'route_name' => 'site.about',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'title' => 'Проекты',
        'route_name' => 'site.projects',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'title' => 'Новости',
        'route_name' => 'site.news',
        'sort_order' => 4,
        'is_active' => true,
      ],
      [
        'title' => 'Контакты',
        'route_name' => 'site.contact',
        'sort_order' => 5,
        'is_active' => true,
      ],
    ];

    foreach ($items as $itemData) {
      $menu->allItems()->create($itemData);
    }
  }

  private function createFooterMenuItems(OrganizationMenu $menu, Organization $organization)
  {
    $items = [
      [
        'title' => 'Политика конфиденциальности',
        'route_name' => 'site.privacy',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'title' => 'Условия использования',
        'route_name' => 'site.terms',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'title' => 'Помощь',
        'route_name' => 'site.help',
        'sort_order' => 3,
        'is_active' => true,
      ],
    ];

    foreach ($items as $itemData) {
      $menu->allItems()->create($itemData);
    }
  }

  private function createSidebarMenuItems(OrganizationMenu $menu, Organization $organization)
  {
    $items = [
      [
        'title' => 'Главная',
        'route_name' => 'site.home',
        'icon' => 'home',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'title' => 'Проекты',
        'route_name' => 'site.projects',
        'icon' => 'folder',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'title' => 'Новости',
        'route_name' => 'site.news',
        'icon' => 'newspaper',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'title' => 'Контакты',
        'route_name' => 'site.contact',
        'icon' => 'phone',
        'sort_order' => 4,
        'is_active' => true,
      ],
    ];

    foreach ($items as $itemData) {
      $menu->allItems()->create($itemData);
    }
  }

  private function createMobileMenuItems(OrganizationMenu $menu, Organization $organization)
  {
    $items = [
      [
        'title' => 'Главная',
        'route_name' => 'site.home',
        'icon' => 'home',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'title' => 'О нас',
        'route_name' => 'site.about',
        'icon' => 'info',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'title' => 'Проекты',
        'route_name' => 'site.projects',
        'icon' => 'folder',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'title' => 'Новости',
        'route_name' => 'site.news',
        'icon' => 'newspaper',
        'sort_order' => 4,
        'is_active' => true,
      ],
      [
        'title' => 'Контакты',
        'route_name' => 'site.contact',
        'icon' => 'phone',
        'sort_order' => 5,
        'is_active' => true,
      ],
    ];

    foreach ($items as $itemData) {
      $menu->allItems()->create($itemData);
    }
  }
}
