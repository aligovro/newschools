import { apiClient } from '../api';
import type {
    AutopaymentsListResponse,
    AutopaymentsListFilters,
} from '@/types/autopayments';

export interface TransactionRow {
    id: number;
    amount: number;
    amount_rubles: number;
    currency: string;
    status: string;
    donor_name: string | null;
    donor_phone: string | null;
    transaction?: { id: number; status: string; provider: string | null; transaction_id: string | null };
    paid_at: string | null;
    created_at: string;
}

export interface TransactionsListResponse {
    data: TransactionRow[];
    meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface TransactionsListFilters {
    page?: number;
    per_page?: number;
    status?: string;
    payment_method?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
}

/**
 * API для работы с платежами организации в дашборде (маршруты web.php, без префикса /api)
 */
export const organizationPaymentsApi = {
    /**
     * Получить список транзакций (донатов)
     */
    async getTransactions(
        organizationId: number,
        filters: TransactionsListFilters = {}
    ): Promise<TransactionsListResponse> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v != null && v !== '') params.append(k, String(v));
        });
        const url = `/dashboard/organizations/${organizationId}/payments/transactions${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await apiClient.getAbsolute<TransactionsListResponse>(url);
        return response.data;
    },

    /**
     * Получить список автоплатежей организации
     */
    async getAutopayments(
        organizationId: number,
        filters: AutopaymentsListFilters = {}
    ): Promise<AutopaymentsListResponse> {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', String(filters.page));
        if (filters.per_page) params.append('per_page', String(filters.per_page));
        if (filters.recurring_period)
            params.append('recurring_period', filters.recurring_period);

        const queryString = params.toString();
        const url = `/dashboard/organizations/${organizationId}/payments/autopayments${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.getAbsolute<AutopaymentsListResponse>(url);
        return response.data;
    },
};
