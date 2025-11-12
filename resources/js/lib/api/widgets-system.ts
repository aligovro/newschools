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

export interface PositionVisibilityRules {
    mode?: 'all' | 'include' | 'exclude';
    routes?: string[]; // keys like home, projects, organization_show, etc.
    pages?: Array<{ id: number; slug: string } | number | string>;
}

export interface SitePositionSettingDTO {
    id: number;
    site_id: number;
    position_id?: number | null;
    position_slug: string;
    visibility_rules?: PositionVisibilityRules;
    layout_overrides?: Record<string, unknown>;
}

export interface PositionSettingsResponse {
    success: boolean;
    data: {
        position?: WidgetPosition | null;
        settings?: SitePositionSettingDTO | null;
    };
    message?: string;
}

export interface SimpleSuccessResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaymentMethod {
    id: number;
    name: string;
    type: string;
    slug?: string;
    is_active: boolean;
    config: Record<string, unknown>;
    description?: string;
    icon?: string;
    min_amount?: number;
    max_amount?: number;
}

export interface DonationWidgetData {
    terminology: Record<string, string>;
    fundraiser?: {
        id: number;
        title: string;
        description?: string;
        short_description?: string;
        target_amount?: number;
        collected_amount?: number;
        target_amount_rubles?: number;
        collected_amount_rubles?: number;
        progress_percentage?: number;
    };
    organization?: {
        id: number;
        name: string;
    };
    organization_needs?: {
        target_amount: number | null;
        collected_amount: number | null;
        target_amount_rubles: number | null;
        collected_amount_rubles: number | null;
        currency: string;
        is_active: boolean;
    };
    project?: {
        id: number;
        title: string;
        description?: string;
        image?: string | null;
        target_amount?: number;
        collected_amount?: number;
        target_amount_rubles?: number;
        collected_amount_rubles?: number;
        progress_percentage?: number;
        has_stages?: boolean;
        active_stage?: {
            id: number;
            title: string;
            description?: string;
            target_amount?: number;
            collected_amount?: number;
            target_amount_rubles?: number;
            collected_amount_rubles?: number;
            progress_percentage?: number;
            status?: string;
            order?: number;
        } | null;
    };
}

export interface DonationRequest {
    amount: number;
    currency: string;
    payment_method_slug: string;
    fundraiser_id?: number;
    project_id?: number;
    project_stage_id?: number;
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
            }>(`/widgets/positions/${positionId}/layout`, {
                layout_config: layoutConfig,
            })
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
        params: { fundraiser_id?: number; project_id?: number; project_stage_id?: number } = {},
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
            }>(
                `/organizations/${organizationId}/donation-widget/payment-methods`,
            )
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

    // ПОЛУЧЕНИЕ/СОХРАНЕНИЕ НАСТРОЕК ПОЗИЦИИ ДЛЯ САЙТА
    getPositionSettings: (
        siteId: number,
        positionSlug: string,
    ): Promise<PositionSettingsResponse> =>
        apiClient
            .get<PositionSettingsResponse>(
                `/dashboard/sites/${siteId}/positions/${positionSlug}/settings`,
            )
            .then((response) => response.data),

    savePositionSettings: (
        siteId: number,
        positionSlug: string,
        payload: {
            visibility?: PositionVisibilityRules;
            layout?: Record<string, unknown>;
        },
    ): Promise<SimpleSuccessResponse<SitePositionSettingDTO>> =>
        apiClient
            .put<
                SimpleSuccessResponse<SitePositionSettingDTO>
            >(`/dashboard/sites/${siteId}/positions/${positionSlug}/settings`, payload)
            .then((response) => response.data),

    getPositionRoutes: (
        siteId: number,
    ): Promise<
        SimpleSuccessResponse<
            Array<{ key: string; label: string; pattern: string }>
        >
    > =>
        apiClient
            .get<
                SimpleSuccessResponse<
                    Array<{ key: string; label: string; pattern: string }>
                >
            >(`/dashboard/sites/${siteId}/positions/routes`)
            .then((response) => response.data),

    getSitePages: (
        siteId: number,
    ): Promise<
        SimpleSuccessResponse<
            Array<{ id: number; title: string; slug: string }>
        >
    > =>
        apiClient
            .get<
                SimpleSuccessResponse<
                    Array<{ id: number; title: string; slug: string }>
                >
            >(`/dashboard/sites/${siteId}/positions/pages`)
            .then((response) => response.data),

    // ПОЛУЧЕНИЕ/СОХРАНЕНИЕ НАСТРОЕК ВИДЖЕТА ДЛЯ САЙТА
    getWidgetSettings: (
        siteId: number,
        widgetId: string,
    ): Promise<
        SimpleSuccessResponse<{
            widget: unknown;
            settings: { visibility_rules?: PositionVisibilityRules } | null;
        }>
    > =>
        apiClient
            .get(
                `/dashboard/sites/${siteId}/widgets/${widgetId}/settings`,
            )
            .then((response) => response.data),

    saveWidgetSettings: (
        siteId: number,
        widgetId: string,
        payload: {
            visibility?: PositionVisibilityRules;
        },
    ): Promise<SimpleSuccessResponse<{ visibility_rules?: PositionVisibilityRules }>> =>
        apiClient
            .put(`/dashboard/sites/${siteId}/widgets/${widgetId}/settings`, payload)
            .then((response) => response.data),
};
