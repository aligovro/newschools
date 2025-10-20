<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\OrganizationPage;
use App\Models\OrganizationSlider;
use App\Models\OrganizationMenu;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use App\Http\Resources\OrganizationResource;
use App\Http\Resources\OrganizationPageResource;
use App\Http\Resources\OrganizationSliderResource;

class OrganizationHomepageController extends Controller
{
  public function __construct()
  {
    // Middleware применяется в маршрутах
  }

  /**
   * Редактор главной страницы
   */
  public function index(Organization $organization)
  {
    $homepage = $organization->homepage ?? $organization->pages()->create([
      'title' => 'Главная страница',
      'slug' => 'home',
      'content' => $this->getDefaultHomepageContent(),
      'is_homepage' => true,
      'is_published' => true,
      'seo_title' => $organization->name,
      'seo_description' => $organization->description,
    ]);

    $homepage->load(['seo']);

    // Получаем компоненты для главной страницы
    $sliders = $organization->sliders()->active()->get();
    $menus = $organization->activeMenus()->get();
    $stats = $this->getHomepageStats($organization);

    return Inertia::render('organization/admin/HomepageEditor', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'homepage' => (new OrganizationPageResource($homepage))->toArray(request()),
      'sliders' => OrganizationSliderResource::collection($sliders)->toArray(request()),
      'menus' => $menus,
      'stats' => $stats,
      'availableComponents' => $this->getAvailableComponents(),
      'templates' => $this->getHomepageTemplates(),
    ]);
  }

  /**
   * Обновить контент главной страницы
   */
  public function updateContent(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'title' => 'required|string|max:255',
      'content' => 'nullable|string',
      'layout_config' => 'nullable|array',
      'seo_title' => 'nullable|string|max:255',
      'seo_description' => 'nullable|string|max:500',
      'seo_keywords' => 'nullable|string|max:500',
      'is_published' => 'boolean',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $homepage = $organization->homepage ?? $organization->pages()->create([
      'title' => 'Главная страница',
      'slug' => 'home',
      'is_homepage' => true,
    ]);

    $homepage->update($request->all());

    // Обновляем SEO данные
    if ($homepage->seo) {
      $homepage->seo->update([
        'meta_title' => $request->seo_title,
        'meta_description' => $request->seo_description,
        'meta_keywords' => $request->seo_keywords,
      ]);
    } else {
      $homepage->seo()->create([
        'meta_title' => $request->seo_title,
        'meta_description' => $request->seo_description,
        'meta_keywords' => $request->seo_keywords,
      ]);
    }

    return response()->json([
      'message' => 'Главная страница обновлена',
      'homepage' => $homepage->fresh(['seo']),
    ]);
  }

  /**
   * Обновить компоненты главной страницы
   */
  public function updateComponents(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'components' => 'required|array',
      'components.*.type' => 'required|string',
      'components.*.settings' => 'nullable|array',
      'components.*.order' => 'required|integer',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $homepage = $organization->homepage;
    $layoutConfig = $homepage->layout_config ?? [];
    $layoutConfig['components'] = $request->components;

    $homepage->update(['layout_config' => $layoutConfig]);

    return response()->json([
      'message' => 'Компоненты обновлены',
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Добавить компонент
   */
  public function addComponent(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'type' => 'required|string',
      'settings' => 'nullable|array',
      'position' => 'nullable|integer',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $homepage = $organization->homepage;
    $layoutConfig = $homepage->layout_config ?? [];
    $components = $layoutConfig['components'] ?? [];

    $newComponent = [
      'id' => uniqid(),
      'type' => $request->type,
      'settings' => $request->settings ?? [],
      'order' => $request->position ?? count($components),
    ];

    $components[] = $newComponent;
    $layoutConfig['components'] = $components;

    $homepage->update(['layout_config' => $layoutConfig]);

    return response()->json([
      'message' => 'Компонент добавлен',
      'component' => $newComponent,
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Удалить компонент
   */
  public function removeComponent(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'component_id' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $homepage = $organization->homepage;
    $layoutConfig = $homepage->layout_config ?? [];
    $components = $layoutConfig['components'] ?? [];

    $components = array_filter($components, function ($component) use ($request) {
      return $component['id'] !== $request->component_id;
    });

    $layoutConfig['components'] = array_values($components);
    $homepage->update(['layout_config' => $layoutConfig]);

    return response()->json([
      'message' => 'Компонент удален',
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Переупорядочить компоненты
   */
  public function reorderComponents(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'components' => 'required|array',
      'components.*.id' => 'required|string',
      'components.*.order' => 'required|integer',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $homepage = $organization->homepage;
    $layoutConfig = $homepage->layout_config ?? [];
    $layoutConfig['components'] = $request->components;

    $homepage->update(['layout_config' => $layoutConfig]);

    return response()->json([
      'message' => 'Порядок компонентов обновлен',
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Применить шаблон
   */
  public function applyTemplate(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'template_id' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    $template = $this->getTemplate($request->template_id);

    if (!$template) {
      return response()->json([
        'message' => 'Шаблон не найден'
      ], 404);
    }

    $homepage = $organization->homepage;

    $homepage->update([
      'title' => $template['title'],
      'content' => $template['content'],
      'layout_config' => $template['layout_config'],
    ]);

    // Обновляем SEO
    if ($homepage->seo) {
      $homepage->seo->update([
        'meta_title' => $template['seo']['title'] ?? $homepage->title,
        'meta_description' => $template['seo']['description'] ?? '',
        'meta_keywords' => $template['seo']['keywords'] ?? '',
      ]);
    }

    return response()->json([
      'message' => 'Шаблон применен',
      'homepage' => $homepage->fresh(['seo']),
    ]);
  }

  /**
   * Предварительный просмотр
   */
  public function preview(Organization $organization)
  {
    $homepage = $organization->homepage;

    if (!$homepage) {
      abort(404, 'Главная страница не найдена');
    }

    return Inertia::render('organization/HomepagePreview', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'homepage' => (new OrganizationPageResource($homepage))->toArray(request()),
      'preview' => true,
    ]);
  }

  /**
   * Опубликовать главную страницу
   */
  public function publish(Organization $organization): JsonResponse
  {
    $homepage = $organization->homepage;

    if (!$homepage) {
      return response()->json([
        'message' => 'Главная страница не найдена'
      ], 404);
    }

    $homepage->update(['is_published' => true]);

    return response()->json([
      'message' => 'Главная страница опубликована',
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Снять с публикации
   */
  public function unpublish(Organization $organization): JsonResponse
  {
    $homepage = $organization->homepage;

    if (!$homepage) {
      return response()->json([
        'message' => 'Главная страница не найдена'
      ], 404);
    }

    $homepage->update(['is_published' => false]);

    return response()->json([
      'message' => 'Главная страница снята с публикации',
      'homepage' => $homepage->fresh(),
    ]);
  }

  /**
   * Загрузить изображение
   */
  public function uploadImage(Request $request, Organization $organization): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB
      'folder' => 'nullable|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'message' => 'Validation failed',
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $folder = $request->folder ?? 'homepage';
      $path = $request->file('image')->store("organizations/{$organization->id}/{$folder}", 'public');

      return response()->json([
        'message' => 'Изображение загружено',
        'url' => Storage::url($path),
        'path' => $path,
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Ошибка загрузки изображения: ' . $e->getMessage()
      ], 500);
    }
  }

  /**
   * Получить статистику для главной страницы
   */
  private function getHomepageStats(Organization $organization): array
  {
    return [
      'totalVisitors' => $organization->statistics()->sum('unique_visitors'),
      'monthlyVisitors' => $organization->statistics()
        ->whereMonth('created_at', now()->month)
        ->sum('unique_visitors'),
      'totalDonations' => $organization->donations()->where('status', 'completed')->sum('amount'),
      'activeProjects' => $organization->projects()->where('status', 'active')->count(),
      'totalMembers' => $organization->members()->count(),
    ];
  }

  /**
   * Получить доступные компоненты
   */
  private function getAvailableComponents(): array
  {
    return [
      'hero' => [
        'name' => 'Главный баннер',
        'description' => 'Большой заголовочный блок с изображением',
        'icon' => 'image',
        'settings' => [
          'title' => 'string',
          'subtitle' => 'string',
          'background_image' => 'image',
          'button_text' => 'string',
          'button_url' => 'url',
        ],
      ],
      'stats' => [
        'name' => 'Статистика',
        'description' => 'Блок с ключевыми показателями',
        'icon' => 'bar-chart',
        'settings' => [
          'show_donations' => 'boolean',
          'show_members' => 'boolean',
          'show_projects' => 'boolean',
        ],
      ],
      'projects' => [
        'name' => 'Проекты',
        'description' => 'Список активных проектов',
        'icon' => 'folder',
        'settings' => [
          'limit' => 'number',
          'show_progress' => 'boolean',
          'layout' => 'select:grid,list',
        ],
      ],
      'news' => [
        'name' => 'Новости',
        'description' => 'Последние новости организации',
        'icon' => 'newspaper',
        'settings' => [
          'limit' => 'number',
          'show_excerpt' => 'boolean',
        ],
      ],
      'testimonials' => [
        'name' => 'Отзывы',
        'description' => 'Отзывы участников и доноров',
        'icon' => 'message-circle',
        'settings' => [
          'limit' => 'number',
          'show_photos' => 'boolean',
        ],
      ],
      'contact' => [
        'name' => 'Контакты',
        'description' => 'Контактная информация',
        'icon' => 'phone',
        'settings' => [
          'show_map' => 'boolean',
          'show_social' => 'boolean',
        ],
      ],
    ];
  }

  /**
   * Получить шаблоны главной страницы
   */
  private function getHomepageTemplates(): array
  {
    return [
      'default' => [
        'id' => 'default',
        'name' => 'Стандартный',
        'description' => 'Классический макет с баннером и статистикой',
        'preview' => '/images/templates/default.jpg',
        'layout_config' => [
          'components' => [
            [
              'id' => 'hero_1',
              'type' => 'hero',
              'order' => 1,
              'settings' => [
                'title' => 'Добро пожаловать',
                'subtitle' => 'Поддержите нашу организацию',
              ],
            ],
            [
              'id' => 'stats_1',
              'type' => 'stats',
              'order' => 2,
              'settings' => [],
            ],
            [
              'id' => 'projects_1',
              'type' => 'projects',
              'order' => 3,
              'settings' => ['limit' => 3],
            ],
          ],
        ],
      ],
      'modern' => [
        'id' => 'modern',
        'name' => 'Современный',
        'description' => 'Современный дизайн с акцентом на визуал',
        'preview' => '/images/templates/modern.jpg',
        'layout_config' => [
          'components' => [
            [
              'id' => 'hero_2',
              'type' => 'hero',
              'order' => 1,
              'settings' => [
                'title' => 'Вместе мы сильнее',
                'subtitle' => 'Присоединяйтесь к нашему сообществу',
              ],
            ],
            [
              'id' => 'news_1',
              'type' => 'news',
              'order' => 2,
              'settings' => ['limit' => 4],
            ],
            [
              'id' => 'stats_2',
              'type' => 'stats',
              'order' => 3,
              'settings' => [],
            ],
          ],
        ],
      ],
    ];
  }

  /**
   * Получить шаблон по ID
   */
  private function getTemplate(string $templateId): ?array
  {
    $templates = $this->getHomepageTemplates();
    return $templates[$templateId] ?? null;
  }

  /**
   * Получить контент по умолчанию
   */
  private function getDefaultHomepageContent(): string
  {
    return '<div class="container mx-auto px-4 py-8">
            <h1 class="text-4xl font-bold text-center mb-8">Добро пожаловать</h1>
            <p class="text-lg text-center text-gray-600 mb-8">
                Мы рады приветствовать вас на нашем сайте. Здесь вы можете узнать о нашей работе,
                поддержать наши проекты и стать частью нашего сообщества.
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
}
