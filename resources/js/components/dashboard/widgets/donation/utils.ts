import type { ApiPaymentMethod } from '@/lib/api/index';
import { CURRENCY_SYMBOLS } from '@/lib/constants';

export { CURRENCY_SYMBOLS };

export const RECURRING_PERIOD_LABELS = {
    daily: 'Ежедневно',
    weekly: 'Еженедельно',
    monthly: 'Ежемесячно',
} as const;

export const normalizePaymentSlug = (method: ApiPaymentMethod): string => {
    const meta = method as unknown as {
        slug?: string | null;
        id?: string | number | null;
        type?: string | null;
        name?: string | null;
    };

    if (typeof meta.slug === 'string' && meta.slug.trim() !== '') {
        return meta.slug;
    }

    if (meta.id !== undefined && meta.id !== null && meta.id !== '') {
        return String(meta.id);
    }

    if (typeof meta.type === 'string' && meta.type.trim() !== '') {
        return meta.type;
    }

    if (typeof meta.name === 'string' && meta.name.trim() !== '') {
        return meta.name.trim().toLowerCase().replace(/\s+/g, '-');
    }

    return 'payment-method';
};

export const parseNumericId = (value: unknown): number | undefined => {
    if (value === null || value === undefined) {
        return undefined;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return undefined;
    }

    return parsed > 0 ? parsed : undefined;
};

