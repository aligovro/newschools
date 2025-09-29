import '../css/app.scss';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';

// Инициализируем тему при загрузке приложения
const initializeTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
        if (savedTheme === 'dark') {
            root.classList.add('dark');
        } else if (savedTheme === 'light') {
            root.classList.remove('dark');
        } else {
            // Системная тема
            if (mediaQuery.matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    applyTheme();

    // Слушаем изменения системной темы только если используется системная тема
    const handleSystemThemeChange = () => {
        if (!savedTheme || savedTheme === 'system') {
            applyTheme();
        }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
};

initializeTheme();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <Provider store={store}>
                <App {...props} />
            </Provider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
