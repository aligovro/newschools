import { apiClient } from '@/lib/api';

// Типы для API ответов системы виджетов
export interface Widget {
    id: number;
    name: string;
    widget_slug: string;
    description: string;
    category: string;
    icon?: string;
    thumbnail?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WidgetResponse {
    success: boolean;
    data: Widget[];
    message?: string;
}

export interface WidgetPosition {
    id: number;
    template_id: number;
    name: string;
    slug: string;
    description: string;
    area: string;
    order: number;
    allowed_widgets: string[];
    layout_config: Record<string, unknown>;
    is_required: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface WidgetPositionsResponse {
    success: boolean;
    data: WidgetPosition[];
    message?: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    is_active: boolean;
    config: Record<string, unknown>;
}

export interface DonationWidgetData {
    terminology: Record<string, string>;
    fundraiser?: {
        id: number;
        name: string;
        description: string;
        target_amount?: number;
        current_amount?: number;
    };
}

export interface DonationRequest {
    amount: number;
    currency: string;
    payment_method_slug: string;
    fundraiser_id?: number;
    project_id?: number;
    donor_name?: string;
    donor_email?: string;
    donor_phone?: string;
    donor_message?: string;
    is_anonymous: boolean;
    is_recurring: boolean;
    recurring_period?: string;
    send_receipt: boolean;
    success_url: string;
    failure_url: string;
}

export interface DonationResponse {
    success: boolean;
    payment_url?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

// API методы для системы виджетов
export const widgetsSystemApi = {
    // Получение всех виджетов
    getWidgets: (): Promise<WidgetResponse> =>
        apiClient
            .get<WidgetResponse>('/widgets')
            .then((response) => response.data),

    // Получение позиций виджетов
    getWidgetPositions: (
        templateId?: number,
    ): Promise<WidgetPositionsResponse> => {
        const params = templateId ? { template_id: templateId } : {};
        return apiClient
            .get<WidgetPositionsResponse>('/widgets/positions', { params })
            .then((response) => response.data);
    },

    // Обновление layout_config позиции
    updatePositionLayout: (
        positionId: number,
        layoutConfig: Record<string, unknown>,
    ): Promise<{ success: boolean; data: WidgetPosition }> =>
        apiClient
            .put<{
                success: boolean;
                data: WidgetPosition;
            }>(`/widgets/positions/${positionId}/layout`, { layout_config: layoutConfig })
            .then((response) => response.data),

    // Получение методов оплаты для виджета пожертвований
    getPaymentMethods: (organizationId: number): Promise<PaymentMethod[]> =>
        apiClient
            .get<
                PaymentMethod[]
            >(`/organizations/${organizationId}/payment-methods`)
            .then((response) => response.data),

    // Получение данных виджета пожертвований
    getDonationWidgetData: (
        organizationId: number,
        params: { fundraiser_id?: number } = {},
    ): Promise<DonationWidgetData> =>
        apiClient
            .get<DonationWidgetData>(
                `/organizations/${organizationId}/donation-widget/data`,
                {
                    params,
                },
            )
            .then((response) => response.data),

    // Получение методов оплаты для виджета пожертвований
    getDonationWidgetPaymentMethods: (
        organizationId: number,
    ): Promise<PaymentMethod[]> =>
        apiClient
            .get<{
                success: boolean;
                data: PaymentMethod[];
            }>(`/organizations/${organizationId}/donation-widget/payment-methods`)
            .then((response) => response.data.data),

    // Публичные методы оплаты (без организации)
    getDonationWidgetPaymentMethodsPublic: (): Promise<PaymentMethod[]> =>
        apiClient
            .get<{
                success: boolean;
                data: PaymentMethod[];
            }>(`/public/payment-methods`)
            .then((response) => response.data.data),

    // Отправка пожертвования
    submitDonation: (
        organizationId: number,
        donationData: DonationRequest,
    ): Promise<DonationResponse> =>
        apiClient
            .post<DonationResponse>(
                `/organizations/${organizationId}/donation-widget/donate`,
                donationData,
            )
            .then((response) => response.data),
};
