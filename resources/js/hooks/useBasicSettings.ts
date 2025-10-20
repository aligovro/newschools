import { sitesApi } from '@/lib/api/index';
import { useCallback, useState } from 'react';

interface BasicSettingsData {
    name: string;
    description: string;
}

interface UseBasicSettingsReturn {
    settings: BasicSettingsData;
    isLoading: boolean;
    errors: string[];
    updateSetting: (key: keyof BasicSettingsData, value: string) => void;
    saveSettings: () => Promise<void>;
}

export const useBasicSettings = (
    siteId: number,
    initialSettings: BasicSettingsData,
): UseBasicSettingsReturn => {
    const [settings, setSettings] =
        useState<BasicSettingsData>(initialSettings);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const updateSetting = useCallback(
        (key: keyof BasicSettingsData, value: string) => {
            setSettings((prev) => ({ ...prev, [key]: value }));
            setErrors([]); // Очищаем ошибки при изменении
        },
        [],
    );

    const saveSettings = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await sitesApi.saveBasicSettings(siteId, settings);
            if (!res.success) {
                setErrors([res.message || 'Не удалось сохранить настройки']);
            }
        } catch (error) {
            console.error('Ошибка при сохранении основных настроек:', error);
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
