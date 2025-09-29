<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationSetting;
use App\Models\OrganizationSeo;
use App\Models\OrganizationMedia;
use App\Models\OrganizationSlider;
use App\Models\OrganizationPage;
use App\Models\OrganizationMenu;
use App\Models\OrganizationSite;
use App\Models\User;
use App\Events\OrganizationCreated;
use App\Services\GlobalSettingsService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;

class OrganizationCreationService
{
  protected GlobalSettingsService $globalSettings;

  public function __construct(GlobalSettingsService $globalSettings)
  {
    $this->globalSettings = $globalSettings;
  }

  /**
   * Создать организацию с полным набором настроек
   */
  public function createOrganization(array $data, ?User $adminUser = null): Organization
  {
    return DB::transaction(function () use ($data, $adminUser) {
      // Создаем основную организацию
      $organization = $this->createMainOrganization($data);

      // Создаем настройки организации
      $this->createOrganizationSettings($organization);

      // Создаем SEO настройки
      $this->createOrganizationSeo($organization);

      // Создаем галлерею по умолчанию
      $this->createDefaultGallery($organization);

      // Создаем слайдер по умолчанию
      $this->createDefaultSlider($organization);

      // Создаем главную страницу
      $this->createHomepage($organization);

      // Создаем базовое меню
      $this->createDefaultMenu($organization);

      // Добавляем администратора если указан
      if ($adminUser) {
        $this->assignAdminToOrganization($organization, $adminUser);
      }

      // Отправляем задачу в очередь для дополнительной настройки
      Queue::push(new \App\Jobs\SetupOrganizationDefaults($organization));

      // Отправляем событие о создании организации
      Event::dispatch(new OrganizationCreated($organization));

      return $organization->load(['settings', 'seo', 'media', 'sliders', 'homepage', 'menus']);
    });
  }

  /**
   * Создать основную организацию
   */
  private function createMainOrganization(array $data): Organization
  {
    // Генерируем slug если не указан
    if (empty($data['slug'])) {
      $data['slug'] = $this->generateUniqueSlug($data['name']);
    }

    // Устанавливаем значения по умолчанию
    $data['status'] = $data['status'] ?? 'pending';
    $data['is_public'] = $data['is_public'] ?? true;
    $data['type'] = $data['type'] ?? 'school';

    return Organization::create($data);
  }

  /**
   * Создать настройки организации
   */
  private function createOrganizationSettings(Organization $organization): void
  {
    // Получаем настройки по умолчанию из глобальных настроек
    $defaultSettings = $this->globalSettings->getDefaultOrganizationSettings();

    $organization->settings()->create([
      'theme' => $defaultSettings['organization']['theme'] ?? 'default',
      'primary_color' => $defaultSettings['organization']['primary_color'] ?? '#3B82F6',
      'secondary_color' => $defaultSettings['organization']['secondary_color'] ?? '#6B7280',
      'accent_color' => $defaultSettings['organization']['accent_color'] ?? '#10B981',
      'font_family' => $defaultSettings['organization']['font_family'] ?? 'Inter',
      'dark_mode' => $defaultSettings['organization']['dark_mode'] ?? false,
      'maintenance_mode' => false,
      'payment_settings' => $defaultSettings['payment'] ?? [
        'enabled_methods' => ['yookassa', 'tinkoff'],
        'min_amount' => 100,
        'max_amount' => 100000000,
        'currency' => 'RUB',
        'auto_approve' => true,
      ],
      'notification_settings' => $defaultSettings['notification'] ?? [
        'email_notifications' => true,
        'telegram_notifications' => false,
        'donation_notifications' => true,
        'member_registration_notifications' => true,
      ],
      'integration_settings' => [
        'yookassa_test_mode' => true,
        'telegram_bot_token' => null,
        'telegram_chat_id' => null,
      ],
    ]);
  }

  /**
   * Создать SEO настройки
   */
  private function createOrganizationSeo(Organization $organization): void
  {
    $organization->seo()->create([
      'meta_title' => $organization->name,
      'meta_description' => $organization->description ?? "Официальный сайт {$organization->name}",
      'meta_keywords' => $this->generateKeywords($organization),
      'og_title' => $organization->name,
      'og_description' => $organization->description ?? "Официальный сайт {$organization->name}",
      'og_image' => $organization->logo,
    ]);
  }

