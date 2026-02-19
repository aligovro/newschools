import { useCallback, useEffect, useRef, useState } from 'react';

import {
    Avatar,
    AvatarImage,
    AvatarUserFallback,
} from '@/components/ui/avatar';

interface RecurringDonor {
    id: string;
    donor_label: string;
    total_amount: number;
    total_amount_formatted: string;
    donations_count: number;
    duration_label: string;
    avatar?: string | null;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ProjectTopRecurringSectionProps {
    projectSlug: string;
    initialData?: RecurringDonor[];
    initialPagination?: Pagination;
}

const TITLE = 'Топ регулярно-поддерживающих';
const EMPTY_MESSAGE = 'Пока нет регулярных пожертвований.';
const PER_PAGE = 6;

const defaultPagination: Pagination = {
    current_page: 1,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
};

export default function ProjectTopRecurringSection({
    projectSlug,
    initialData = [],
    initialPagination = defaultPagination,
}: ProjectTopRecurringSectionProps) {
    const [data, setData] = useState<RecurringDonor[]>(initialData);
    const [pagination, setPagination] = useState<Pagination>(
        initialPagination,
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(
        initialData.length === 0 && (initialPagination?.total ?? 0) === 0,
    );
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(
        async (page: number, append: boolean) => {
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    period: 'all',
                    page: String(page),
                    per_page: String(PER_PAGE),
                });
                const res = await fetch(
                    `/project/${projectSlug}/donations/top-recurring?${params}`,
                    {
                        headers: { Accept: 'application/json' },
                        credentials: 'same-origin',
                        signal: abortRef.current.signal,
                    },
                );

                if (!res.ok) throw new Error('Не удалось загрузить данные');

                const json = await res.json();
                const items = Array.isArray(json?.data) ? json.data : [];
                const pag = json?.pagination ?? pagination;

                setData((prev) => (append ? [...prev, ...items] : items));
                setPagination({
                    current_page: pag.current_page ?? page,
                    last_page: pag.last_page ?? 1,
                    per_page: pag.per_page ?? PER_PAGE,
                    total: pag.total ?? 0,
                });
            } catch (e) {
                if ((e as Error).name !== 'AbortError') {
                    setError('Не удалось загрузить данные. Попробуйте позже.');
                }
            } finally {
                setIsLoading(false);
                setIsInitialLoad(false);
            }
        },
        [projectSlug],
    );

    useEffect(() => {
        if (initialData.length > 0 || (initialPagination?.total ?? 0) > 0) {
            setIsInitialLoad(false);
            return;
        }
        void fetchData(1, false);
        return () => abortRef.current?.abort();
    }, [fetchData, initialData.length, initialPagination?.total]);

    const hasMore =
        pagination.current_page < pagination.last_page && !isLoading;

    const handleLoadMore = useCallback(() => {
        if (!hasMore) return;
        void fetchData(pagination.current_page + 1, true);
    }, [hasMore, pagination.current_page, fetchData]);

    if (isInitialLoad && !data.length) {
        return null;
    }

    if (!isInitialLoad && data.length === 0 && !error) {
        return null;
    }

    return (
        <section className="top-recurring-section mt-8">
            <div className="top-recurring-section__wrapper">
                <h2 className="top-recurring-section__title">
                    {TITLE} · {pagination.total}
                </h2>

                {error && (
                    <div
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {!error && (
                    <>
                        <div className="top-recurring-section__grid">
                            {data.map((donor) => (
                                <div
                                    key={donor.id}
                                    className="top-recurring-section__card"
                                >
                                    <div className="top-recurring-section__card-content">
                                        <Avatar className="top-recurring-section__avatar">
                                            {donor.avatar ? (
                                                <AvatarImage
                                                    src={donor.avatar}
                                                    alt={donor.donor_label}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <AvatarUserFallback />
                                            )}
                                        </Avatar>

                                        <div className="top-recurring-section__card-text">
                                            <span className="top-recurring-section__card-label">
                                                {donor.duration_label}
                                            </span>
                                            <span className="top-recurring-section__card-name">
                                                {donor.donor_label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="top-recurring-section__amount">
                                        {donor.total_amount_formatted}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.length === 0 && !isLoading && (
                            <div className="top-recurring-section__empty">
                                <p className="top-recurring-section__empty-text">
                                    {EMPTY_MESSAGE}
                                </p>
                            </div>
                        )}

                        {hasMore && (
                            <div className="top-recurring-section__load-more-row">
                                <button
                                    type="button"
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="top-recurring-section__load-more"
                                >
                                    {isLoading
                                        ? 'Загрузка…'
                                        : 'Загрузить больше'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
