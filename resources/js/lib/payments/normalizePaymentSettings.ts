export type Gateway = 'yookassa' | 'tinkoff' | 'sbp';

export type NormalizedPaymentSettings = {
    gateway: Gateway;
    enabled_gateways: Gateway[];
    credentials: Record<string, Record<string, string>>;
    options: Record<string, unknown>;
    donation_min_amount: number;
    donation_max_amount: number;
    currency: string;
    test_mode: boolean;
};

export const ALLOWED_PAYMENT_GATEWAYS: Gateway[] = [
    'yookassa',
    'tinkoff',
    'sbp',
];

const asNumber = (value: unknown, fallback: number): number => {
    const numeric = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
};

const asBoolean = (value: unknown, fallback: boolean): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (value === undefined || value === null) {
        return fallback;
    }
    if (typeof value === 'string') {
        return ['1', 'true', 'on', 'yes'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') {
        return value !== 0;
    }
    return fallback;
};

const normalizeGateways = (value: unknown): Gateway[] => {
    const gateways = Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? [value]
          : [];

    const normalized = gateways
        .map((gateway) =>
            ALLOWED_PAYMENT_GATEWAYS.includes(
                gateway as Gateway,
            )
                ? (gateway as Gateway)
                : null,
        )
        .filter((gateway): gateway is Gateway => gateway !== null);

    if (!normalized.length) {
        normalized.push('yookassa');
    }

    return normalized;
};

const normalizeCredentials = (
    value: unknown,
): Record<string, Record<string, string>> => {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return Object.entries(value as Record<string, unknown>).reduce(
        (acc, [gateway, credentials]) => {
            if (!credentials || typeof credentials !== 'object') {
                return acc;
            }

            const normalizedCredentials = Object.entries(
                credentials as Record<string, unknown>,
            ).reduce<Record<string, string>>((innerAcc, [key, val]) => {
                innerAcc[key] =
                    val === undefined || val === null ? '' : String(val);
                return innerAcc;
            }, {});

            acc[gateway] = normalizedCredentials;

            return acc;
        },
        {} as Record<string, Record<string, string>>,
    );
};

const normalizeOptions = (value: unknown): Record<string, unknown> => {
    if (!value || typeof value !== 'object') {
        return {};
    }

    return value as Record<string, unknown>;
};

const normalizeCurrency = (value: unknown): string => {
    if (typeof value !== 'string' || !value.trim()) {
        return 'RUB';
    }

    return value.trim().slice(0, 3).toUpperCase();
};

export const normalizePaymentSettings = (
    input?: Partial<NormalizedPaymentSettings> | null,
): NormalizedPaymentSettings => {
    const raw = input && typeof input === 'object' ? input : {};

    const enabledGateways = normalizeGateways(
        raw.enabled_gateways ?? (raw as any).enabled_methods ?? raw.gateway,
    );

    const primaryGateway = enabledGateways[0] ?? 'yookassa';

    return {
        gateway: primaryGateway,
        enabled_gateways: enabledGateways,
        credentials: normalizeCredentials(raw.credentials),
        options: normalizeOptions((raw as any).options),
        donation_min_amount: asNumber(
            (raw as any).donation_min_amount ?? (raw as any).min_amount,
            100,
        ),
        donation_max_amount: asNumber(
            (raw as any).donation_max_amount ?? (raw as any).max_amount,
            0,
        ),
        currency: normalizeCurrency((raw as any).currency),
        test_mode: asBoolean((raw as any).test_mode, true),
    };
};

