import React, { useCallback, useEffect, useState } from 'react';
import type {
    TopDonorsOutputConfig,
    WidgetOutputProps,
} from './types';

const PERIODS: { key: 'week' | 'month' | 'all'; label: string }[] = [
    { key: 'week', label: 'За неделю' },
    { key: 'month', label: 'За месяц' },
    { key: 'all', label: 'За всё время' },
];

interface TopRow {
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
}

type PeriodKey = 'week' | 'month' | 'all';

export const TopDonorsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget.config || {}) as TopDonorsOutputConfig;
    const {
        projectSlug,
        organizationSlug,
        period: initialPeriod = 'all',
        limit = 10,
        title = 'Топ поддержавших выпусков',
    } = config;

    const slug = projectSlug ?? organizationSlug;
    const isOrgScope = Boolean(organizationSlug && !projectSlug);

    const [period, setPeriod] = useState<PeriodKey>((initialPeriod as PeriodKey) || 'all');
    const [dataByPeriod, setDataByPeriod] = useState<Record<PeriodKey, TopRow[]>>({
        week: [],
        month: [],
        all: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPeriods = useCallback(() => {
        if (!slug) {
            setDataByPeriod({ week: [], month: [], all: [] });
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const base = isOrgScope
            ? `/organization/${encodeURIComponent(slug)}/donations`
            : `/project/${encodeURIComponent(slug)}/donations`;
        const graduateOnly = isOrgScope ? '&graduate_only=1' : '';
        const periodsToFetch: PeriodKey[] = isOrgScope
            ? ['week', 'month', 'all']
            : [period];
        let pending = periodsToFetch.length;
        const next: Partial<Record<PeriodKey, TopRow[]>> = {};
        periodsToFetch.forEach((p) => {
            fetch(`${base}/top?period=${p}&limit=${limit}${graduateOnly}`)
                .then((r) => r.json())
                .then((json) => {
                    if (json.success && Array.isArray(json.data)) {
                        next[p] = json.data;
                    } else {
                        next[p] = [];
                    }
                })
                .catch(() => {
                    next[p] = [];
                })
                .finally(() => {
                    pending -= 1;
                    if (pending === 0) {
                        setDataByPeriod((prev) => ({ ...prev, ...next }));
                        setLoading(false);
                    }
                });
        });
    }, [slug, isOrgScope, limit, period]);

    useEffect(() => {
        fetchPeriods();
    }, [fetchPeriods]);

    const data = dataByPeriod[period] ?? [];

    if (!slug) {
        return (
            <div
                className={`top-donors-output top-donors-output--empty ${className || ''}`}
                style={style}
            >
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    {isOrgScope ? 'Данные организации загрузятся на сайте' : 'Выберите проект в настройках виджета'}
                </div>
            </div>
        );
    }

    return (
        <section
            className={`top-donors-output region-rate ${className || ''}`}
            style={style}
        >
            <div className="main-page__desc-heading flex flex-wrap items-center justify-between gap-2">
                {title && (
                    <h4 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h4>
                )}
                <select
                    className="custom-select rate-select rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={period}
                    onChange={(e) =>
                        setPeriod(e.target.value as 'week' | 'month' | 'all')
                    }
                    aria-label="Период"
                >
                    {PERIODS.map((p) => (
                        <option key={p.key} value={p.key}>
                            {p.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="main-page__line my-2 h-px bg-gray-200" />
            {error && (
                <p className="py-4 text-center text-sm text-red-600">{error}</p>
            )}
            {loading && (
                <p className="py-6 text-center text-sm text-gray-500">
                    Загрузка…
                </p>
            )}
            {!loading && !error && data.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
                    Пока нет данных за выбранный период
                </p>
            )}
            {!loading && !error && data.length > 0 && (
                <div className="region-table space-y-2">
                    {data.map((row, i) => (
                        <div
                            key={`${row.donor_label}-${i}`}
                            className="region-item flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white p-3"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                    {row.donor_label}
                                    <span className="text-gray-500">
                                        {' '}
                                        • {row.donations_count}{' '}
                                        {row.donations_count === 1
                                            ? 'платеж'
                                            : row.donations_count < 5
                                              ? 'платежа'
                                              : 'платежей'}
                                    </span>
                                </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                {row.total_amount_formatted}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};
