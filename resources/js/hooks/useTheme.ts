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
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = () => {
            if (theme === 'system') {
                // Для системной темы используем медиа-запрос
                if (mediaQuery.matches) {
                    root.classList.add('dark');
                    setResolvedTheme('dark');
                } else {
                    root.classList.remove('dark');
                    setResolvedTheme('light');
                }
            } else if (theme === 'dark') {
                // Принудительно темная тема
                root.classList.add('dark');
                setResolvedTheme('dark');
            } else {
                // Принудительно светлая тема
                root.classList.remove('dark');
                setResolvedTheme('light');
            }
        };

        applyTheme();

        // Слушаем изменения системной темы только для системной темы
        const handleChange = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
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
