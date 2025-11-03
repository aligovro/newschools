import '../css/app.scss';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from './store';

const appName = import.meta.env.VITE_APP_NAME || 'Родная школа';

createInertiaApp({
    title: (title) => {
        if (!title) return appName;
        if (title === appName) return appName;
        return `${title} - ${appName}`;
    },
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
                <Toaster position="top-right" richColors />
            </Provider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