  /**
   * Создать галлерею по умолчанию
   */
  private function createDefaultGallery(Organization $organization): void
  {
    // Создаем папку для медиа организации
    $mediaPath = "organizations/{$organization->id}/gallery";
    Storage::makeDirectory($mediaPath);

    // Создаем несколько медиа записей по умолчанию
    $defaultImages = [
      [
        'title' => 'Главное фото',
        'description' => 'Основное изображение организации',
        'type' => 'image',
        'path' => null,
        'is_featured' => true,
        'sort_order' => 1,
      ],
      [
        'title' => 'Дополнительное фото 1',
        'description' => 'Дополнительное изображение',
        'type' => 'image',
        'path' => null,
        'is_featured' => false,
        'sort_order' => 2,
      ],
      [
        'title' => 'Дополнительное фото 2',
        'description' => 'Дополнительное изображение',
        'type' => 'image',
        'path' => null,
        'is_featured' => false,
        'sort_order' => 3,
      ],
    ];

    foreach ($defaultImages as $imageData) {
      $organization->media()->create($imageData);
    }
  }

  /**
   * Создать слайдер по умолчанию
   */
  private function createDefaultSlider(Organization $organization): void
  {
    $slider = $organization->sliders()->create([
      'title' => 'Главный слайдер',
      'description' => 'Основной слайдер на главной странице',
      'position' => 'hero',
      'is_active' => true,
      'autoplay' => true,
      'autoplay_delay' => 5000,
      'show_navigation' => true,
      'show_pagination' => true,
      'sort_order' => 1,
    ]);

    // Создаем слайды по умолчанию
    $defaultSlides = [
      [
        'title' => 'Добро пожаловать',
        'subtitle' => "Добро пожаловать в {$organization->name}",
        'description' => $organization->description ?? 'Мы рады приветствовать вас на нашем сайте',
        'image_url' => null,
        'button_text' => 'Узнать больше',
        'button_url' => '#about',
        'is_active' => true,
        'sort_order' => 1,
      ],
      [
        'title' => 'Наши проекты',
        'subtitle' => 'Поддержите наши инициативы',
        'description' => 'Помогите нам реализовать важные проекты для развития',
        'image_url' => null,
        'button_text' => 'Поддержать',
        'button_url' => '#projects',
        'is_active' => true,
        'sort_order' => 2,
      ],
    ];

    foreach ($defaultSlides as $slideData) {
      $slider->slides()->create($slideData);
    }
  }

  /**
   * Создать главную страницу
   */
  private function createHomepage(Organization $organization): void
  {
    $homepage = $organization->pages()->create([
      'title' => 'Главная страница',
      'slug' => 'home',
      'content' => $this->getDefaultHomepageContent($organization),
      'is_homepage' => true,
      'is_published' => true,
      'sort_order' => 1,
    ]);

    // Создаем SEO для главной страницы
    $homepage->seo()->create([
      'meta_title' => $organization->name,
      'meta_description' => $organization->description ?? "Официальный сайт {$organization->name}",
      'meta_keywords' => $this->generateKeywords($organization),
    ]);
  }

  /**
   * Создать базовое меню
   */
  private function createDefaultMenu(Organization $organization): void
  {
    $mainMenu = $organization->menus()->create([
      'title' => 'Главное меню',
      'location' => 'header',
      'is_active' => true,
      'sort_order' => 1,
    ]);

    // Создаем пункты меню по умолчанию
    $defaultMenuItems = [
      [
        'title' => 'Главная',
        'url' => '/',
        'type' => 'internal',
        'sort_order' => 1,
        'is_active' => true,
      ],
      [
        'title' => 'О нас',
        'url' => '/about',
        'type' => 'internal',
        'sort_order' => 2,
        'is_active' => true,
      ],
      [
        'title' => 'Проекты',
        'url' => '/projects',
        'type' => 'internal',
        'sort_order' => 3,
        'is_active' => true,
      ],
      [
        'title' => 'Новости',
        'url' => '/news',
        'type' => 'internal',
        'sort_order' => 4,
        'is_active' => true,
      ],
      [
        'title' => 'Контакты',
        'url' => '/contacts',
        'type' => 'internal',
        'sort_order' => 5,
        'is_active' => true,
      ],
    ];

    foreach ($defaultMenuItems as $itemData) {
      $mainMenu->items()->create($itemData);
    }
  }

