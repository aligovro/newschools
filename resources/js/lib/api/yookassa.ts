import { apiClient } from '@/lib/api';

export interface YooKassaMerchant {
    id: number;
    organization: {
        id: number;
        name: string;
    };
    status: string;
    external_id?: string | null;
    onboarding_id?: string | null;
    contract_id?: string | null;
    payout_account_id?: string | null;
    payout_status?: string | null;
    credentials?: {
        access_token?: string | null;
        refresh_token?: string | null;
        expires_in?: number | null;
        token_type?: string | null;
        expires_at?: string | null;
        oauth_authorized_at?: string | null;
        [key: string]: unknown;
    } | null;
    settings?: {
        oauth_authorized?: boolean;
        oauth_authorized_at?: string | null;
        [key: string]: unknown;
    } | null;
    documents?: Record<string, unknown> | null;
    activated_at?: string | null;
    last_synced_at?: string | null;
    created_at?: string | null;
    oauth?: {
        authorized: boolean;
        authorized_at?: string | null;
    };
}

export interface YooKassaPayment {
    id: number;
    external_id?: string | null;
    status?: string | null;
    amount?: number;
    amount_rubles?: number;
    formatted_amount?: string | null;
    currency?: string;
    merchant?: {
        id: number;
        status: string;
        organization: {
            id: number;
            name: string;
        };
    } | null;
    transaction?: {
        id: number;
        transaction_id: string;
        status: string;
        paid_at?: string | null;
    } | null;
    created_at?: string | null;
}

export interface YooKassaPayout {
    id: number;
    external_id?: string | null;
    status?: string | null;
    amount: number;
    amount_rubles?: number;
    formatted_amount?: string | null;
    currency: string;
    scheduled_at?: string | null;
    processed_at?: string | null;
    merchant: {
        id: number;
        status: string;
        organization: {
            id: number;
            name: string;
        };
    };
    created_at?: string | null;
}

export interface YooKassaSettingsPayload {
    credentials: {
        client_id: string;
        secret_key: string;
        account_id?: string;
        base_url?: string;
    };
    options?: Record<string, unknown>;
    webhook?: {
        url?: string;
        secret?: string;
    };
}

export const yookassaApi = {
    async listMerchants(params: Record<string, unknown> = {}) {
        const response = await apiClient.get('/dashboard/yookassa/merchants', {
            params,
        });
        const payload = response.data;
        return {
            data: (payload.data ?? []) as YooKassaMerchant[],
            meta: payload.meta ?? {},
        };
    },

    async createMerchant(
        organizationId: number,
        payload: Record<string, unknown>,
    ) {
        const response = await apiClient.post(
            `/dashboard/yookassa/organizations/${organizationId}/merchants`,
            payload,
        );
        return response.data as { data: YooKassaMerchant };
    },

    async syncMerchant(merchantId: number, payload: Record<string, unknown>) {
        const response = await apiClient.post(
            `/dashboard/yookassa/merchants/${merchantId}/sync`,
            payload,
        );
        return response.data as { data: YooKassaMerchant };
    },

    async getMerchant(merchantId: number) {
        const response = await apiClient.get(
            `/dashboard/yookassa/merchants/${merchantId}`,
        );
        return response.data as { data: YooKassaMerchant };
    },

    async listPayments(params: Record<string, unknown> = {}) {
        const response = await apiClient.get('/dashboard/yookassa/payments', {
            params,
        });
        const payload = response.data;
        return {
            data: (payload.data ?? []) as YooKassaPayment[],
            meta: payload.meta ?? {},
        };
    },

    async getPayment(paymentId: number) {
        const response = await apiClient.get(
            `/dashboard/yookassa/payments/${paymentId}`,
        );
        return response.data as { data: YooKassaPayment };
    },

    async listPayouts(params: Record<string, unknown> = {}) {
        const response = await apiClient.get('/dashboard/yookassa/payouts', {
            params,
        });
        const payload = response.data;
        return {
            data: (payload.data ?? []) as YooKassaPayout[],
            meta: payload.meta ?? {},
        };
    },

    async getSettings() {
        const response = await apiClient.get('/dashboard/yookassa/settings');
        return response.data as { data: YooKassaSettingsPayload };
    },

    async updateSettings(payload: YooKassaSettingsPayload) {
        const response = await apiClient.put(
            '/dashboard/yookassa/settings',
            payload,
        );
        return response.data as { data: YooKassaSettingsPayload };
    },

    async getAuthorizationUrl(organizationId: number) {
        const response = await apiClient.get(
            `/dashboard/yookassa/oauth/authorize/${organizationId}`,
        );
        return response.data as { authorization_url: string };
    },

    async getMerchantByOrganization(organizationId: number) {
        const response = await apiClient.get(
            `/dashboard/yookassa/organizations/${organizationId}/merchant`,
        );
        return response.data as { data: YooKassaMerchant | null };
    },

    async getMerchantStats(merchantId: number) {
        const response = await apiClient.get(
            `/dashboard/yookassa/merchants/${merchantId}/stats`,
        );
        return response.data as {
            data: {
                payments: {
                    total: number;
                    succeeded: number;
                    pending: number;
                    total_amount: number;
                };
                payouts: {
                    total: number;
                    succeeded: number;
                    pending: number;
                    total_amount: number;
                };
                oauth: {
                    authorized: boolean;
                    authorized_at: string | null;
                    token_expires_at: string | null;
                };
            };
        };
    },

    async syncAuthorizedMerchants() {
        const response = await apiClient.post(
            '/dashboard/yookassa/merchants/sync-authorized',
        );
        return response.data as {
            data: {
                synced: Array<{
                    merchant_id: number;
                    external_id: string;
                    action: 'created' | 'updated';
                    organization_id: number | null;
                    note?: string;
                }>;
                errors: Array<{
                    external_id: string;
                    error: string;
                }>;
                total: number;
                synced_count: number;
                errors_count: number;
            };
            message: string;
        };
    },

    async restoreMerchantFromOAuth(
        organizationId: number,
        externalId?: string,
    ) {
        const response = await apiClient.post(
            `/dashboard/yookassa/organizations/${organizationId}/merchants/restore-oauth`,
            externalId ? { external_id: externalId } : {},
        );
        return response.data as {
            data: YooKassaMerchant;
            message: string;
        };
    },

    async attachMerchantByExternalId(
        organizationId: number,
        externalId: string,
    ) {
        const response = await apiClient.post(
            `/dashboard/yookassa/organizations/${organizationId}/merchants/attach-by-id`,
            { external_id: externalId },
        );
        return response.data as {
            data: YooKassaMerchant;
            message: string;
        };
    },
};

export default yookassaApi;
