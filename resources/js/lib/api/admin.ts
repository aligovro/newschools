import { apiClient } from '@/lib/api';

// API методы для администрирования
export const adminApi = {
    // Очистка кеша
    clearCache: (): Promise<void> =>
        apiClient
            .post('/admin/global-settings/clear-cache')
            .then(() => undefined),

    // Сброс настроек к значениям по умолчанию
    resetSettings: (): Promise<void> =>
        apiClient.post('/admin/global-settings/reset').then(() => undefined),

    // Экспорт настроек
    exportSettings: (): Promise<Blob> =>
        apiClient
            .get<Blob>('/admin/global-settings/export', {
                responseType: 'blob',
            })
            .then((response) => response.data),
};
