import { apiClient } from '@/lib/api';

// Типы для API ответов виджетов
export interface RegionData {
    id: number;
    name: string;
    code: string;
    flag_image?: string;
    total_amount: number;
    donation_count: number;
    change_amount?: number;
    change_count?: number;
    region_url?: string;
}

export interface ReferralLeader {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    referral_count: number;
    total_amount: number;
    last_referral_date?: string;
}

export interface Donation {
    id: number;
    amount: number;
    donor_name?: string;
    donor_email?: string;
    message?: string;
    is_anonymous: boolean;
    created_at: string;
    payment_method?: string;
    status: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// API методы для виджетов
export const widgetsApi = {
    // Получение рейтинга регионов
    getRegionRating: (
        organizationId: number,
        params: {
            page?: number;
            per_page?: number;
            search?: string;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
        } = {},
    ): Promise<PaginatedResponse<RegionData>> =>
        apiClient
            .get<
                PaginatedResponse<RegionData>
            >(`/organizations/${organizationId}/region-rating`, { params })
            .then((response) => response.data),

    // Получение лидеров рефералов
    getReferralLeaderboard: (
        organizationId: number,
        params: {
            page?: number;
            per_page?: number;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
        } = {},
    ): Promise<PaginatedResponse<ReferralLeader>> =>
        apiClient
            .get<PaginatedResponse<ReferralLeader>>(
                `/organizations/${organizationId}/referrals/leaderboard`,
                {
                    params,
                },
            )
            .then((response) => response.data),

    // Получение пожертвований
    getDonations: (
        organizationId: number,
        params: {
            page?: number;
            per_page?: number;
            search?: string;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
        } = {},
    ): Promise<PaginatedResponse<Donation>> =>
        apiClient
            .get<
                PaginatedResponse<Donation>
            >(`/organizations/${organizationId}/donations`, { params })
            .then((response) => response.data),

    // Получение топа поддерживающих городов
    getCitySupporters: (
        organizationId: number,
        params: {
            page?: number;
            per_page?: number;
            search?: string;
            sort_by?: 'amount' | 'supporters' | 'schools' | 'name';
            sort_order?: 'asc' | 'desc';
        } = {},
    ): Promise<
        PaginatedResponse<{
            id: number;
            name: string;
            region_name?: string;
            schools_count: number;
            supporters_count: number;
            donation_count: number;
            total_amount: number;
            alumni_count?: number | null;
            subscriptions_count?: number | null;
        }>
    > =>
        apiClient
            .get<
                PaginatedResponse<{
                    id: number;
                    name: string;
                    region_name?: string;
                    schools_count: number;
                    supporters_count: number;
                    donation_count: number;
                    total_amount: number;
                    alumni_count?: number | null;
                    subscriptions_count?: number | null;
                }>
            >(`/organizations/${organizationId}/city-supporters`, { params })
            .then((response) => response.data),

    // Публичный топ поддерживающих городов (без организации)
    getCitySupportersPublic: (
        params: {
            page?: number;
            per_page?: number;
            search?: string;
            sort_by?: 'amount' | 'supporters' | 'schools' | 'name';
            sort_order?: 'asc' | 'desc';
        } = {},
    ): Promise<
        PaginatedResponse<{
            id: number;
            name: string;
            region_name?: string;
            schools_count: number;
            supporters_count: number;
            donation_count: number;
            total_amount: number;
            alumni_count?: number | null;
            subscriptions_count?: number | null;
        }>
    > =>
        apiClient
            .get<
                PaginatedResponse<{
                    id: number;
                    name: string;
                    region_name?: string;
                    schools_count: number;
                    supporters_count: number;
                    donation_count: number;
                    total_amount: number;
                    alumni_count?: number | null;
                    subscriptions_count?: number | null;
                }>
            >(`/public/city-supporters`, { params })
            .then((response) => response.data),
};
