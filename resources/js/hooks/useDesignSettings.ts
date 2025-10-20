import { sitesApi } from '@/lib/api/index';
import { useCallback, useState } from 'react';

interface DesignSettingsData {
    color_scheme?: string;
    font_family?: string;
    font_size?: string;
    layout?: string;
    header_style?: string;
    footer_style?: string;
}

interface UseDesignSettingsReturn {
    settings: DesignSettingsData;
    isLoading: boolean;
    errors: string[];
    updateSetting: (key: keyof DesignSettingsData, value: string) => void;
    saveSettings: () => Promise<void>;
}

export const useDesignSettings = (
    siteId: number,
    initialSettings: DesignSettingsData = {},
): UseDesignSettingsReturn => {
    const [settings, setSettings] =
        useState<DesignSettingsData>(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const updateSetting = useCallback(
        (key: keyof DesignSettingsData, value: string) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setErrors([]); // Очищаем ошибки при изменении
        },
        [],
    );

    const saveSettings = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await sitesApi.saveDesignSettings(siteId, settings);
            if (!res.success) {
                setErrors([res.message || 'Не удалось сохранить настройки']);
            }
        } catch (error) {
            console.error('Ошибка при сохранении настроек дизайна:', error);
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
