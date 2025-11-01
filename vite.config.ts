import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.scss', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        wayfinder({
            formVariants: true,
        }),
    ],
    css: {
        preprocessorOptions: {
            scss: {
                // Подавляем legacy warnings для @import
                // Это рекомендованный подход для проектов с Tailwind CSS
                quietDeps: true,
                silenceDeprecations: ['import', 'global-builtin'],
            },
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
            '@/components': path.resolve(__dirname, 'resources/js/components'),
            '@/pages': path.resolve(__dirname, 'resources/js/pages'),
            '@/layouts': path.resolve(__dirname, 'resources/js/layouts'),
            '@/hooks': path.resolve(__dirname, 'resources/js/hooks'),
            '@/types': path.resolve(__dirname, 'resources/js/types'),
            '@/routes': path.resolve(__dirname, 'resources/js/routes'),
            '@/lib': path.resolve(__dirname, 'resources/js/lib'),
            '@/store': path.resolve(__dirname, 'resources/js/store'),
            '@css': path.resolve(__dirname, 'resources/css'),
        },
    },
});