  /**
   * Назначить администратора организации
   */
  private function assignAdminToOrganization(Organization $organization, User $adminUser): void
  {
    $organization->users()->attach($adminUser->id, [
      'role' => 'admin',
      'status' => 'active',
      'permissions' => ['all'],
      'joined_at' => now(),
      'last_active_at' => now(),
    ]);
  }

  /**
   * Создать сайт для организации
   */
  public function createOrganizationSite(Organization $organization, array $siteData): OrganizationSite
  {
    return DB::transaction(function () use ($organization, $siteData) {
      // Получаем или создаем домен для организации
      $domain = $this->getOrCreateDomain($organization, $siteData);

      // Создаем основной сайт
      $site = $organization->sites()->create([
        'domain_id' => $domain->id,
        'name' => $siteData['name'] ?? $organization->name,
        'slug' => $siteData['slug'] ?? $organization->slug,
        'description' => $siteData['description'] ?? $organization->description,
        'template' => $siteData['template'] ?? 'default',
        'layout_config' => $this->getDefaultLayoutConfig(),
        'theme_config' => $this->getDefaultThemeConfig(),
        'content_blocks' => [],
        'navigation_config' => $this->getDefaultNavigationConfig(),
        'seo_config' => $this->getDefaultSeoConfig($organization),
        'status' => 'draft',
        'is_public' => false,
        'is_maintenance_mode' => false,
      ]);

      // Дублируем галлерею для сайта
      $this->duplicateGalleryForSite($organization, $site);

      // Дублируем слайдеры для сайта
      $this->duplicateSlidersForSite($organization, $site);

      // Создаем автоматические страницы
      $this->createAutoPagesForSite($organization, $site);

      return $site->load(['pages']);
    });
  }

  /**
   * Дублировать галлерею для сайта
   */
  private function duplicateGalleryForSite(Organization $organization, OrganizationSite $site): void
  {
    $organizationMedia = $organization->media;

    foreach ($organizationMedia as $media) {
      $site->media()->create([
        'title' => $media->title,
        'description' => $media->description,
        'type' => $media->type,
        'path' => $media->path,
        'is_featured' => $media->is_featured,
        'sort_order' => $media->sort_order,
      ]);
    }
  }

  /**
   * Дублировать слайдеры для сайта
   */
  private function duplicateSlidersForSite(Organization $organization, OrganizationSite $site): void
  {
    $organizationSliders = $organization->sliders;

    foreach ($organizationSliders as $slider) {
      $siteSlider = $site->sliders()->create([
        'title' => $slider->title,
        'description' => $slider->description,
        'position' => $slider->position,
        'is_active' => $slider->is_active,
        'autoplay' => $slider->autoplay,
        'autoplay_delay' => $slider->autoplay_delay,
        'show_navigation' => $slider->show_navigation,
        'show_pagination' => $slider->show_pagination,
        'sort_order' => $slider->sort_order,
      ]);

      // Дублируем слайды
      foreach ($slider->slides as $slide) {
        $siteSlider->slides()->create([
          'title' => $slide->title,
          'subtitle' => $slide->subtitle,
          'description' => $slide->description,
          'image_url' => $slide->image_url,
          'button_text' => $slide->button_text,
          'button_url' => $slide->button_url,
          'is_active' => $slide->is_active,
          'sort_order' => $slide->sort_order,
        ]);
      }
    }
  }

  /**
   * Создать автоматические страницы для сайта
   */
  private function createAutoPagesForSite(Organization $organization, OrganizationSite $site): void
  {
    $autoPages = [
      [
        'title' => 'Спасибо',
        'slug' => 'thanks',
        'content' => $this->getThanksPageContent(),
        'status' => 'published',
        'template' => 'default',
        'is_homepage' => false,
        'published_at' => now(),
      ],
      [
        'title' => 'Контакты',
        'slug' => 'contacts',
        'content' => $this->getContactsPageContent($organization),
        'status' => 'published',
        'template' => 'contact',
        'is_homepage' => false,
        'published_at' => now(),
      ],
      [
        'title' => 'О нас',
        'slug' => 'about',
        'content' => $this->getAboutPageContent($organization),
        'status' => 'published',
        'template' => 'about',
        'is_homepage' => false,
        'published_at' => now(),
      ],
      [
        'title' => 'Проекты',
        'slug' => 'projects',
        'content' => $this->getProjectsPageContent(),
        'status' => 'published',
        'template' => 'default',
        'is_homepage' => false,
        'published_at' => now(),
      ],
    ];

    foreach ($autoPages as $pageData) {
      $site->pages()->create($pageData);
    }
  }


