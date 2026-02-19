import { sitesApi } from '@/lib/api/index';
import { useCallback, useState } from 'react';

export const useCustomStylesSettings = (
    siteId: number,
    initialCss: string = '',
) => {
    const [customCss, setCustomCss] = useState(initialCss);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const saveSettings = useCallback(async () => {
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await sitesApi.saveCustomStyles(siteId, {
                custom_css: customCss,
            });
            if (!res.success) {
                setErrors([res.message ?? 'Не удалось сохранить стили']);
            }
        } catch {
            setErrors(['Ошибка при сохранении']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, customCss]);

    return {
        customCss,
        setCustomCss,
        isLoading,
        errors,
        saveSettings,
    };
};
