import React, { useCallback, useEffect, useState } from 'react';
import type {
    OrgDonationsFeedOutputConfig,
    WidgetOutputProps,
} from './types';

interface DonationRow {
    id: number;
    donor_name: string;
    amount_formatted: string;
    payment_method_label: string;
    paid_at: string;
    date_label?: string;
}

const PER_PAGE_DEFAULT = 20;

/** Номера страниц для пагинации: 01 02 03 … N и кнопка «Далее». */
function paginationPageNumbers(current: number, last: number): (number | 'ellipsis')[] {
    if (last <= 1) return [];
    const pages: (number | 'ellipsis')[] = [];
    const showFirst = 3;
    if (last <= showFirst + 2) {
        for (let i = 1; i <= last; i++) pages.push(i);
        return pages;
    }
    for (let i = 1; i <= showFirst; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(last);
    return pages;
}

export const OrgDonationsFeedOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = (widget.config || {}) as OrgDonationsFeedOutputConfig;
    const {
        organizationSlug,
        projectSlug,
        per_page = PER_PAGE_DEFAULT,
        title = 'Все поступления',
    } = config;

    const slug = projectSlug ?? organizationSlug;
    const isProject = Boolean(projectSlug);

    const [page, setPage] = useState(1);
    const [items, setItems] = useState<DonationRow[]>([]);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: PER_PAGE_DEFAULT,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        (pageNum: number) => {
            if (!slug) {
                setItems([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            const base = isProject
                ? `/project/${encodeURIComponent(slug)}/donations`
                : `/organization/${encodeURIComponent(slug)}/donations`;
            fetch(`${base}?page=${pageNum}&per_page=${per_page}&mask_donors=1`)
                .then((r) => r.json())
                .then((json) => {
                    if (json.success && Array.isArray(json.data)) {
                        setItems(json.data);
                        if (json.pagination) {
                            setPagination(json.pagination);
                        }
                    } else {
                        setItems([]);
                    }
                })
                .catch(() => {
                    setError('Не удалось загрузить данные');
                    setItems([]);
                })
                .finally(() => setLoading(false));
        },
        [slug, isProject, per_page],
    );

    useEffect(() => {
        fetchData(page);
    }, [page, fetchData]);

    if (!slug) {
        return (
            <div
                className={`org-donations-feed-output org-donations-feed-output--empty ${className || ''}`}
                style={style}
            >
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500">
                    Данные загрузятся на сайте
                </div>
            </div>
        );
    }

    const groupedByDate = items.reduce<Record<string, DonationRow[]>>(
        (acc, row) => {
            const key = row.date_label ?? '';
            if (!acc[key]) acc[key] = [];
            acc[key].push(row);
            return acc;
        },
        {},
    );

    return (
        <section
            className={`org-donations-feed-output ${className || ''}`}
            style={style}
        >
            <div className="main-page__desc-heading main-page__raiting-heading">
                {title && (
                    <h3 className="text-lg font-semibold text-gray-900">
                        <b>{title}</b>
                    </h3>
                )}
            </div>
            {error && (
                <p className="py-4 text-center text-sm text-red-600">{error}</p>
            )}
            {loading && items.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">
                    Загрузка…
                </p>
            )}
            {!loading && !error && items.length === 0 && (
                <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
                    Пока нет поступлений
                </p>
            )}
            {!loading && !error && items.length > 0 && (
                <div className="main-page__don-table-group">
                    <div className="main-page__don-table-wrap space-y-4">
                        {Object.entries(groupedByDate).map(
                            ([dateLabel, rows]) => (
                                <div key={dateLabel || 'no-date'}>
                                    {dateLabel && (
                                        <div className="main-page__don-table-date-header mb-2 text-sm font-medium text-gray-600">
                                            {dateLabel}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {rows.map((row) => (
                                            <div
                                                key={row.id}
                                                className="main-page__don-table-item flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-900">
                                                        {row.donor_name}
                                                        {row.paid_at ? ` ${row.paid_at}` : ''}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-900">
                                                        {row.amount_formatted}
                                                        {row.payment_method_label ? ` ${row.payment_method_label}` : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                    {pagination.last_page > 1 && (
                        <div className="main-page__pagination mt-4 flex flex-wrap items-center justify-center gap-1">
                            {paginationPageNumbers(
                                pagination.current_page,
                                pagination.last_page,
                            ).map((p, i) =>
                                p === 'ellipsis' ? (
                                    <span
                                        key={`ellipsis-${i}`}
                                        className="px-2 text-gray-500"
                                    >
                                        ···
                                    </span>
                                ) : (
                                    <button
                                        key={p}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => setPage(p)}
                                        className={`min-w-[2rem] rounded px-2 py-1 text-sm font-medium ${
                                            page === p
                                                ? 'bg-indigo-600 text-white'
                                                : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                                        } disabled:opacity-50`}
                                    >
                                        {String(p).padStart(2, '0')}
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                disabled={
                                    page >= pagination.last_page || loading
                                }
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(pagination.last_page, p + 1),
                                    )
                                }
                                className="ml-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                            >
                                Далее
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};
