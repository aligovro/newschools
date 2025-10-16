<?php

namespace App\Services;

use App\Models\OrganizationSite;
use App\Services\ImageProcessingService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WidgetService
{
  private ImageProcessingService $imageService;

  public function __construct(ImageProcessingService $imageService)
  {
    $this->imageService = $imageService;
  }

  /**
   * Обработать изображения в конфигурации виджета
   */
  public function processWidgetImages(array $config, string $widgetSlug): array
  {
    $processedConfig = $config;

    // Обрабатываем изображения в зависимости от типа виджета
    switch ($widgetSlug) {
      case 'hero-slider':
      case 'hero':
        $processedConfig = $this->processHeroImages($config);
        break;
      case 'gallery':
        $processedConfig = $this->processGalleryImages($config);
        break;
      case 'testimonials':
        $processedConfig = $this->processTestimonialImages($config);
        break;
        // Добавляем другие типы виджетов по мере необходимости
    }

    return $processedConfig;
  }

  /**
   * Обработать изображения для Hero виджета
   */
  private function processHeroImages(array $config): array
  {
    $processedConfig = $config;

    // Обрабатываем singleSlide
    if (isset($config['singleSlide']) && isset($config['singleSlide']['backgroundImage'])) {
      $processedConfig['singleSlide'] = $this->processSlideImage(
        $config['singleSlide'],
        'hero'
      );
    }

    // Обрабатываем slides
    if (isset($config['slides']) && is_array($config['slides'])) {
      $processedConfig['slides'] = array_map(function ($slide) {
        return $this->processSlideImage($slide, 'hero');
      }, $config['slides']);
    }

    return $processedConfig;
  }

  /**
   * Обработать изображения для галереи
   */
  private function processGalleryImages(array $config): array
  {
    $processedConfig = $config;

    if (isset($config['images']) && is_array($config['images'])) {
      $processedConfig['images'] = array_map(function ($image) {
        if (isset($image['file']) && $image['file'] instanceof UploadedFile) {
          $processed = $this->imageService->processGalleryImage($image['file']);
          return [
            'url' => $this->imageService->getImagePath($processed['original']),
            'thumbnails' => array_map(
              fn($path) => $this->imageService->getImagePath($path),
              $processed['thumbnails']
            ),
            'alt' => $image['alt'] ?? '',
            'title' => $image['title'] ?? '',
          ];
        }
        return $image;
      }, $config['images']);
    }

    return $processedConfig;
  }

  /**
   * Обработать изображения для отзывов
   */
  private function processTestimonialImages(array $config): array
  {
    $processedConfig = $config;

    if (isset($config['testimonials']) && is_array($config['testimonials'])) {
      $processedConfig['testimonials'] = array_map(function ($testimonial) {
        if (isset($testimonial['avatar']) && $testimonial['avatar'] instanceof UploadedFile) {
          $processed = $this->imageService->processAndSave(
            $testimonial['avatar'],
            'testimonials/avatars',
            [
              'avatar' => ['width' => 100, 'height' => 100, 'fit' => 'cover'],
              'thumbnail' => ['width' => 50, 'height' => 50, 'fit' => 'cover']
            ]
          );
          $testimonial['avatar'] = $this->imageService->getImagePath($processed['original']);
          $testimonial['avatar_thumbnails'] = array_map(
            fn($path) => $this->imageService->getImagePath($path),
            $processed['thumbnails']
          );
        }
        return $testimonial;
      }, $config['testimonials']);
    }

    return $processedConfig;
  }

  /**
   * Обработать изображение слайда
   */
  private function processSlideImage(array $slide, string $type): array
  {
    $processedSlide = $slide;

    // Если есть файл для загрузки
    if (isset($slide['backgroundImageFile']) && $slide['backgroundImageFile'] instanceof UploadedFile) {
      $processed = $this->imageService->processAndSave(
        $slide['backgroundImageFile'],
        "widgets/{$type}",
        [
          'hero' => ['width' => 1200, 'height' => 600, 'fit' => 'cover'],
          'thumbnail' => ['width' => 300, 'height' => 150, 'fit' => 'cover'],
          'small' => ['width' => 150, 'height' => 75, 'fit' => 'cover']
        ]
      );

      $processedSlide['backgroundImage'] = $this->imageService->getImagePath($processed['original']);
      $processedSlide['backgroundImageThumbnails'] = array_map(
        fn($path) => $this->imageService->getImagePath($path),
        $processed['thumbnails']
      );

      // Удаляем временный файл из конфигурации
      unset($processedSlide['backgroundImageFile']);
    }
    // Если есть URL (уже обработанное изображение)
    elseif (isset($slide['backgroundImage']) && is_string($slide['backgroundImage'])) {
      // Проверяем, является ли это временным URL (blob:)
      if (str_starts_with($slide['backgroundImage'], 'blob:')) {
        // В реальном приложении здесь нужно было бы обработать blob URL
        // Пока оставляем как есть
        $processedSlide['backgroundImage'] = $slide['backgroundImage'];
      }
    }

    return $processedSlide;
  }

  /**
   * Валидировать конфигурацию виджета
   */
  public function validateWidgetConfig(array $config, string $widgetSlug): array
  {
    $errors = [];

    switch ($widgetSlug) {
      case 'hero-slider':
      case 'hero':
        $errors = array_merge($errors, $this->validateHeroConfig($config));
        break;
      case 'gallery':
        $errors = array_merge($errors, $this->validateGalleryConfig($config));
        break;
      case 'testimonials':
        $errors = array_merge($errors, $this->validateTestimonialConfig($config));
        break;
    }

    return $errors;
  }

  /**
   * Валидация Hero конфигурации
   */
  private function validateHeroConfig(array $config): array
  {
    $errors = [];

    // Проверяем высоту
    if (isset($config['height']) && (!is_string($config['height']) || !preg_match('/^\d+px$/', $config['height']))) {
      $errors[] = 'Высота должна быть указана в пикселях (например: 600px)';
    }

    // Проверяем тип
    if (isset($config['type']) && !in_array($config['type'], ['single', 'slider'])) {
      $errors[] = 'Тип должен быть "single" или "slider"';
    }

    // Проверяем анимацию
    if (isset($config['animation']) && !in_array($config['animation'], ['fade', 'slide', 'zoom'])) {
      $errors[] = 'Анимация должна быть "fade", "slide" или "zoom"';
    }

    // Проверяем задержку автопрокрутки
    if (isset($config['autoplayDelay']) && (!is_numeric($config['autoplayDelay']) || $config['autoplayDelay'] < 1000)) {
      $errors[] = 'Задержка автопрокрутки должна быть не менее 1000мс';
    }

    // Проверяем слайды
    if (isset($config['slides']) && is_array($config['slides'])) {
      foreach ($config['slides'] as $index => $slide) {
        $slideErrors = $this->validateSlide($slide, $index);
        $errors = array_merge($errors, $slideErrors);
      }
    }

    // Проверяем singleSlide
    if (isset($config['singleSlide']) && is_array($config['singleSlide'])) {
      $slideErrors = $this->validateSlide($config['singleSlide'], 0);
      $errors = array_merge($errors, $slideErrors);
    }

    return $errors;
  }

  /**
   * Валидация слайда
   */
  private function validateSlide(array $slide, int $index): array
  {
    $errors = [];

    if (empty($slide['title'])) {
      $errors[] = "Слайд " . ($index + 1) . ": Заголовок обязателен";
    }

    if (isset($slide['overlayOpacity']) && ($slide['overlayOpacity'] < 0 || $slide['overlayOpacity'] > 100)) {
      $errors[] = "Слайд " . ($index + 1) . ": Прозрачность наложения должна быть от 0 до 100%";
    }

    if (isset($slide['overlayColor']) && !preg_match('/^#[0-9A-Fa-f]{6}$/', $slide['overlayColor'])) {
      $errors[] = "Слайд " . ($index + 1) . ": Цвет наложения должен быть в формате HEX (#000000)";
    }

    return $errors;
  }

  /**
   * Валидация галереи
   */
  private function validateGalleryConfig(array $config): array
  {
    $errors = [];

    if (isset($config['images']) && is_array($config['images'])) {
      foreach ($config['images'] as $index => $image) {
        if (empty($image['alt'])) {
          $errors[] = "Изображение " . ($index + 1) . ": Alt-текст обязателен";
        }
      }
    }

    return $errors;
  }

  /**
   * Валидация отзывов
   */
  private function validateTestimonialConfig(array $config): array
  {
    $errors = [];

    if (isset($config['testimonials']) && is_array($config['testimonials'])) {
      foreach ($config['testimonials'] as $index => $testimonial) {
        if (empty($testimonial['name'])) {
          $errors[] = "Отзыв " . ($index + 1) . ": Имя обязательно";
        }
        if (empty($testimonial['text'])) {
          $errors[] = "Отзыв " . ($index + 1) . ": Текст отзыва обязателен";
        }
      }
    }

    return $errors;
  }

  /**
   * Очистить старые изображения при обновлении виджета
   */
  public function cleanupOldImages(array $oldConfig, array $newConfig, string $widgetSlug): void
  {
    $oldImages = $this->extractImagePaths($oldConfig, $widgetSlug);
    $newImages = $this->extractImagePaths($newConfig, $widgetSlug);

    $imagesToDelete = array_diff($oldImages, $newImages);

    foreach ($imagesToDelete as $imagePath) {
      $this->deleteImageByPath($imagePath);
    }
  }

  /**
   * Извлечь пути к изображениям из конфигурации
   */
  private function extractImagePaths(array $config, string $widgetSlug): array
  {
    $paths = [];

    switch ($widgetSlug) {
      case 'hero-slider':
      case 'hero':
        if (isset($config['singleSlide']['backgroundImage'])) {
          $paths[] = $config['singleSlide']['backgroundImage'];
        }
        if (isset($config['slides']) && is_array($config['slides'])) {
          foreach ($config['slides'] as $slide) {
            if (isset($slide['backgroundImage'])) {
              $paths[] = $slide['backgroundImage'];
            }
          }
        }
        break;
    }

    return array_filter($paths, function ($path) {
      return is_string($path) && !str_starts_with($path, 'blob:');
    });
  }

  /**
   * Удалить изображение по пути
   */
  private function deleteImageByPath(string $path): void
  {
    // Удаляем префикс storage/ если есть
    $path = str_replace('storage/', '', $path);

    // Удаляем префикс /storage/ если есть
    $path = ltrim($path, '/');

    if (Storage::disk('public')->exists($path)) {
      Storage::disk('public')->delete($path);
    }
  }
}
