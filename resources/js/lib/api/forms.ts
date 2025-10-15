import { apiClient } from '@/lib/api';

// Типы для API ответов форм
export interface FormSubmissionResponse {
    success: boolean;
    message?: string;
    errors?: Record<string, string[]>;
}

export interface FormSubmission {
    id: number;
    form_id: number;
    data: Record<string, unknown>;
    submitted_at: string;
    ip_address?: string;
    user_agent?: string;
}

export interface FormSubmissionsResponse {
    data: FormSubmission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// API методы для форм
export const formsApi = {
    // Отправка формы
    submitForm: (
        siteId: number,
        formId: number,
        data: Record<string, unknown>,
    ): Promise<FormSubmissionResponse> =>
        apiClient
            .post<FormSubmissionResponse>(
                `/sites/${siteId}/forms/${formId}/submit`,
                data,
            )
            .then((response) => response.data),

    // Получение отправок формы
    getFormSubmissions: (
        siteId: number,
        formId: number,
        params: {
            page?: number;
            per_page?: number;
            search?: string;
        } = {},
    ): Promise<FormSubmissionsResponse> =>
        apiClient
            .get<FormSubmissionsResponse>(
                `/sites/${siteId}/forms/${formId}/submissions`,
                { params },
            )
            .then((response) => response.data),

    // Удаление отправки формы
    deleteFormSubmission: (
        siteId: number,
        formId: number,
        submissionId: number,
    ): Promise<void> =>
        apiClient
            .delete(
                `/sites/${siteId}/forms/${formId}/submissions/${submissionId}`,
            )
            .then(() => undefined),
};
