import { organizationsApi } from '@/lib/api/organizations';
import { useCallback } from 'react';

// Хуки для работы с API организаций
export const useOrganizationsApi = () => {
    // Проверка slug
    const checkSlug = useCallback(async (slug: string): Promise<boolean> => {
        try {
            const result = await organizationsApi.checkSlug(slug);
            return result.available;
        } catch (error) {
            console.error('Error checking slug:', error);
            return false;
        }
    }, []);

    // Загрузка логотипа
    const uploadLogo = useCallback(async (file: File): Promise<string> => {
        try {
            const result = await organizationsApi.uploadLogo(file);
            return result.url;
        } catch (error) {
            console.error('Logo upload error:', error);
            throw error;
        }
    }, []);

    // Загрузка изображений
    const uploadImages = useCallback(async (file: File): Promise<string> => {
        try {
            const result = await organizationsApi.uploadImages(file);
            return result.images[0]?.url || '';
        } catch (error) {
            console.error('Images upload error:', error);
            throw error;
        }
    }, []);

    return {
        checkSlug,
        uploadLogo,
        uploadImages,
    };
};

// Хук для работы с регионами
export const useRegionsApi = () => {
    const getRegions = useCallback(
        async (
            params: { page?: number; per_page?: number; search?: string } = {},
        ) => {
            try {
                return await organizationsApi.getRegions(params);
            } catch (error) {
                console.error('Error fetching regions:', error);
                throw error;
            }
        },
        [],
    );

    return { getRegions };
};

// Хук для работы с городами
export const useCitiesApi = () => {
    const getCitiesByRegion = useCallback(
        async (
            regionId: number | null,
            params: { page?: number; per_page?: number } = {},
        ) => {
            try {
                return await organizationsApi.getCitiesByRegion(
                    regionId,
                    params,
                );
            } catch (error) {
                console.error('Error fetching localities:', error);
                throw error;
            }
        },
        [],
    );

    return { getCitiesByRegion };
};

// Хук для работы с пользователями
export const useUsersApi = () => {
    const getUsers = useCallback(
        async (
            params: { page?: number; per_page?: number; search?: string } = {},
        ) => {
            try {
                return await organizationsApi.getUsers(params);
            } catch (error) {
                console.error('Error fetching users:', error);
                throw error;
            }
        },
        [],
    );

    return { getUsers };
};

export default useOrganizationsApi;
