<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FormWidget;
use App\Models\FormSubmission;
use App\Models\FormAction;
use App\Services\FormActionExecutorService;
use App\Services\FormValidationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class FormSubmissionController extends Controller
{
  protected $actionExecutor;
  protected $validationService;

  public function __construct(
    FormActionExecutorService $actionExecutor,
    FormValidationService $validationService
  ) {
    $this->actionExecutor = $actionExecutor;
    $this->validationService = $validationService;
  }

  /**
   * Отправить форму
   */
  public function submit(Request $request, int $siteId, int $widgetId): JsonResponse
  {
    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->where('is_active', true)
      ->with(['fields', 'formActions'])
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Форма не найдена или неактивна',
      ], 404);
    }

    // Валидируем данные формы
    $validationResult = $this->validationService->validateFormData(
      $request->all(),
      $widget->fields->toArray()
    );

    if (!$validationResult['success']) {
      return response()->json([
        'success' => false,
        'message' => $validationResult['message'],
        'errors' => $validationResult['errors'],
      ], 422);
    }

    $validatedData = $validationResult['data'];

    // Создаем запись о отправке формы
    $submission = FormSubmission::create([
      'form_widget_id' => $widgetId,
      'data' => $validatedData,
      'ip_address' => $request->ip(),
      'user_agent' => $request->userAgent(),
      'referer' => $request->header('referer'),
    ]);

    // Выполняем экшены
    $actionResults = $this->actionExecutor->executeActions($submission);

    return response()->json([
      'success' => true,
      'message' => 'Форма успешно отправлена',
      'submission_id' => $submission->id,
    ]);
  }

  /**
   * Получить отправки формы (для админа)
   */
  public function index(Request $request, int $siteId, int $widgetId): JsonResponse
  {
    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Форма не найдена',
      ], 404);
    }

    $submissions = $widget->submissions()
      ->orderBy('created_at', 'desc')
      ->paginate(20);

    return response()->json([
      'success' => true,
      'data' => $submissions,
    ]);
  }

  /**
   * Получить детали отправки
   */
  public function show(int $siteId, int $widgetId, int $submissionId): JsonResponse
  {
    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Форма не найдена',
      ], 404);
    }

    $submission = $widget->submissions()
      ->where('id', $submissionId)
      ->first();

    if (!$submission) {
      return response()->json([
        'success' => false,
        'message' => 'Отправка не найдена',
      ], 404);
    }

    return response()->json([
      'success' => true,
      'data' => $submission,
    ]);
  }

  /**
   * Удалить отправку
   */
  public function destroy(int $siteId, int $widgetId, int $submissionId): JsonResponse
  {
    $widget = FormWidget::where('site_id', $siteId)
      ->where('id', $widgetId)
      ->first();

    if (!$widget) {
      return response()->json([
        'success' => false,
        'message' => 'Форма не найдена',
      ], 404);
    }

    $submission = $widget->submissions()
      ->where('id', $submissionId)
      ->first();

    if (!$submission) {
      return response()->json([
        'success' => false,
        'message' => 'Отправка не найдена',
      ], 404);
    }

    $submission->delete();

    return response()->json([
      'success' => true,
      'message' => 'Отправка удалена',
    ]);
  }
}
