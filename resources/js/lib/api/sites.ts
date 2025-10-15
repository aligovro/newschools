import { apiClient } from '@/lib/api';

// API методы для сайтов
export const sitesApi = {
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
    ): Promise<void> =>
        apiClient
            .post(
                `/dashboard/sites/${siteId}/widgets/${widgetId}/move`,
                updates,
            )
            .then(() => undefined),

    // Получение URL для предпросмотра сайта
    getPreviewUrl: (siteId: number): Promise<{ preview_url: string }> =>
        apiClient
            .get<{ preview_url: string }>(`/sites/${siteId}/preview`)
            .then((response) => response.data),

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
