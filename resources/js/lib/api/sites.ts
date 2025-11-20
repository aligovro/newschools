import { apiClient } from '@/lib/api';

// API методы для сайтов
export const sitesApi = {
    // Сохранение основных настроек сайта
    saveBasicSettings: (
        siteId: number,
        settings: {
            name: string;
            description?: string;
            favicon?: string;
        },
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/settings/basic`, settings)
            .then((response) => response.data),

    // Сохранение SEO настроек сайта
    saveSeoSettings: (
        siteId: number,
        settings: {
            seo_title?: string;
            seo_description?: string;
            seo_keywords?: string;
            og_title?: string;
            og_description?: string;
            og_type?: string;
            og_image?: string;
            twitter_card?: string;
            twitter_title?: string;
            twitter_description?: string;
            twitter_image?: string;
        },
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/settings/seo`, settings)
            .then((response) => response.data),

    // Сохранение настроек дизайна
    saveDesignSettings: (
        siteId: number,
        settings: {
            color_scheme?: string;
            font_family?: string;
            font_size?: string;
            layout?: string;
            header_style?: string;
            footer_style?: string;
        },
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/settings/design`, settings)
            .then((response) => response.data),
    // Сохранение настроек макета сайта
    saveLayoutSettings: (
        siteId: number,
        updates: { sidebar_position?: 'left' | 'right' },
    ): Promise<void> =>
        apiClient
            .post(`/sites/${siteId}/settings/layout`, updates)
            .then(() => undefined),

    // Перемещение виджета
    moveWidget: (
        siteId: number,
        widgetId: number,
        updates: {
            position_slug: string;
            order: number;
        },
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/dashboard/sites/${siteId}/widgets/${widgetId}/move`, updates)
            .then((response) => response.data),

    // Получение URL для предпросмотра сайта (устаревший метод, используйте getAdminViewUrl)
    getPreviewUrl: (siteId: number): Promise<{ preview_url: string }> =>
        apiClient
            .get<{
                success: boolean;
                data: { preview_url: string };
            }>(`/sites/${siteId}/preview`)
            .then((response) => ({
                preview_url: response.data.data.preview_url,
            })),

    // Получение URL для админского просмотра сайта (включая неопубликованные)
    getAdminViewUrl: (siteId: number): string => {
        return `/dashboard/sites/${siteId}/view`;
    },

    // Получение конфигурации виджетов сайта
    getConfig: (siteId: number): Promise<{ widgets: unknown[] }> =>
        apiClient
            .get<{
                success: boolean;
                data: unknown[];
            }>(`/sites/${siteId}/config`)
            .then((response) => ({ widgets: response.data.data || [] })),

    // Сохранение настроек Telegram
    saveTelegramSettings: (
        siteId: number,
        settings: Record<string, unknown>,
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/settings/telegram`, settings)
            .then((response) => response.data),

    // Сохранение настроек платежей
    savePaymentSettings: (
        siteId: number,
        settings: Record<string, unknown>,
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/settings/payments`, settings)
            .then((response) => response.data),

    // Добавление виджета на сайт
    addWidget: (
        siteId: number,
        widgetData: {
            widget_slug: string;
            position_slug: string;
            config: Record<string, unknown>;
        },
    ): Promise<{ success: boolean; widget?: unknown; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                widget?: unknown;
                message?: string;
            }>(`/dashboard/sites/${siteId}/widgets`, widgetData)
            .then((response) => response.data),

    // Обновление виджета
    updateWidget: (
        siteId: number,
        widgetId: number,
        updates: Record<string, unknown>,
    ): Promise<{ success: boolean; message?: string; widget?: unknown }> =>
        apiClient
            .put<{
                success: boolean;
                message?: string;
                widget?: unknown;
            }>(`/dashboard/sites/${siteId}/widgets/${widgetId}`, updates)
            .then((response) => response.data),

    // Удаление виджета
    deleteWidget: (
        siteId: number,
        widgetId: number,
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .delete<{
                success: boolean;
                message?: string;
            }>(`/dashboard/sites/${siteId}/widgets/${widgetId}`)
            .then((response) => response.data),

    // Сохранение конфигурации сайта
    saveSiteConfig: (
        siteId: number,
        config: { widgets: unknown[] },
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/sites/${siteId}/save-config`, config)
            .then((response) => response.data),
};
