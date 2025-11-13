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
    credentials?: Record<string, unknown> | null;
    settings?: Record<string, unknown> | null;
    documents?: Record<string, unknown> | null;
    activated_at?: string | null;
    last_synced_at?: string | null;
    created_at?: string | null;
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
};

export default yookassaApi;

