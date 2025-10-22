<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormWidget;
use App\Models\Site;
use App\Services\FormActionGeneratorService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FormWidgetController extends Controller
{
  private FormActionGeneratorService $actionGenerator;

  public function __construct(FormActionGeneratorService $actionGenerator)
  {
    $this->actionGenerator = $actionGenerator;
  }

  /**
   * Получить все виджеты форм для сайта
   */
  public function index(Request $request, int $siteId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $widgets = FormWidget::where('site_id', $siteId)
      ->with(['fields', 'formActions'])
      ->orderBy('sort_order')
      ->get();

    return response()->json([
      'success' => true,
      'data' => $widgets,
    ]);
  }

  /**
   * Создать новый виджет формы
   */
  public function store(Request $request, int $siteId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'description' => 'nullable|string',
      'settings' => 'nullable|array',
      'styling' => 'nullable|array',
      'actions' => 'nullable|array',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибки валидации',
        'errors' => $validator->errors(),
      ], 422);
    }

    $data = $validator->validated();
    $data['site_id'] = $siteId;
    $data['slug'] = Str::slug($data['name']);

    $widget = FormWidget::create($data);

    return response()->json([
      'success' => true,
      'data' => $widget->load(['fields', 'formActions']),
    ], 201);
  }

  /**
   * Получить виджет формы
   */
  public function show(int $siteId, int $widgetId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->with(['fields', 'formActions'])
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Виджет не найден',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => $widget,
    ]);
  }

  /**
   * Обновить виджет формы
   */
  public function update(Request $request, int $siteId, int $widgetId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Виджет не найден',
      ], 404);
    }

    $validator = Validator::make($request->all(), [
      'name' => 'sometimes|string|max:255',
      'description' => 'nullable|string',
      'settings' => 'nullable|array',
      'styling' => 'nullable|array',
      'actions' => 'nullable|array',
      'is_active' => 'boolean',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибки валидации',
        'errors' => $validator->errors(),
      ], 422);
    }

    $data = $validator->validated();

    if (isset($data['name'])) {
      $data['slug'] = Str::slug($data['name']);
    }

    $widget->update($data);

    return response()->json([
      'success' => true,
      'data' => $widget->load(['fields', 'formActions']),
    ]);
  }

  /**
   * Удалить виджет формы
   */
  public function destroy(int $siteId, int $widgetId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Виджет не найден',
      ], 404);
    }

    $widget->delete();

    return response()->json([
      'success' => true,
      'message' => 'Виджет удален',
    ]);
  }

  /**
   * Создать экшен для формы
   */
  public function createAction(Request $request, int $siteId, int $widgetId): JsonResponse
  {
    $site = $this->getSite($siteId);

    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Виджет не найден',
      ], 404);
    }

    $validator = Validator::make($request->all(), [
      'name' => 'required|string|max:255',
      'type' => 'required|string|in:email,webhook,database,telegram,custom',
      'config' => 'required|array',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибки валидации',
        'errors' => $validator->errors(),
      ], 422);
    }

    $data = $validator->validated();
    $data['form_widget_id'] = $widgetId;

    // Создаем экшен в БД
    $action = $widget->formActions()->create($data);

    // Если это кастомный экшен, генерируем PHP файл
    if ($data['type'] === 'custom') {
      try {
        $className = $this->actionGenerator->createAction(
          $widget,
          $data['name'],
          $data['type'],
          $data['config']
        );

        $action->update(['config' => array_merge($data['config'], ['class' => $className])]);
      } catch (\Exception $e) {
        return response()->json([
          'success' => false,
          'message' => 'Ошибка создания экшена: ' . $e->getMessage(),
        ], 500);
      }
    }

    return response()->json([
      'success' => true,
      'data' => $action,
    ], 201);
  }

  /**
   * Получить список доступных экшенов
   */
  public function getAvailableActions(): JsonResponse
  {
    $actions = $this->actionGenerator->getExistingActions();

    return response()->json([
      'success' => true,
      'data' => $actions,
    ]);
  }

  /**
   * Получить сайт с проверкой прав доступа
   */
  private function getSite(int $siteId): Site
  {
    $site = Site::findOrFail($siteId);

    // Проверяем права доступа
    $user = Auth::user();
    if (!$user->hasRole('super_admin')) {
      if ($site->organization_id !== $user->organization_id) {
        abort(403, 'Доступ запрещен');
      }
    }

    return $site;
  }
}
