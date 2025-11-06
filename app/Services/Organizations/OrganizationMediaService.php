<?php

namespace App\Services\Organizations;

use App\Models\Organization;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class OrganizationMediaService
{
    private const IMAGE_STORAGE_PATH = 'organizations/images';
    private const MAX_IMAGES = 20;

    /**
     * Обновить галерею изображений организации
     */
    public function updateGallery(Organization $organization, array $existingImages = [], array $newImages = []): array
    {
        $finalImages = [];

        // Обрабатываем существующие изображения (сохраняем порядок)
        if (!empty($existingImages)) {
            $finalImages = array_map(function ($path) {
                return ltrim(str_replace('/storage/', '', $path), '/');
            }, $existingImages);
        }

        // Обрабатываем новые изображения
        if (!empty($newImages)) {
            foreach ($newImages as $image) {
                if ($image instanceof UploadedFile) {
                    $finalImages[] = $image->store(self::IMAGE_STORAGE_PATH, 'public');
                }
            }
        }

        // Ограничиваем максимальное количество изображений
        $finalImages = array_slice($finalImages, 0, self::MAX_IMAGES);

        return $finalImages;
    }

    /**
     * Удалить изображение из галереи
     */
    public function removeImageFromGallery(Organization $organization, string $imagePath): bool
    {
        $images = $organization->images ?? [];

        // Удаляем из массива
        $images = array_filter($images, function ($img) use ($imagePath) {
            return $img !== $imagePath;
        });

        // Обновляем организацию
        $organization->update(['images' => array_values($images)]);

        // Удаляем физический файл
        if (Storage::disk('public')->exists($imagePath)) {
            return Storage::disk('public')->delete($imagePath);
        }

        return true;
    }

    /**
     * Получить все изображения галереи с полными путями
     */
    public function getGalleryImages(Organization $organization): array
    {
        $images = $organization->images ?? [];

        return array_map(function ($image) {
            return [
                'path' => $image,
                'url' => Storage::disk('public')->url($image),
            ];
        }, $images);
    }
}
