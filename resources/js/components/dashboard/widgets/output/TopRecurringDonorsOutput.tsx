import React, { useCallback, useEffect, useState } from 'react';
import type {
    TopRecurringDonorsOutputConfig,
    WidgetOutputProps,
} from './types';

interface TopRow {
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
}

export const TopRecurringDonorsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget.config || {}) as TopRecurringDonorsOutputConfig;
    const {
        projectSlug,
        organizationSlug,
        limit = 15,
        title = 'Топ регулярно-поддерживающих',
    } = config;

    const slug = projectSlug ?? organizationSlug;
    const isOrgScope = Boolean(organizationSlug && !projectSlug);

    const [data, setData] = useState<TopRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        if (!slug) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        const base = isOrgScope
            ? `/organization/${encodeURIComponent(slug)}/donations`
            : `/project/${encodeURIComponent(slug)}/donations`;
        const graduateOnly = isOrgScope ? '&graduate_only=1' : '';
        fetch(
            `${base}/top-recurring?period=all&per_page=${limit}${graduateOnly}`,
        )
            .then((r) => r.json())
            .then((json) => {
                if (json.success && Array.isArray(json.data)) {
                    setData(json.data);
                } else {
                    setData([]);
                }
            })
            .catch(() => {
                setError('Не удалось загрузить данные');
                setData([]);
            })
            .finally(() => setLoading(false));
    }, [slug, isOrgScope, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (!slug) {
        return (
            <div
                className={`top-recurring-donors-output top-recurring-donors-output--empty ${className || ''}`}
                style={style}
            >
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    {isOrgScope
                        ? 'Данные организации загрузятся на сайте'
                        : 'Выберите проект в настройках виджета'}
                </div>
            </div>
        );
    }

    return (
        <section
            className={`top-recurring-donors-output region-rate ${className || ''}`}
            style={style}
        >
            <div className="main-page__desc-heading">
                {title && (
                    <h4 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h4>
                )}
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
                    Пока нет регулярных пожертвований
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
                                        • {row.donations_count} чел.
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
