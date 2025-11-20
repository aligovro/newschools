import { apiClient } from '@/lib/api';

// Типы для API ответов
export interface Region {
    id: number;
    name: string;
    code?: string;
}

export interface Locality {
    id: number;
    name: string;
    region_id: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SlugCheckResponse {
    available: boolean;
}

export interface UploadResponse {
    url: string;
    path: string;
}

export interface MultipleUploadResponse {
    images: UploadResponse[];
}

// API методы для работы с организациями
export const organizationsApi = {
    // Проверка доступности slug
    checkSlug: (slug: string): Promise<SlugCheckResponse> =>
        apiClient
            .post<SlugCheckResponse>('/dashboard/api/check-slug', { slug })
            .then((response) => response.data),

    // Получение регионов
    getRegions: (
        params: { page?: number; per_page?: number; search?: string } = {},
    ): Promise<PaginatedResponse<Region>> =>
        apiClient
            .getPaginated<
                PaginatedResponse<Region>
            >('/dashboard/api/regions', params)
            .then((response) => response.data),

    // Получение городов по региону
    getCitiesByRegion: (
        regionId: number | null,
        params: { page?: number; per_page?: number } = {},
    ): Promise<Locality[]> => {
        if (!regionId) {
            return Promise.resolve([]);
        }
        return apiClient
            .getPaginated<PaginatedResponse<Locality>>(
                '/dashboard/api/localities-by-region',
                {
                    ...params,
                    region_id: regionId,
                },
            )
            .then((response) => response.data.data);
    },

    // Получение пользователей
    getUsers: (
        params: { page?: number; per_page?: number; search?: string } = {},
    ): Promise<PaginatedResponse<User>> =>
        apiClient
            .getPaginated<
                PaginatedResponse<User>
            >('/dashboard/api/users', params)
            .then((response) => response.data),

    // Загрузка логотипа
    uploadLogo: (file: File): Promise<UploadResponse> =>
        apiClient
            .uploadFile<UploadResponse>(
                '/dashboard/api/upload-logo',
                file,
                'logo',
            )
            .then((response) => response.data),

    // Загрузка изображений
    uploadImages: (file: File): Promise<MultipleUploadResponse> =>
        apiClient
            .uploadFile<MultipleUploadResponse>(
                '/dashboard/api/upload-images',
                file,
                'images[]',
            )
            .then((response) => response.data),
};
