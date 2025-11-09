import {
    type CSSProperties,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type SortOption = 'top' | 'recent';

interface Sponsor {
    id: string;
    name: string;
    avatar?: string | null;
    total_amount: number;
    total_amount_formatted: string;
    latest_donation_at?: string | null;
    donations_count: number;
}

interface Pagination {
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

interface SponsorsPayload {
    sort: SortOption;
    data: Sponsor[];
    pagination: Pagination;
}

interface ProjectSponsorsSectionProps {
    projectSlug: string;
    initialData: Sponsor[];
    initialPagination: Pagination;
    initialSort?: SortOption;
}

const SORT_BUTTONS: { key: SortOption; label: string }[] = [
    { key: 'top', label: 'Топ спонсоров' },
    { key: 'recent', label: 'Все поступления' },
];

const MONTHLY_LABEL = 'Ежемесячная подписка на помощь';

const createEmptyPagination = (perPage = 6): Pagination => ({
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
        pagination: createEmptyPagination(initialPagination?.per_page ?? 6),
        isLoaded: false,
    };
};

const nameToInitials = (name?: string | null): string => {
    if (!name) return '•';
    const trimmed = name.trim();
    if (!trimmed) return '•';
    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return (first + second).toUpperCase() || trimmed[0]?.toUpperCase() || '•';
};

export default function ProjectSponsorsSection({
    projectSlug,
    initialData,
    initialPagination,
    initialSort = 'top',
}: ProjectSponsorsSectionProps) {
    const [activeSort, setActiveSort] = useState<SortOption>(initialSort);
    const [stateBySort, setStateBySort] = useState<Record<SortOption, SponsorsState>>({
        top: formatInitialState('top', initialSort, initialData, initialPagination),
        recent: formatInitialState('recent', initialSort, initialData, initialPagination),
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const activeState = stateBySort[activeSort];

    const hasMore = useMemo(() => {
        if (!activeState) return false;
        return activeState.pagination.current_page < activeState.pagination.last_page;
    }, [activeState]);

    const fetchSponsors = useCallback(
        async (sort: SortOption, page = 1, append = false) => {
            const perPage =
                stateBySort[sort]?.pagination?.per_page ??
                initialPagination?.per_page ??
                6;

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
                    `/project/${projectSlug}/sponsors?${params.toString()}`,
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
                const pagination = payload?.pagination ?? createEmptyPagination(perPage);

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
                                current_page:
                                    pagination.current_page ?? page,
                                last_page: pagination.last_page ?? page,
                                per_page: pagination.per_page ?? perPage,
                                total:
                                    pagination.total ??
                                    mergedData.length,
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
        [initialPagination?.per_page, projectSlug, stateBySort],
    );

    const handleSortChange = useCallback(
        (sort: SortOption) => {
            if (sort === activeSort) {
                return;
            }

            setActiveSort(sort);
            setError(null);

            if (!stateBySort[sort]?.isLoaded) {
                void fetchSponsors(sort, 1, false);
            }
        },
        [activeSort, fetchSponsors, stateBySort],
    );

    const handleLoadMore = useCallback(() => {
        const state = stateBySort[activeSort];

        if (!state) {
            return;
        }

        if (isLoading) {
            return;
        }

        if (state.pagination.current_page >= state.pagination.last_page) {
            return;
        }

        const nextPage = state.pagination.current_page + 1;
        void fetchSponsors(activeSort, nextPage, true);
    }, [activeSort, fetchSponsors, isLoading, stateBySort]);

    const renderSponsorCard = (sponsor: Sponsor) => {
        return (
            <div
                key={sponsor.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#e8ecf3] bg-white px-4 py-3"
            >
                <div className="flex items-center gap-3">
                    <Avatar
                        style={{ width: 36, height: 36 }}
                        className="overflow-hidden"
                    >
                        {sponsor.avatar ? (
                            <AvatarImage
                                src={sponsor.avatar}
                                alt={sponsor.name}
                                className="object-cover"
                            />
                        ) : (
                            <AvatarFallback
                                className="bg-[#eef2fb] text-xs font-semibold uppercase text-[#3a4d91]"
                                style={{ fontSize: '12px' }}
                            >
                                {nameToInitials(sponsor.name)}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex flex-col">
                        <span
                            style={{
                                fontFamily: 'var(--font-family)',
                                fontWeight: 500,
                                fontSize: '10px',
                                lineHeight: '120%',
                                color: '#6c7178',
                            }}
                        >
                            {MONTHLY_LABEL}
                        </span>
                        <span
                            style={{
                                fontFamily: 'var(--font-family)',
                                fontWeight: 600,
                                fontSize: '14px',
                                lineHeight: '120%',
                                color: '#1a1a1a',
                            }}
                        >
                            {sponsor.name}
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        borderRadius: '6px',
                        padding: '6px 12px',
                        minWidth: '74px',
                        background: 'linear-gradient(84deg, #96bdff 0%, #3259ff 100%)',
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '10px',
                        lineHeight: '120%',
                        textAlign: 'center',
                        color: '#fff',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {sponsor.total_amount_formatted}
                </div>
            </div>
        );
    };

    if (!activeState?.isLoaded && !isLoading) {
        // При серверном рендеринге, если нет данных, секция скрывается.
        return null;
    }

    return (
        <section className="mt-12 space-y-6">
            <div className="flex flex-col gap-4">
                <h2
                    style={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 600,
                        fontSize: '18px',
                        lineHeight: '120%',
                        color: '#1a1a1a',
                    }}
                >
                    Спонсоры проекта · {activeState?.pagination?.total ?? 0}
                </h2>

                <div className="flex flex-wrap gap-3">
                    {SORT_BUTTONS.map((button) => {
                        const isActive = button.key === activeSort;
                        const baseStyle: CSSProperties = {
                            borderRadius: '10px',
                            padding: '12px 16px',
                            minWidth: '130px',
                            height: '36px',
                            fontFamily: 'var(--font-family)',
                            fontWeight: 600,
                            fontSize: '10px',
                            lineHeight: '120%',
                            textAlign: 'center',
                            cursor: isLoading ? 'progress' : 'pointer',
                            transition: 'background-color 0.2s ease, color 0.2s ease',
                            border: '1px solid #e8ecf3',
                            background: '#ffffff',
                            color: '#1a1a1a',
                        };

                        const activeStyle: CSSProperties = isActive
                            ? {
                                  background: '#3a4d91',
                                  color: '#ffffff',
                                  border: '1px solid #3a4d91',
                              }
                            : {};

                        return (
                            <button
                                key={button.key}
                                type="button"
                                onClick={() => handleSortChange(button.key)}
                                disabled={isLoading && !isActive}
                                style={{
                                    ...baseStyle,
                                    ...activeStyle,
                                    opacity: isLoading && !isActive ? 0.7 : 1,
                                }}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activeState?.data.map(renderSponsorCard)}
            </div>

            {activeState?.data.length === 0 && !isLoading && !error && (
                <div
                    className="rounded-lg border border-dashed border-[#e8ecf3] bg-white px-4 py-6 text-center"
                    style={{
                        fontFamily: 'var(--font-family)',
                        fontWeight: 500,
                        fontSize: '12px',
                        lineHeight: '140%',
                        color: '#6c7178',
                    }}
                >
                    Спонсоры проекта ещё не отображаются. Станьте первым, кто
                    поддержит проект.
                </div>
            )}

            {(hasMore || isLoading) && (
                <div className="flex">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoading || !hasMore}
                        style={{
                            fontFamily: 'var(--font-family)',
                            fontWeight: 600,
                            fontSize: '12px',
                            lineHeight: '120%',
                            letterSpacing: '0.01em',
                            color: '#3a4d91',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                            cursor: hasMore ? 'pointer' : 'default',
                            opacity: isLoading ? 0.7 : 1,
                        }}
                    >
                        {isLoading ? 'Загрузка…' : 'Загрузить больше'}
                    </button>
                </div>
            )}
        </section>
    );
}

