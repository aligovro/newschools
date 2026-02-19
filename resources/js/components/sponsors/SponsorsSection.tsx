import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    Avatar,
    AvatarImage,
    AvatarUserFallback,
} from '@/components/ui/avatar';


export type SortOption = 'top' | 'recent';

export interface Sponsor {
    id: string;
    name: string;
    avatar?: string | null;
    total_amount: number;
    total_amount_formatted: string;
    latest_donation_at?: string | null;
    donations_count: number;
}

export interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface SponsorsState {
    data: Sponsor[];
    pagination: Pagination;
    isLoaded: boolean;
}

export interface SponsorsPayload {
    sort: SortOption;
    data: Sponsor[];
    pagination: Pagination;
}

export interface SponsorsSectionProps {
    title: string;
    fetchEndpoint: string;
    initialData: Sponsor[];
    initialPagination: Pagination;
    initialSort?: SortOption;
    monthlyLabel?: string;
    emptyStateMessage?: string;
}

const SORT_BUTTONS: { key: SortOption; label: string }[] = [
    { key: 'top', label: 'Топ спонсоров' },
    { key: 'recent', label: 'Все поступления' },
];

const DEFAULT_MONTHLY_LABEL = 'Ежемесячная подписка на помощь';
const DEFAULT_EMPTY_MESSAGE =
    'Спонсоры ещё не отображаются. Станьте первым, кто поддержит инициативу.';
const DEFAULT_PER_PAGE = 6;

export const createEmptyPagination = (
    perPage = DEFAULT_PER_PAGE,
): Pagination => ({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
});

const formatInitialState = (
    targetSort: SortOption,
    initialSort: SortOption,
    initialData: Sponsor[],
    initialPagination: Pagination,
): SponsorsState => {
    if (targetSort === initialSort) {
        return {
            data: initialData,
            pagination: initialPagination,
            isLoaded: true,
        };
    }

    return {
        data: [],
        pagination: createEmptyPagination(
            initialPagination?.per_page ?? DEFAULT_PER_PAGE,
        ),
        isLoaded: false,
    };
};

const useLatestRef = <T,>(value: T) => {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
};

