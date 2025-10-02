import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface SeoSettingsData {
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
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
            await router.post(`/sites/${siteId}/settings/seo`, settings, {
                onSuccess: () => {
                    console.log('SEO настройки сохранены');
                },
                onError: (errors) => {
                    const errorMessages = Object.values(errors).flat();
                    setErrors(errorMessages);
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            });
        } catch (error) {
            console.error('Ошибка при сохранении SEO настроек:', error);
            setErrors(['Ошибка при сохранении настроек']);
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
