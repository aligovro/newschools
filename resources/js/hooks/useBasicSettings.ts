import { router } from '@inertiajs/react';
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
            await router.post(`/sites/${siteId}/settings/basic`, settings, {
                onSuccess: () => {
                    console.log('Основные настройки сохранены');
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
            console.error('Ошибка при сохранении основных настроек:', error);
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
