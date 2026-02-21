import axios, { AxiosProgressEvent } from 'axios';
import Cookies from 'js-cookie';

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
        cover?: string;
        news?: string;
    };
    data?: {
        original?: string;
        logo?: string;
        thumbnail?: string;
        small?: string;
        slider?: string;
        gallery?: string;
        cover?: string;
        news?: string;
        filename?: string;
        original_name?: string;
        size?: number;
        dimensions?: {
            width: number;
            height: number;
        };
    };
}

export type UploadType =
    | 'logo'
    | 'slider'
    | 'gallery'
    | 'text-widget'
    | 'news-cover'
    | 'news-gallery';

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
        // Используем полные пути, так как маршруты находятся в группе /dashboard
        const uploadUrls: Record<UploadType, string> = {
            logo: '/dashboard/api/upload/organization-logo',
            slider: '/dashboard/api/upload/slider-image',
            gallery: '/dashboard/api/upload/gallery-image',
            'text-widget': '/dashboard/api/upload/text-widget-image',
            'news-cover': '/dashboard/api/upload/news-cover-image',
            'news-gallery': '/dashboard/api/upload/news-gallery-image',
        };

        const uploadUrl = uploadUrls[type];

        // Создаем FormData
        const formData = new FormData();
        formData.append('image', file);

        // Получаем CSRF токен из cookies для Laravel Sanctum
        const csrfToken = Cookies.get('XSRF-TOKEN');
        const headers: Record<string, string> = {
            'Content-Type': 'multipart/form-data',
            'X-Requested-With': 'XMLHttpRequest',
        };

        if (csrfToken) {
            headers['X-XSRF-TOKEN'] = csrfToken;
        }

        // Используем axios напрямую с полным путем, чтобы избежать конфликта с baseURL apiClient
        const response = await axios.post<UploadImageResponse>(
            uploadUrl,
            formData,
            {
                headers,
                withCredentials: true,
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
                    cover: responseData.data.cover,
                    news: responseData.data.news,
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

/** Ответ загрузки логотипа для банковских реквизитов */
export interface UploadBankRequisitesLogoResponse {
    path: string;
    url: string;
}

/**
 * Загрузка логотипа для PDF банковских реквизитов
 * Использует тот же паттерн CSRF/axios, что и uploadFile
 */
export const uploadBankRequisitesLogo = async (
    file: File,
): Promise<UploadBankRequisitesLogoResponse> => {
    const csrfToken = Cookies.get('XSRF-TOKEN');
    const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken;

    const formData = new FormData();
    formData.append('logo', file);

    const { data } = await axios.post<{ success?: boolean; path?: string; url?: string; message?: string }>(
        '/dashboard/api/upload/bank-requisites-logo',
        formData,
        { headers, withCredentials: true },
    );

    if (!data?.success || !data?.path) {
        throw new Error(data?.message || 'Ошибка загрузки');
    }
    return { path: data.path, url: data.url || `/storage/${data.path}` };
};
