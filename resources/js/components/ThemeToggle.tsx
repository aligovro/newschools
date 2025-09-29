import { useTheme } from '@/hooks/useTheme';
import React from 'react';

const ThemeToggle: React.FC = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { value: 'light' as const, label: 'Светлая', icon: '☀️' },
        { value: 'dark' as const, label: 'Темная', icon: '🌙' },
        { value: 'system' as const, label: 'Системная', icon: '💻' },
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Тема:
            </span>
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
                {themes.map((themeOption) => (
                    <button
                        key={themeOption.value}
                        onClick={() => setTheme(themeOption.value)}
                        className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                            theme === themeOption.value
                                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                        } `}
                    >
                        <span>{themeOption.icon}</span>
                        <span>{themeOption.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ThemeToggle;
