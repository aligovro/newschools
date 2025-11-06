<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Str;

class ImageProcessingService
{
    private ImageManager $imageManager;
    private array $config;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver());
        $this->config = config('images', []);
    }

    /**
     * Обработать и сохранить изображение
     */
    public function processAndSave(UploadedFile $file, string $directory = 'images', array $sizes = []): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;

        // Создаем директории если не существуют
        $this->ensureDirectoriesExist($directory);

        // SVG обрабатываем как есть без ресайза/сжатия
        if (strtolower($file->getClientOriginalExtension()) === 'svg' || $file->getMimeType() === 'image/svg+xml') {
            $path = $directory . '/original_' . $filename;
            Storage::disk('public')->putFileAs($directory, $file, 'original_' . $filename);
            return [
                'original' => $path,
                'thumbnails' => [],
                'filename' => $filename,
                'original_name' => $originalName,
                'size' => $file->getSize(),
                'dimensions' => [
                    'width' => null,
                    'height' => null,
                ],
            ];
        }

        // Обрабатываем растровое изображение
        $image = $this->imageManager->read($file->getPathname());

        // Получаем оригинальные размеры
        $originalWidth = $image->width();
        $originalHeight = $image->height();

        $processedImages = [];

        // Сохраняем оригинал (сжатый)
        $originalPath = $this->saveImage($image, $directory, $filename, 'original');
        $processedImages['original'] = $originalPath;

        // Создаем миниатюры для каждого размера
        foreach ($sizes as $sizeName => $sizeConfig) {
            $resizedImage = $this->resizeImage($image, $sizeConfig);
            $thumbnailPath = $this->saveImage($resizedImage, $directory, $filename, $sizeName);
            $processedImages[$sizeName] = $thumbnailPath;
        }

        return [
            'original' => $originalPath,
            'thumbnails' => $processedImages,
            'filename' => $filename,
            'original_name' => $originalName,
            'size' => $file->getSize(),
            'dimensions' => [
                'width' => $originalWidth,
                'height' => $originalHeight
            ]
        ];
    }

    /**
     * Обработать изображение для логотипа организации
     */
    public function processOrganizationLogo(UploadedFile $file): array
    {
        $sizes = [
            'logo' => ['width' => 300, 'height' => 300, 'fit' => 'contain'],
            'thumbnail' => ['width' => 150, 'height' => 150, 'fit' => 'cover'],
            'small' => ['width' => 50, 'height' => 50, 'fit' => 'cover']
        ];

        return $this->processAndSave($file, 'organizations/logos', $sizes);
    }

    /**
     * Обработать изображение для слайдера
     */
    public function processSliderImage(UploadedFile $file): array
    {
        $sizes = [
            'slider' => ['width' => 1200, 'height' => 600, 'fit' => 'cover'],
            'thumbnail' => ['width' => 300, 'height' => 150, 'fit' => 'cover'],
            'small' => ['width' => 150, 'height' => 75, 'fit' => 'cover']
        ];

        return $this->processAndSave($file, 'sliders', $sizes);
    }

    /**
     * Обработать изображение для галереи
     */
    public function processGalleryImage(UploadedFile $file): array
    {
        $sizes = [
            'gallery' => ['width' => 800, 'height' => 600, 'fit' => 'cover'],
            'thumbnail' => ['width' => 200, 'height' => 150, 'fit' => 'cover'],
            'small' => ['width' => 100, 'height' => 75, 'fit' => 'cover']
        ];

        return $this->processAndSave($file, 'galleries', $sizes);
    }

    /**
     * Обработать изображение для текстового виджета
     * Сохраняет как есть, если размеры <= 1000px, иначе режет до 1000px с сохранением пропорций
     */
    public function processTextWidgetImage(UploadedFile $file): array
    {
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . time() . '.' . $extension;
        $directory = 'text-widgets';
        $maxDimension = 1000;

        // Создаем директорию если не существует
        if (!Storage::disk('public')->exists($directory)) {
            Storage::disk('public')->makeDirectory($directory, 0755, true);
        }

        // SVG обрабатываем как есть без ресайза/сжатия
        if (strtolower($extension) === 'svg' || $file->getMimeType() === 'image/svg+xml') {
            $path = $directory . '/' . $filename;
            Storage::disk('public')->putFileAs($directory, $file, $filename);
            return [
                'original' => $path,
                'thumbnails' => [],
                'filename' => $filename,
                'original_name' => $originalName,
                'size' => $file->getSize(),
                'dimensions' => [
                    'width' => null,
                    'height' => null,
                ],
            ];
        }

        // Обрабатываем растровое изображение
        $image = $this->imageManager->read($file->getPathname());
        $originalWidth = $image->width();
        $originalHeight = $image->height();

        // Вычисляем финальные размеры
        $finalWidth = $originalWidth;
        $finalHeight = $originalHeight;

        // Проверяем, нужно ли резать изображение
        if ($originalWidth > $maxDimension || $originalHeight > $maxDimension) {
            // Находим максимальную сторону
            $maxSide = max($originalWidth, $originalHeight);
            
            // Вычисляем коэффициент масштабирования
            $scale = $maxDimension / $maxSide;
            
            // Вычисляем новые размеры с сохранением пропорций
            $finalWidth = (int) round($originalWidth * $scale);
            $finalHeight = (int) round($originalHeight * $scale);

            // Ресайзим изображение с сохранением пропорций
            $image->scale($finalWidth, $finalHeight);
        }

        // Сохраняем изображение с сохранением оригинального формата (если возможно) или конвертируем в JPEG
        $quality = 85; // Качество для текстового виджета
        
        // Определяем формат сохранения и обновляем расширение файла при необходимости
        if (in_array(strtolower($extension), ['png', 'webp'])) {
            if (strtolower($extension) === 'png') {
                $image->toPng();
            } else {
                $image->toWebp($quality);
            }
        } else {
            // Конвертируем в JPEG для всех остальных форматов
            $image->toJpeg($quality);
            // Обновляем имя файла с правильным расширением
            $filename = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '_' . time() . '.jpg';
        }
        
        $path = $directory . '/' . $filename;
        Storage::disk('public')->put($path, $image->encode());

        return [
            'original' => $path,
            'thumbnails' => [],
            'filename' => $filename,
            'original_name' => $originalName,
            'size' => Storage::disk('public')->size($path),
            'dimensions' => [
                'width' => $finalWidth,
                'height' => $finalHeight,
            ],
        ];
    }

    /**
     * Изменить размер изображения
     */
    private function resizeImage($image, array $config): \Intervention\Image\Image
    {
        $width = $config['width'] ?? null;
        $height = $config['height'] ?? null;
        $fit = $config['fit'] ?? 'cover';

        if (!$width && !$height) {
            return $image;
        }

        switch ($fit) {
            case 'cover':
                return $image->cover($width, $height);
            case 'contain':
                return $image->contain($width, $height);
            case 'fill':
                return $image->resize($width, $height);
            case 'fit':
                return $image->fit($width, $height);
            default:
                return $image->resize($width, $height);
        }
    }

    /**
     * Сохранить изображение
     */
    private function saveImage($image, string $directory, string $filename, string $size): string
    {
        $path = $directory . '/' . $size . '_' . $filename;

        // Определяем качество сжатия
        $quality = $this->getQualityForSize($size);

        // Конвертируем в JPEG для лучшего сжатия
        $image->toJpeg($quality);

        // Сохраняем в storage
        Storage::disk('public')->put($path, $image->encode());

        return $path;
    }

    /**
     * Получить качество сжатия для размера
     */
    private function getQualityForSize(string $size): int
    {
        return match ($size) {
            'original' => 95,
            'logo', 'slider', 'gallery', 'content' => 85,
            'thumbnail' => 75,
            'small' => 70,
            default => 80
        };
    }

    /**
     * Создать директории если не существуют
     */
    private function ensureDirectoriesExist(string $directory): void
    {
        $sizes = ['original', 'logo', 'slider', 'gallery', 'content', 'thumbnail', 'small'];

        foreach ($sizes as $size) {
            $path = $directory . '/' . $size;
            if (!Storage::disk('public')->exists($path)) {
                Storage::disk('public')->makeDirectory($path, 0755, true);
            }
        }
    }

    /**
     * Удалить изображение и все его варианты
     */
    public function deleteImage(string $filename, string $directory): bool
    {
        // Для текстового виджета файлы сохраняются без префиксов размеров
        if ($directory === 'text-widgets') {
            $path = $directory . '/' . $filename;
            if (Storage::disk('public')->exists($path)) {
                return Storage::disk('public')->delete($path);
            }
            return false;
        }

        // Для остальных типов удаляем все варианты с префиксами
        $sizes = ['original', 'logo', 'slider', 'gallery', 'content', 'thumbnail', 'small'];
        $deleted = true;

        foreach ($sizes as $size) {
            $path = $directory . '/' . $size . '_' . $filename;
            if (Storage::disk('public')->exists($path)) {
                $deleted = Storage::disk('public')->delete($path) && $deleted;
            }
        }

        return $deleted;
    }

    /**
     * Получить URL изображения
     */
    public function getImageUrl(string $path): string
    {
        return asset('storage/' . $path);
    }

    /**
     * Получить только путь к изображению (без домена)
     */
    public function getImagePath(string $path): string
    {
        return $path;
    }

    /**
     * Валидация изображения
     */
    public function validateImage(UploadedFile $file): array
    {
        $errors = [];

        // Проверяем размер файла (максимум 10MB)
        if ($file->getSize() > 10 * 1024 * 1024) {
            $errors[] = 'Размер файла не должен превышать 10MB';
        }

        // Проверяем тип файла
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!in_array($file->getMimeType(), $allowedTypes)) {
            $errors[] = 'Разрешены только файлы: JPEG, PNG, GIF, WebP, SVG';
        }

        // Проверяем размеры изображения
        // Для SVG пропускаем проверку размеров
        if ($file->getMimeType() === 'image/svg+xml') {
            return $errors;
        }

        try {
            $image = $this->imageManager->read($file->getPathname());
            $width = $image->width();
            $height = $image->height();

            // Более гибкие ограничения по размеру
            if ($width < 10 || $height < 10) {
                $errors[] = 'Минимальный размер изображения: 10x10 пикселей';
            }

            if ($width > 8000 || $height > 8000) {
                $errors[] = 'Максимальный размер изображения: 8000x8000 пикселей';
            }
        } catch (\Exception $e) {
            $errors[] = 'Не удалось обработать изображение';
        }

        return $errors;
    }
}
