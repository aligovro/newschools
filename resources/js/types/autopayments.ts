/**
 * Типы для автоплатежей организации
 */

export interface AutopaymentPayment {
    date: string | null;
    label: string;
}

export interface AutopaymentRow {
    title: string;
    amount: number;
    amount_formatted: string;
    recurring_period: 'daily' | 'weekly' | 'monthly';
    recurring_period_label: string;
    payment_method_slug: string | null;
    payments: AutopaymentPayment[];
    first_payment_at: string | null;
    subscription_key_masked: string;
}

export interface AutopaymentsListResponse {
    success: boolean;
    data: AutopaymentRow[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface AutopaymentsListFilters {
    recurring_period?: 'daily' | 'weekly' | 'monthly';
    page?: number;
    per_page?: number;
}
