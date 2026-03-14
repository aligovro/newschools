import { sitesApi } from '@/lib/api/index';
import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseTemplateSettingsReturn {
    template: string;
    isLoading: boolean;
    errors: string[];
    setTemplate: (value: string) => void;
    saveTemplate: () => Promise<void>;
}

export const useTemplateSettings = (
    siteId: number,
    initialTemplate: string = '',
): UseTemplateSettingsReturn => {
    const [template, setTemplateState] = useState(initialTemplate);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const setTemplate = useCallback((value: string) => {
        setTemplateState(value);
        setErrors([]);
    }, []);

    const saveTemplate = useCallback(async () => {
        if (!template?.trim()) return;
        setIsLoading(true);
        setErrors([]);
        try {
            const res = await sitesApi.saveTemplateSettings(siteId, template);
            if (!res.success) {
                setErrors([res.message || 'Не удалось сохранить шаблон']);
            } else {
                router.reload();
            }
        } catch (error) {
            console.error('Ошибка при сохранении шаблона:', error);
            setErrors(['Ошибка при сохранении шаблона']);
        } finally {
            setIsLoading(false);
        }
    }, [siteId, template]);

    return {
        template: template || initialTemplate,
        isLoading,
        errors,
        setTemplate,
        saveTemplate,
    };
};
