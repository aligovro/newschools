<?php

namespace App\Http\Controllers;

use App\Models\Site;
use App\Models\SitePage;
use App\Models\Domain;
use App\Services\SliderService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Resources\OrganizationSiteResource;
use App\Http\Resources\SitePageResource;

class PublicSiteController extends Controller
{
  protected $sliderService;

  public function __construct(SliderService $sliderService)
  {
    $this->sliderService = $sliderService;
  }

  /**
   * Отображение сайта организации по домену
   */
  public function show(Request $request)
  {
    // Получаем домен из запроса
    $host = $request->getHost();

    // Ищем домен в базе данных
    $domain = Domain::where('domain', $host)
      ->orWhere('custom_domain', $host)
      ->where('status', 'active')
      ->first();

    if (!$domain) {
      abort(404, 'Сайт не найден');
    }

    // Получаем сайт организации
    $site = $domain->organization->sites()
      ->where('domain_id', $domain->id)
      ->published()
      ->first();

    if (!$site) {
      abort(404, 'Сайт не найден');
    }

    // Проверяем режим обслуживания
    if ($site->is_maintenance_mode) {
      return view('sites.maintenance', [
        'site' => $site,
        'message' => $site->maintenance_message
      ]);
    }

    // Получаем главную страницу
    $homepage = $site->pages()
      ->where('is_homepage', true)
      ->published()
      ->first();

    if (!$homepage) {
      abort(404, 'Главная страница не найдена');
    }

    // Получаем слайдеры для сайта
    $sliders = $this->sliderService->getAllSliders($site->organization);

    // Получаем навигацию
    $navigation = $this->getNavigation($site);

    return Inertia::render('sites/Show', [
      'site' => (new OrganizationSiteResource($site))->toArray(request()),
      'homepage' => (new SitePageResource($homepage))->toArray(request()),
      'navigation' => $navigation,
      'sliders' => $sliders,
    ]);
  }

  /**
   * Отображение конкретной страницы сайта
   */
  public function showPage(Request $request, $slug)
  {
    // Получаем домен из запроса
    $host = $request->getHost();

    // Ищем домен в базе данных
    $domain = Domain::where('domain', $host)
      ->orWhere('custom_domain', $host)
      ->where('status', 'active')
      ->first();

    if (!$domain) {
      abort(404, 'Сайт не найден');
    }

    // Получаем сайт организации
    $site = $domain->organization->sites()
      ->where('domain_id', $domain->id)
      ->published()
      ->first();

    if (!$site) {
      abort(404, 'Сайт не найден');
    }

    // Проверяем режим обслуживания
    if ($site->is_maintenance_mode) {
      return view('sites.maintenance', [
        'site' => $site,
        'message' => $site->maintenance_message
      ]);
    }

    // Получаем страницу
    $page = $site->pages()
      ->where('slug', $slug)
      ->published()
      ->first();

    if (!$page) {
      abort(404, 'Страница не найдена');
    }

    // Получаем слайдеры для сайта
    $sliders = $this->sliderService->getAllSliders($site->organization);

    // Получаем навигацию
    $navigation = $this->getNavigation($site);

    // Получаем хлебные крошки
    $breadcrumbs = $page->getBreadcrumbs();

    return Inertia::render('sites/Page', [
      'site' => (new OrganizationSiteResource($site))->toArray(request()),
      'page' => (new SitePageResource($page))->toArray(request()),
      'navigation' => $navigation,
      'sliders' => $sliders,
      'breadcrumbs' => $breadcrumbs,
    ]);
  }

  /**
   * API для получения контента сайта
   */
  public function api(Request $request)
  {
    $host = $request->getHost();

    $domain = Domain::where('domain', $host)
      ->orWhere('custom_domain', $host)
      ->where('status', 'active')
      ->first();

    if (!$domain) {
      return response()->json(['error' => 'Site not found'], 404);
    }

    $site = $domain->organization->sites()
      ->where('domain_id', $domain->id)
      ->published()
      ->first();

    if (!$site) {
      return response()->json(['error' => 'Site not found'], 404);
    }

    $pages = $site->pages()
      ->published()
      ->select('id', 'title', 'slug', 'excerpt', 'featured_image', 'is_homepage')
      ->get();

    $sliders = $this->sliderService->getAllSliders($site->organization);

    return response()->json([
      'site' => [
        'id' => $site->id,
        'name' => $site->name,
        'description' => $site->description,
        'logo' => $site->logo_url,
        'favicon' => $site->favicon_url,
        'theme' => $site->merged_theme_config,
      ],
      'pages' => $pages,
      'sliders' => $sliders,
      'navigation' => $this->getNavigation($site),
    ]);
  }

  /**
   * Получение навигации сайта
   */
  protected function getNavigation(Site $site): array
  {
    $pages = $site->pages()
      ->published()
      ->inNavigation()
      ->rootPages()
      ->orderBy('sort_order')
      ->get()
      ->map(function ($page) {
        return [
          'id' => $page->id,
          'title' => $page->title,
          'url' => $page->url,
          'children' => $this->getPageChildren($page),
        ];
      });

    return $pages->toArray();
  }

  /**
   * Получение дочерних страниц
   */
  protected function getPageChildren(SitePage $page): array
  {
    return $page->publishedChildren()
      ->inNavigation()
      ->orderBy('sort_order')
      ->get()
      ->map(function ($child) {
        return [
          'id' => $child->id,
          'title' => $child->title,
          'url' => $child->url,
          'children' => $this->getPageChildren($child),
        ];
      })
      ->toArray();
  }

  /**
   * Обработка формы обратной связи
   */
  public function contactForm(Request $request)
  {
    $host = $request->getHost();

    $domain = Domain::where('domain', $host)
      ->orWhere('custom_domain', $host)
      ->where('status', 'active')
      ->first();

    if (!$domain) {
      return response()->json(['error' => 'Site not found'], 404);
    }

    $site = $domain->organization->sites()
      ->where('domain_id', $domain->id)
      ->published()
      ->first();

    if (!$site) {
      return response()->json(['error' => 'Site not found'], 404);
    }

    // Валидация формы
    $validated = $request->validate([
      'name' => 'required|string|max:255',
      'email' => 'required|email|max:255',
      'subject' => 'nullable|string|max:255',
      'message' => 'required|string|max:1000',
    ]);

    // Здесь можно добавить отправку email или сохранение в базу данных
    // Например, через Mail::to($site->organization->email)->send(new ContactFormMail($validated));

    return response()->json([
      'success' => true,
      'message' => 'Сообщение отправлено успешно!'
    ]);
  }
}
