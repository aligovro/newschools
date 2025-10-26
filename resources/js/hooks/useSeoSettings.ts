import { sitesApi } from '@/lib/api/index';
import { useCallback, useState } from 'react';

interface SeoSettingsData {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    og_title?: string;
    og_description?: string;
    og_type?: string;
    og_image?: string;
    twitter_card?: string;
    twitter_title?: string;
    twitter_description?: string;
    twitter_image?: string;
}

interface UseSeoSettingsReturn {
    settings: SeoSettingsData;
    isLoading: boolean;
    errors: string[];
    updateSetting: (key: keyof SeoSettingsData, value: string) => void;
    saveSettings: () => Promise<void>;
}

export const useSeoSettings = (
    siteId: number,
    initialSettings: SeoSettingsData = {},
): UseSeoSettingsReturn => {
    const [settings, setSettings] = useState<SeoSettingsData>(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const updateSetting = useCallback(
        (key: keyof SeoSettingsData, value: string) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setErrors([]); // Очищаем ошибки при изменении
        },
        [],
    );

    const saveSettings = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await sitesApi.saveSeoSettings(siteId, settings);
            if (!res.success) {
                setErrors([res.message || 'Не удалось сохранить настройки']);
            } else if ((res as any).data) {
                // Обновляем локальное состояние тем, что вернул сервер
                setSettings((res as any).data as SeoSettingsData);
            }
        } catch (error) {
            console.error('Ошибка при сохранении SEO настроек:', error);
            setErrors(['Ошибка при сохранении настроек']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, settings]);

    return {
        settings,
        isLoading,
        errors,
        updateSetting,
        saveSettings,
    };
};
