import { apiClient } from '@/lib/api';
import axios, { AxiosProgressEvent } from 'axios';

// Типы для ответов загрузки изображений
export interface UploadImageResponse {
    success?: boolean;
    message?: string;
    url: string;
    filename?: string;
    path?: string;
    variants?: {
        logo?: string;
        thumbnail?: string;
        small?: string;
        slider?: string;
        gallery?: string;
    };
    data?: {
        original?: string;
        logo?: string;
        thumbnail?: string;
        small?: string;
        slider?: string;
        gallery?: string;
        filename?: string;
        original_name?: string;
        size?: number;
        dimensions?: {
            width: number;
            height: number;
        };
    };
}

export type UploadType = 'logo' | 'slider' | 'gallery';

/**
 * Загрузка файла на сервер
 * @param file - Файл для загрузки
 * @param type - Тип загрузки (logo, slider, gallery)
 * @param onProgress - Callback для отслеживания прогресса загрузки (0-100)
 * @returns Promise с данными загруженного файла
 */
export const uploadFile = async (
    file: File,
    type: UploadType = 'logo',
    onProgress?: (value: number) => void,
): Promise<UploadImageResponse> => {
    try {
        // Определяем URL для загрузки в зависимости от типа
        const uploadUrls: Record<UploadType, string> = {
            logo: '/api/upload/organization-logo',
            slider: '/api/upload/slider-image',
            gallery: '/api/upload/gallery-image',
        };

        const uploadUrl = uploadUrls[type];

        // Создаем FormData
        const formData = new FormData();
        formData.append('image', file);

        // Выполняем загрузку с отслеживанием прогресса
        const response = await apiClient.post<UploadImageResponse>(
            uploadUrl,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent.total && onProgress) {
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        onProgress(percent);
                    }
                },
            },
        );

        // Нормализуем ответ в зависимости от структуры
        const responseData = response.data;

        // Если ответ содержит data обертку, извлекаем данные
        if (responseData.data) {
            return {
                success: responseData.success ?? true,
                message: responseData.message,
                url: responseData.data.original || responseData.url,
                filename: responseData.data.filename,
                path: responseData.path,
                variants: {
                    logo: responseData.data.logo,
                    thumbnail: responseData.data.thumbnail,
                    small: responseData.data.small,
                    slider: responseData.data.slider,
                    gallery: responseData.data.gallery,
                },
                data: responseData.data,
            };
        }

        // Если ответ содержит variants напрямую (для logo)
        if (responseData.variants) {
            return {
                success: true,
                message: responseData.message,
                url: responseData.url,
                filename: responseData.filename,
                path: responseData.path,
                variants: responseData.variants,
            };
        }

        // Базовый ответ
        return {
            success: responseData.success ?? true,
            message: responseData.message,
            url: responseData.url,
            filename: responseData.filename,
            path: responseData.path,
        };
    } catch (err: unknown) {
        console.warn('UploadFileError', err);

        // Обработка отмены запроса
        if (axios.isCancel(err)) {
            throw null;
        }

        // Обработка ошибок API
        if (axios.isAxiosError(err)) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'Ошибка при загрузке файла';
            throw new Error(errorMessage);
        }

        throw err;
    }
};
