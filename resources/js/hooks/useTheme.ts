import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
        'light',
    );

    useEffect(() => {
        // Получаем сохраненную тему из localStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Если тема не сохранена, используем системную
            setTheme('system');
        }
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        
        // Всегда используем светлую тему, игнорируем системные настройки
        root.classList.remove('dark');
        setResolvedTheme('light');
    }, [theme]);

    const setThemeAndSave = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return {
        theme,
        resolvedTheme,
        setTheme: setThemeAndSave,
    };
};
