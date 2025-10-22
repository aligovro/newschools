import { widgetImagesApi } from '@/lib/api/index';

interface ImageUploadResponse {
    success: boolean;
    data?: {
        url: string;
        thumbnails: Record<string, string>;
        filename: string;
        original_name: string;
        size: number;
        dimensions: {
            width: number;
            height: number;
        };
    };
    message?: string;
    errors?: string[];
}

interface ImageDeleteResponse {
    success: boolean;
    message?: string;
    errors?: string[];
}

class WidgetImageService {
    private baseUrl = '/widgets/images';

    /**
     * Загрузить изображение для виджета
     */
    async uploadImage(
        file: File,
        widgetSlug: string,
        imageType: 'background' | 'avatar' | 'gallery',
        slideId?: string,
    ): Promise<ImageUploadResponse> {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('widget_slug', widgetSlug);
        formData.append('image_type', imageType);
        if (slideId) {
            formData.append('slide_id', slideId);
        }

        try {
            const data: ImageUploadResponse = await widgetImagesApi.uploadImage(
                this.baseUrl,
                formData,
            );

            if (!data.success) {
                throw new Error(
                    data.message || 'Ошибка при загрузке изображения',
                );
            }

            return data;
        } catch (error) {
            console.error('Error uploading image:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Ошибка при загрузке изображения',
            };
        }
    }

    /**
     * Удалить изображение виджета
     */
    async deleteImage(
        imagePath: string,
        widgetSlug: string,
    ): Promise<ImageDeleteResponse> {
        try {
            const data: ImageDeleteResponse = await widgetImagesApi.deleteImage(
                this.baseUrl,
                imagePath,
            );

            if (!data.success) {
                throw new Error(
                    data.message || 'Ошибка при удалении изображения',
                );
            }

            return data;
        } catch (error) {
            console.error('Error deleting image:', error);
            return {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Ошибка при удалении изображения',
            };
        }
    }

    /**
     * Обработать изображение для Hero виджета
     */
    async processHeroImage(
        file: File,
        slideId?: string,
    ): Promise<ImageUploadResponse> {
        return this.uploadImage(file, 'hero-slider', 'background', slideId);
    }

    /**
     * Обработать изображение для галереи
     */
    async processGalleryImage(file: File): Promise<ImageUploadResponse> {
        return this.uploadImage(file, 'gallery', 'gallery');
    }

    /**
     * Обработать аватар для отзывов
     */
    async processTestimonialAvatar(file: File): Promise<ImageUploadResponse> {
        return this.uploadImage(file, 'testimonials', 'avatar');
    }

    /**
     * Получить CSRF токен
     */
    private getCsrfToken(): string {
        const token = document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute('content');

        if (!token) {
            throw new Error('CSRF token not found');
        }

        return token;
    }

    /**
     * Валидировать файл изображения
     */
    validateImageFile(file: File): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
        ];

        if (file.size > maxSize) {
            errors.push('Размер файла не должен превышать 10MB');
        }

        if (!allowedTypes.includes(file.type)) {
            errors.push('Разрешены только файлы: JPEG, PNG, GIF, WebP, SVG');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

export const widgetImageService = new WidgetImageService();
export default widgetImageService;
