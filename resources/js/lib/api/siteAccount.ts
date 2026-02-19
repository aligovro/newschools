import { apiClient } from '@/lib/api';

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface DonationRow {
    id: number;
    amount: number;
    amount_formatted: string;
    payment_method: string;
    payment_method_label: string;
    paid_at: string;
    date_label: string;
    created_at: string;
}

export interface RecurringRow {
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
    duration_label: string;
}

export interface PaymentMethodRow {
    payment_method: string;
    label: string;
}

export interface SiteAccountProfile {
    user: {
        id: number;
        name: string;
        email: string | null;
        phone: string | null;
        photo: string | null;
    };
    profile: {
        last_name: string | null;
        user_type: string | null;
        edu_year: string | null;
        region_id: number | null;
        region: { id: number; name: string; slug: string } | null;
    };
    user_type_labels: Record<string, string>;
}

export const siteAccountApi = {
    getProfile: (organizationId: number): Promise<{ data: SiteAccountProfile }> =>
        apiClient
            .get<SiteAccountProfile>(`/site-account/profile?organization_id=${organizationId}`)
            .then((r) => ({ data: r.data })),

    updateProfile: (
        organizationId: number,
        data: Partial<{
            name: string;
            email: string | null;
            last_name: string | null;
            user_type: string | null;
            edu_year: string | null;
            region_id: number | null;
        }>,
    ): Promise<{ data: SiteAccountProfile }> =>
        apiClient
            .patch<SiteAccountProfile>('/site-account/profile', {
                organization_id: organizationId,
                ...data,
            })
            .then((r) => ({ data: r.data })),

    getPayments: (
        organizationId: number,
        page = 1,
    ): Promise<{ data: DonationRow[]; pagination: Pagination }> =>
        apiClient
            .get<{ success: boolean; data: DonationRow[]; pagination: Pagination }>(
                `/site-account/payments?organization_id=${organizationId}&page=${page}`,
            )
            .then((r) => ({ data: r.data.data, pagination: r.data.pagination })),

    getAutoPayments: (
        organizationId: number,
        page = 1,
    ): Promise<{ data: RecurringRow[]; pagination: Pagination }> =>
        apiClient
            .get<{ success: boolean; data: RecurringRow[]; pagination: Pagination }>(
                `/site-account/auto-payments?organization_id=${organizationId}&page=${page}`,
            )
            .then((r) => ({ data: r.data.data, pagination: r.data.pagination })),

    getCards: (
        organizationId: number,
    ): Promise<{ data: PaymentMethodRow[] }> =>
        apiClient
            .get<{ success: boolean; data: PaymentMethodRow[] }>(
                `/site-account/cards?organization_id=${organizationId}`,
            )
            .then((r) => ({ data: r.data.data })),

    getReferral: (
        organizationId: number,
    ): Promise<{ referral_url: string; referrals_count: number }> =>
        apiClient
            .get<{ success: boolean; referral_url: string; referrals_count: number }>(
                `/site-account/referral?organization_id=${organizationId}`,
            )
            .then((r) => ({
                referral_url: r.data.referral_url,
                referrals_count: r.data.referrals_count,
            })),
};
