<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;

use App\Services\ImageProcessingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ImageUploadController extends Controller
{
    private ImageProcessingService $imageService;

    public function __construct(ImageProcessingService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Загрузить логотип организации
     */
    public function uploadOrganizationLogo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240' // 10MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            // Валидация изображения
            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            // Обработка и сохранение
            $result = $this->imageService->processOrganizationLogo($file);

            return response()->json([
                'message' => 'Image uploaded and processed successfully',
                'filename' => $result['original'],
                'url' => $this->imageService->getImageUrl($result['original']),
                'variants' => [
                    'logo' => $this->imageService->getImageUrl($result['thumbnails']['logo']),
                    'thumbnail' => $this->imageService->getImageUrl($result['thumbnails']['thumbnail']),
                    'small' => $this->imageService->getImageUrl($result['thumbnails']['small']),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить изображение для слайдера
     */
    public function uploadSliderImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            $result = $this->imageService->processSliderImage($file);

            return response()->json([
                'success' => true,
                'message' => 'Изображение слайдера успешно загружено',
                'data' => [
                    'original' => $this->imageService->getImageUrl($result['original']),
                    'slider' => $this->imageService->getImageUrl($result['thumbnails']['slider']),
                    'thumbnail' => $this->imageService->getImageUrl($result['thumbnails']['thumbnail']),
                    'small' => $this->imageService->getImageUrl($result['thumbnails']['small']),
                    'filename' => $result['filename'],
                    'original_name' => $result['original_name'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить изображение для галереи
     */
    public function uploadGalleryImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            $result = $this->imageService->processGalleryImage($file);

            return response()->json([
                'success' => true,
                'message' => 'Изображение галереи успешно загружено',
                'data' => [
                    'original' => $this->imageService->getImageUrl($result['original']),
                    'gallery' => $this->imageService->getImageUrl($result['thumbnails']['gallery']),
                    'thumbnail' => $this->imageService->getImageUrl($result['thumbnails']['thumbnail']),
                    'small' => $this->imageService->getImageUrl($result['thumbnails']['small']),
                    'filename' => $result['filename'],
                    'original_name' => $result['original_name'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить основное изображение новости
     */
    public function uploadNewsCoverImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            $result = $this->imageService->processNewsCoverImage($file);

            return response()->json([
                'success' => true,
                'message' => 'Изображение новости успешно загружено',
                'data' => [
                    'original' => $this->imageService->getImageUrl($result['original']),
                    'cover' => isset($result['thumbnails']['cover'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['cover'])
                        : $this->imageService->getImageUrl($result['original']),
                    'news' => isset($result['thumbnails']['news'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['news'])
                        : null,
                    'thumbnail' => isset($result['thumbnails']['thumbnail'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['thumbnail'])
                        : null,
                    'small' => isset($result['thumbnails']['small'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['small'])
                        : null,
                    'filename' => $result['filename'],
                    'original_name' => $result['original_name'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить изображение для галереи новости
     */
    public function uploadNewsGalleryImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            $result = $this->imageService->processNewsGalleryImage($file);

            return response()->json([
                'success' => true,
                'message' => 'Изображение галереи новости успешно загружено',
                'data' => [
                    'original' => $this->imageService->getImageUrl($result['original']),
                    'gallery' => isset($result['thumbnails']['gallery'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['gallery'])
                        : $this->imageService->getImageUrl($result['original']),
                    'thumbnail' => isset($result['thumbnails']['thumbnail'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['thumbnail'])
                        : null,
                    'small' => isset($result['thumbnails']['small'])
                        ? $this->imageService->getImageUrl($result['thumbnails']['small'])
                        : null,
                    'filename' => $result['filename'],
                    'original_name' => $result['original_name'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Загрузить изображение для текстового виджета
     */
    public function uploadTextWidgetImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|mimes:jpeg,png,jpg,gif,webp,svg|max:10240'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('image');

            $validationErrors = $this->imageService->validateImage($file);
            if (!empty($validationErrors)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации изображения',
                    'errors' => $validationErrors
                ], 422);
            }

            $result = $this->imageService->processTextWidgetImage($file);

            // Возвращаем только путь без домена (начинается с /storage/)
            $imagePath = '/storage/' . $result['original'];

            return response()->json([
                'success' => true,
                'message' => 'Изображение текстового виджета успешно загружено',
                'data' => [
                    'original' => $imagePath,
                    'url' => $imagePath,
                    'filename' => $result['filename'],
                    'original_name' => $result['original_name'],
                    'size' => $result['size'],
                    'dimensions' => $result['dimensions']
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при загрузке изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Удалить изображение
     */
    public function deleteImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'directory' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $deleted = $this->imageService->deleteImage(
                $request->input('filename'),
                $request->input('directory')
            );

            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Изображение успешно удалено'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Не удалось удалить изображение'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при удалении изображения: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получить информацию об изображении
     */
    public function getImageInfo(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'path' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $path = $request->input('path');
            $url = $this->imageService->getImageUrl($path);

            return response()->json([
                'success' => true,
                'data' => [
                    'path' => $path,
                    'url' => $url
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при получении информации об изображении: ' . $e->getMessage()
            ], 500);
        }
    }
}
