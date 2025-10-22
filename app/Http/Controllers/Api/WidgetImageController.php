<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageProcessingService;
use App\Services\WidgetService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class WidgetImageController extends Controller
{
  private ImageProcessingService $imageService;
  private WidgetService $widgetService;

  public function __construct(ImageProcessingService $imageService, WidgetService $widgetService)
  {
    $this->imageService = $imageService;
    $this->widgetService = $widgetService;
  }

  /**
   * Загрузить изображение для виджета
   */
  public function upload(Request $request): JsonResponse
  {
    Log::info('Widget image upload request', [
      'user_id' => Auth::id(),
      'request_data' => $request->except(['image']),
      'has_image' => $request->hasFile('image'),
    ]);

    $validator = Validator::make($request->all(), [
      'image' => 'required|mimes:jpeg,png,jpg,gif,webp,svg|max:10240', // 10MB, включая SVG
      'widget_slug' => 'required|string',
      'slide_id' => 'nullable|string', // Для hero слайдов
      'image_type' => 'required|string|in:background,avatar,gallery,image',
    ]);

    if ($validator->fails()) {
      Log::warning('Widget image upload validation failed', [
        'errors' => $validator->errors(),
      ]);
      return response()->json([
        'success' => false,
        'message' => 'Ошибки валидации',
        'errors' => $validator->errors(),
      ], 422);
    }

    try {
      $file = $request->file('image');
      $widgetSlug = $request->widget_slug;
      $imageType = $request->image_type;
      $slideId = $request->slide_id;

      // Валидируем изображение
      $validationErrors = $this->imageService->validateImage($file);
      if (!empty($validationErrors)) {
        return response()->json([
          'success' => false,
          'message' => 'Ошибки валидации изображения',
          'errors' => $validationErrors,
        ], 422);
      }

      // Обрабатываем изображение в зависимости от типа виджета и изображения
      $processedImage = $this->processImageForWidget($file, $widgetSlug, $imageType);

      return response()->json([
        'success' => true,
        'data' => [
          'url' => $processedImage['url'],
          'thumbnails' => $processedImage['thumbnails'],
          'filename' => $processedImage['filename'],
          'original_name' => $processedImage['original_name'],
          'size' => $processedImage['size'],
          'dimensions' => $processedImage['dimensions'],
        ],
        'message' => 'Изображение успешно загружено',
      ]);
    } catch (\Exception $e) {
      Log::error('Error uploading widget image', [
        'widget_slug' => $request->widget_slug,
        'image_type' => $request->image_type,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Удалить изображение виджета
   */
  public function delete(Request $request): JsonResponse
  {
    $validator = Validator::make($request->all(), [
      'image_path' => 'required|string',
      'widget_slug' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Ошибки валидации',
        'errors' => $validator->errors(),
      ], 422);
    }

    try {
      $imagePath = $request->image_path;
      $widgetSlug = $request->widget_slug;

      // Удаляем изображение
      $deleted = $this->deleteImageByPath($imagePath);

      if (!$deleted) {
        return response()->json([
          'success' => false,
          'message' => 'Изображение не найдено или не удалено',
        ], 404);
      }

      return response()->json([
        'success' => true,
        'message' => 'Изображение успешно удалено',
      ]);
    } catch (\Exception $e) {
      Log::error('Error deleting widget image', [
        'image_path' => $request->image_path,
        'widget_slug' => $request->widget_slug,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);

      return response()->json([
        'success' => false,
        'message' => 'Ошибка при удалении изображения: ' . $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Обработать изображение для конкретного виджета
   */
  private function processImageForWidget($file, string $widgetSlug, string $imageType): array
  {
    $directory = "widgets/{$widgetSlug}";
    $sizes = $this->getSizesForWidget($widgetSlug, $imageType);

    $processed = $this->imageService->processAndSave($file, $directory, $sizes);

    return [
      'url' => $this->imageService->getImageUrl($processed['original']),
      'thumbnails' => array_map(
        fn($path) => $this->imageService->getImageUrl($path),
        $processed['thumbnails']
      ),
      'filename' => $processed['filename'],
      'original_name' => $processed['original_name'],
      'size' => $processed['size'],
      'dimensions' => $processed['dimensions'],
    ];
  }

  /**
   * Получить размеры для обработки изображения в зависимости от виджета
   */
  private function getSizesForWidget(string $widgetSlug, string $imageType): array
  {
    $sizes = [];

    switch ($widgetSlug) {
      case 'hero-slider':
      case 'hero':
        if ($imageType === 'background') {
          $sizes = [
            'hero' => ['width' => 1200, 'height' => 600, 'fit' => 'cover'],
            'thumbnail' => ['width' => 300, 'height' => 150, 'fit' => 'cover'],
            'small' => ['width' => 150, 'height' => 75, 'fit' => 'cover']
          ];
        }
        break;

      case 'gallery':
        if ($imageType === 'gallery') {
          $sizes = [
            'gallery' => ['width' => 800, 'height' => 600, 'fit' => 'cover'],
            'thumbnail' => ['width' => 200, 'height' => 150, 'fit' => 'cover'],
            'small' => ['width' => 100, 'height' => 75, 'fit' => 'cover']
          ];
        }
        break;

      case 'testimonials':
        if ($imageType === 'avatar') {
          $sizes = [
            'avatar' => ['width' => 100, 'height' => 100, 'fit' => 'cover'],
            'thumbnail' => ['width' => 50, 'height' => 50, 'fit' => 'cover']
          ];
        }
        break;

      default:
        // Размеры по умолчанию
        $sizes = [
          'medium' => ['width' => 600, 'height' => 400, 'fit' => 'cover'],
          'thumbnail' => ['width' => 200, 'height' => 150, 'fit' => 'cover'],
          'small' => ['width' => 100, 'height' => 75, 'fit' => 'cover']
        ];
        break;
    }

    return $sizes;
  }

  /**
   * Удалить изображение по пути
   */
  private function deleteImageByPath(string $path): bool
  {
    // Удаляем префикс storage/ если есть
    $path = str_replace('storage/', '', $path);

    // Удаляем префикс /storage/ если есть
    $path = ltrim($path, '/');

    return $this->imageService->deleteImage(
      basename($path),
      dirname($path)
    );
  }
}