export default function SponsorsSection({
    title,
    fetchEndpoint,
    initialData,
    initialPagination,
    initialSort = 'top',
    monthlyLabel = DEFAULT_MONTHLY_LABEL,
    emptyStateMessage = DEFAULT_EMPTY_MESSAGE,
}: SponsorsSectionProps) {
    const [activeSort, setActiveSort] = useState<SortOption>(initialSort);
    const [stateBySort, setStateBySort] = useState<
        Record<SortOption, SponsorsState>
    >(() => ({
        top: formatInitialState(
            'top',
            initialSort,
            initialData,
            initialPagination,
        ),
        recent: formatInitialState(
            'recent',
            initialSort,
            initialData,
            initialPagination,
        ),
    }));
    const stateBySortRef = useLatestRef(stateBySort);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const activeState = stateBySort[activeSort];

    const hasMore = useMemo(() => {
        if (!activeState) return false;
        return (
            activeState.pagination.current_page <
            activeState.pagination.last_page
        );
    }, [activeState]);

    const fetchSponsors = useCallback(
        async (sort: SortOption, page = 1, append = false) => {
            const perPage =
                stateBySortRef.current?.[sort]?.pagination?.per_page ??
                initialPagination?.per_page ??
                DEFAULT_PER_PAGE;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    sort,
                    page: String(page),
                    per_page: String(perPage),
                });

                const response = await fetch(
                    `${fetchEndpoint}?${params.toString()}`,
                    {
                        headers: {
                            Accept: 'application/json',
                        },
                        credentials: 'same-origin',
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Не удалось загрузить спонсоров (код ${response.status})`,
                    );
                }

                const payload: SponsorsPayload = await response.json();

                const incomingData = Array.isArray(payload?.data)
                    ? payload.data
                    : [];
                const pagination =
                    payload?.pagination ?? createEmptyPagination(perPage);

                setStateBySort((prev) => {
                    const previous = prev[sort] ?? {
                        data: [],
                        pagination: createEmptyPagination(perPage),
                        isLoaded: false,
                    };

                    const mergedData = append
                        ? [...previous.data, ...incomingData]
                        : incomingData;

                    return {
                        ...prev,
                        [sort]: {
                            data: mergedData,
                            pagination: {
                                current_page: pagination.current_page ?? page,
                                last_page: pagination.last_page ?? page,
                                per_page: pagination.per_page ?? perPage,
                                total: pagination.total ?? mergedData.length,
                            },
                            isLoaded: true,
                        },
                    };
                });
            } catch (fetchError) {
                if ((fetchError as Error).name === 'AbortError') {
                    return;
                }
                console.error(fetchError);
                setError('Не удалось загрузить спонсоров. Попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        },
        [fetchEndpoint, initialPagination?.per_page, stateBySortRef],
    );

    const handleSortChange = useCallback(
        (sort: SortOption) => {
            if (sort === activeSort) {
                return;
            }

            setActiveSort(sort);
            setError(null);

            if (!stateBySortRef.current?.[sort]?.isLoaded) {
                void fetchSponsors(sort, 1, false);
            }
        },
        [activeSort, fetchSponsors, stateBySortRef],
    );

    const handleLoadMore = useCallback(() => {
        const state = stateBySortRef.current?.[activeSort];

        if (!state || isLoading) {
            return;
        }

        if (state.pagination.current_page >= state.pagination.last_page) {
            return;
        }

        const nextPage = state.pagination.current_page + 1;
        void fetchSponsors(activeSort, nextPage, true);
    }, [activeSort, fetchSponsors, isLoading, stateBySortRef]);

    const renderSponsorCard = useCallback(
        (sponsor: Sponsor) => (
            <div key={sponsor.id} className="sponsors-section__card">
                <div className="sponsors-section__card-content">
                    <Avatar className="sponsors-section__avatar">
                        {sponsor.avatar ? (
                            <AvatarImage
                                src={sponsor.avatar}
                                alt={sponsor.name}
                                className="object-cover"
                            />
                        ) : (
                            <AvatarUserFallback />
                        )}
                    </Avatar>

                    <div className="sponsors-section__card-text">
                        <span className="sponsors-section__card-label">
                            {monthlyLabel}
                        </span>
                        <span className="sponsors-section__card-name">
                            {sponsor.name}
                        </span>
                    </div>
                </div>

                <div className="sponsors-section__amount">
                    {sponsor.total_amount_formatted}
                </div>
            </div>
        ),
        [monthlyLabel],
    );

    if (!activeState?.isLoaded && !isLoading) {
        return null;
    }

    return (
        <section className="sponsors-section mt-12">
            <div className="sponsors-section__wrapper">
                <div className="sponsors-section__header">
                    <h2 className="sponsors-section__title">
                        {title} · {activeState?.pagination?.total ?? 0}
                    </h2>
                    <div className="sponsors-section__sort-row">
                        {SORT_BUTTONS.map((button) => {
                            const isActive = button.key === activeSort;
                            const classes = [
                                'sponsors-section__sort-button',
                                isActive
                                    ? 'sponsors-section__sort-button--active'
                                    : '',
                                isLoading && !isActive
                                    ? 'sponsors-section__sort-button--disabled'
                                    : '',
                            ]
                                .filter(Boolean)
                                .join(' ');

                            return (
                                <button
                                    key={button.key}
                                    type="button"
                                    onClick={() =>
                                        handleSortChange(button.key)
                                    }
                                    disabled={isLoading && !isActive}
                                    className={classes}
                                >
                                    {button.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {error && (
                    <div
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="sponsors-section__grid">
                    {activeState?.data.map(renderSponsorCard)}
                </div>

                {activeState?.data.length === 0 && !isLoading && !error && (
                    <div className="sponsors-section__empty">
                        <p className="sponsors-section__empty-text">
                            {emptyStateMessage}
                        </p>
                    </div>
                )}

                {(hasMore || isLoading) && (
                    <div className="sponsors-section__load-more-row">
                        <button
                            type="button"
                            onClick={handleLoadMore}
                            disabled={isLoading || !hasMore}
                            className="sponsors-section__load-more"
                        >
                            {isLoading ? 'Загрузка…' : 'Загрузить больше'}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