  /**
   * Генерировать уникальный slug
   */
  private function generateUniqueSlug(string $name): string
  {
    $baseSlug = Str::slug($name);
    $slug = $baseSlug;
    $counter = 1;

    while (Organization::where('slug', $slug)->exists()) {
      $slug = $baseSlug . '-' . $counter;
      $counter++;
    }

    return $slug;
  }

  /**
   * Генерировать ключевые слова
   */
  private function generateKeywords(Organization $organization): string
  {
    $keywords = [$organization->name];

    if ($organization->description) {
      $keywords[] = $organization->description;
    }

    if ($organization->city_name) {
      $keywords[] = $organization->city_name;
    }

    $keywords[] = 'благотворительность';
    $keywords[] = 'пожертвования';
    $keywords[] = 'помощь';

    return implode(', ', array_unique($keywords));
  }

  /**
   * Получить контент главной страницы по умолчанию
   */
  private function getDefaultHomepageContent(Organization $organization): string
  {
    return '<div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold text-center mb-8">Добро пожаловать в ' . $organization->name . '</h1>
            <p class="text-lg text-center text-gray-600 mb-8">
                ' . ($organization->description ?? 'Мы рады приветствовать вас на нашем сайте. Здесь вы можете узнать о нашей работе, поддержать наши проекты и стать частью нашего сообщества.') . '
            </p>
            <div class="grid md:grid-cols-3 gap-6 mt-12">
                <div class="text-center">
                    <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Наше сообщество</h3>
                    <p class="text-gray-600">Присоединяйтесь к нашему дружному сообществу единомышленников</p>
                </div>
                <div class="text-center">
                    <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Наши проекты</h3>
                    <p class="text-gray-600">Поддерживайте наши инициативы и проекты для развития сообщества</p>
                </div>
                <div class="text-center">
                    <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Ваша поддержка</h3>
                    <p class="text-gray-600">Каждое пожертвование помогает нам делать мир лучше</p>
                </div>
            </div>
        </div>';
  }

  /**
   * Получить или создать домен для организации
   */
  private function getOrCreateDomain(Organization $organization, array $siteData): \App\Models\OrganizationDomain
  {
    $domainData = $siteData['domain'] ?? null;

    if ($domainData) {
      return $organization->domains()->firstOrCreate([
        'domain' => $domainData,
      ], [
        'is_primary' => true,
        'is_active' => true,
        'is_ssl_enabled' => true,
      ]);
    }

    // Создаем домен по умолчанию
    return $organization->domains()->firstOrCreate([
      'domain' => $organization->slug . '.' . config('app.domain', 'localhost'),
    ], [
      'is_primary' => true,
      'is_active' => true,
      'is_ssl_enabled' => false,
    ]);
  }

  /**
   * Получить конфигурацию макета по умолчанию
   */
  private function getDefaultLayoutConfig(): array
  {
    return [
      'header' => [
        'show_logo' => true,
        'show_menu' => true,
        'show_search' => false,
      ],
      'footer' => [
        'show_links' => true,
        'show_social' => true,
        'show_copyright' => true,
      ],
      'sidebar' => [
        'enabled' => false,
        'position' => 'left',
      ],
      'widgets' => [],
    ];
  }

  /**
   * Получить конфигурацию темы по умолчанию
   */
  private function getDefaultThemeConfig(): array
  {
    return [
      'primary_color' => '#3B82F6',
      'secondary_color' => '#6B7280',
      'accent_color' => '#10B981',
      'background_color' => '#FFFFFF',
      'text_color' => '#1F2937',
      'font_family' => 'Inter',
      'font_size' => '16px',
      'line_height' => '1.6',
    ];
  }

