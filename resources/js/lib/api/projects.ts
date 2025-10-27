// Экспорт методов API для проектов
import { apiClient } from '@/lib/api';

export const projectsApi = {
    // Сохранение платежных настроек проекта
    savePaymentSettings: (
        projectId: number,
        settings: Record<string, unknown>,
    ): Promise<{ success: boolean; message?: string }> =>
        apiClient
            .post<{
                success: boolean;
                message?: string;
            }>(`/projects/${projectId}/settings/payments`, settings)
            .then((response) => response.data),
};
