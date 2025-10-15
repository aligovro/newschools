import { apiClient } from '@/lib/api';

// API методы для изображений виджетов
export const widgetImagesApi = {
    // Загрузка изображения виджета
    uploadImage: (
        baseUrl: string,
        formData: FormData,
    ): Promise<{
        success: boolean;
        data?: any;
        message?: string;
        errors?: string[];
    }> => {
        return apiClient
            .post<{
                success: boolean;
                data?: any;
                message?: string;
                errors?: string[];
            }>(`${baseUrl}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => response.data);
    },

    // Удаление изображения виджета
    deleteImage: (
        baseUrl: string,
        imageUrl: string,
    ): Promise<{ success: boolean }> =>
        apiClient
            .post<{
                success: boolean;
            }>(`${baseUrl}/delete`, { image_url: imageUrl })
            .then((response) => response.data),
};