  /**
   * Получить конфигурацию навигации по умолчанию
   */
  private function getDefaultNavigationConfig(): array
  {
    return [
      'main_menu' => [
        'enabled' => true,
        'position' => 'header',
        'style' => 'horizontal',
      ],
      'footer_menu' => [
        'enabled' => true,
        'position' => 'footer',
        'style' => 'vertical',
      ],
    ];
  }

  /**
   * Получить SEO конфигурацию по умолчанию
   */
  private function getDefaultSeoConfig(Organization $organization): array
  {
    return [
      'meta_title' => $organization->name,
      'meta_description' => $organization->description ?? "Официальный сайт {$organization->name}",
      'meta_keywords' => $this->generateKeywords($organization),
      'og_title' => $organization->name,
      'og_description' => $organization->description ?? "Официальный сайт {$organization->name}",
      'og_image' => $organization->logo,
      'robots' => 'index,follow',
    ];
  }

  /**
   * Получить контент страницы "Спасибо"
   */
  private function getThanksPageContent(): string
  {
    return '<div class="container mx-auto px-4 py-16 text-center">
            <div class="max-w-2xl mx-auto">
                <div class="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Спасибо!</h1>
                <p class="text-xl text-gray-600 mb-8">Ваше пожертвование успешно обработано. Мы очень благодарны за вашу поддержку!</p>
                <div class="space-y-4">
                    <a href="/" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        Вернуться на главную
                    </a>
                    <a href="/projects" class="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors ml-4">
                        Посмотреть проекты
                    </a>
                </div>
            </div>
        </div>';
  }

  /**
   * Получить контент страницы "Контакты"
   */
  private function getContactsPageContent(Organization $organization): string
  {
    return '<div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">Контакты</h1>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Свяжитесь с нами</h2>
                    <div class="space-y-4">
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>' . ($organization->address ?? 'Адрес не указан') . '</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <span>' . ($organization->phone ?? 'Телефон не указан') . '</span>
                        </div>
                        <div class="flex items-center">
                            <svg class="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                            </svg>
                            <span>' . ($organization->email ?? 'Email не указан') . '</span>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 class="text-2xl font-semibold mb-4">Напишите нам</h2>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                            <input type="text" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Сообщение</label>
                            <textarea rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            Отправить сообщение
                        </button>
                    </form>
                </div>
            </div>
        </div>';
  }

  /**
   * Получить контент страницы "О нас"
   */
  private function getAboutPageContent(Organization $organization): string
  {
    return '<div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">О нас</h1>
            <div class="max-w-4xl mx-auto">
                <div class="prose prose-lg mx-auto">
                    <h2>' . $organization->name . '</h2>
                    <p>' . ($organization->description ?? 'Мы - организация, которая стремится сделать мир лучше через благотворительность и социальные проекты.') . '</p>
                    <h3>Наша миссия</h3>
                    <p>Мы верим в силу сообщества и важность взаимопомощи. Наша миссия - объединить людей для решения важных социальных задач.</p>
                    <h3>Наши ценности</h3>
                    <ul>
                        <li>Прозрачность и открытость</li>
                        <li>Эффективность использования средств</li>
                        <li>Уважение к каждому участнику</li>
                        <li>Непрерывное развитие</li>
                    </ul>
                </div>
            </div>
        </div>';
  }

  /**
   * Получить контент страницы "Проекты"
   */
  private function getProjectsPageContent(): string
  {
    return '<div class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold text-center mb-8">Наши проекты</h1>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-semibold mb-3">Проект 1</h3>
                    <p class="text-gray-600 mb-4">Описание проекта и его важности для сообщества.</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Цель: 100,000 ₽</span>
                        <a href="#" class="text-blue-600 hover:text-blue-800">Поддержать</a>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-semibold mb-3">Проект 2</h3>
                    <p class="text-gray-600 mb-4">Описание проекта и его важности для сообщества.</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Цель: 150,000 ₽</span>
                        <a href="#" class="text-blue-600 hover:text-blue-800">Поддержать</a>
                    </div>
                </div>
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h3 class="text-xl font-semibold mb-3">Проект 3</h3>
                    <p class="text-gray-600 mb-4">Описание проекта и его важности для сообщества.</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Цель: 200,000 ₽</span>
                        <a href="#" class="text-blue-600 hover:text-blue-800">Поддержать</a>
                    </div>
                </div>
            </div>
        </div>';
  }
}
