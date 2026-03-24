import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Pagination, Sponsor, SortOption } from '@/components/sponsors/SponsorsSection';

const DEFAULT_PER_PAGE = 6;

interface SponsorsState {
    data: Sponsor[];
    pagination: Pagination;
    isLoaded: boolean;
}

interface Props {
    projectSlug: string;
    initialData: Sponsor[];
    initialPagination: Pagination;
}

const emptyPagination = (perPage = DEFAULT_PER_PAGE): Pagination => ({
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
});

const AvatarCell: React.FC<{ sponsor: Sponsor }> = ({ sponsor }) => (
    <div className="project-supporters__avatar">
        {sponsor.avatar ? (
            <img src={sponsor.avatar} alt={sponsor.name} width={36} height={36} />
        ) : (
            <img src="/icons/school-template/user.svg" alt="" width={24} height={24} aria-hidden="true" />
        )}
    </div>
);

const SponsorCell: React.FC<{ sponsor: Sponsor }> = React.memo(({ sponsor }) => (
    <div className="project-supporters__cell">
        <AvatarCell sponsor={sponsor} />
        <div className="project-supporters__info">
            <span className="project-supporters__count">
                {sponsor.donations_count} пожертвований
            </span>
            <span className="project-supporters__name">{sponsor.name}</span>
        </div>
        <div className="project-supporters__pill">
            {sponsor.total_amount_formatted}
        </div>
    </div>
));
SponsorCell.displayName = 'SponsorCell';

function chunkPairs<T>(arr: T[]): [T, T | null][] {
    const pairs: [T, T | null][] = [];
    for (let i = 0; i < arr.length; i += 2) {
        pairs.push([arr[i], arr[i + 1] ?? null]);
    }
    return pairs;
}

const ProjectSupportersSchool: React.FC<Props> = ({
    projectSlug,
    initialData,
    initialPagination,
}) => {
    const perPage = initialPagination?.per_page ?? DEFAULT_PER_PAGE;

    const [activeSort, setActiveSort] = useState<SortOption>('top');
    const [stateBySort, setStateBySort] = useState<Record<SortOption, SponsorsState>>({
        top: { data: initialData, pagination: initialPagination, isLoaded: true },
        recent: { data: [], pagination: emptyPagination(perPage), isLoaded: false },
    });
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const stateRef = useRef(stateBySort);
    useEffect(() => { stateRef.current = stateBySort; }, [stateBySort]);

    const activeState = stateBySort[activeSort];
    const hasMore = useMemo(
        () => activeState.pagination.current_page < activeState.pagination.last_page,
        [activeState],
    );

    const fetchPage = useCallback(
        async (sort: SortOption, page: number, append: boolean) => {
            abortRef.current?.abort();
            const ctrl = new AbortController();
            abortRef.current = ctrl;
            setIsLoading(true);
            try {
                const params = new URLSearchParams({
                    sort,
                    page: String(page),
                    per_page: String(perPage),
                });
                const res = await fetch(`/project/${projectSlug}/sponsors?${params}`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                    signal: ctrl.signal,
                });
                if (!res.ok) return;
                const payload = await res.json();
                const incoming: Sponsor[] = Array.isArray(payload?.data) ? payload.data : [];
                const pg: Pagination = payload?.pagination ?? emptyPagination(perPage);
                setStateBySort((prev) => {
                    const existing = prev[sort];
                    return {
                        ...prev,
                        [sort]: {
                            data: append ? [...existing.data, ...incoming] : incoming,
                            pagination: pg,
                            isLoaded: true,
                        },
                    };
                });
            } catch (e) {
                if ((e as Error).name !== 'AbortError') console.error(e);
            } finally {
                setIsLoading(false);
            }
        },
        [projectSlug, perPage],
    );

    const handleTabChange = useCallback(
        (sort: SortOption) => {
            if (sort === activeSort) return;
            setActiveSort(sort);
            if (!stateRef.current[sort].isLoaded) {
                void fetchPage(sort, 1, false);
            }
        },
        [activeSort, fetchPage],
    );

    const handleLoadMore = useCallback(() => {
        if (isLoading) return;
        const state = stateRef.current[activeSort];
        if (state.pagination.current_page >= state.pagination.last_page) return;
        void fetchPage(activeSort, state.pagination.current_page + 1, true);
    }, [activeSort, fetchPage, isLoading]);

    if (!initialData.length && initialPagination.total === 0) return null;

    const recentTotal = stateBySort.recent.pagination.total;
    const rows = chunkPairs(activeState.data);

    return (
        <section className="project-supporters">
            <h2 className="project-supporters__heading">Поддерживают проект</h2>

            {/* Tabs */}
            <div className="project-supporters__tabs">
                <button
                    type="button"
                    className={`project-supporters__tab${activeSort === 'top' ? ' project-supporters__tab--active' : ''}`}
                    onClick={() => handleTabChange('top')}
                >
                    Топ спонсоров
                </button>
                <button
                    type="button"
                    className={`project-supporters__tab${activeSort === 'recent' ? ' project-supporters__tab--active' : ''}`}
                    onClick={() => handleTabChange('recent')}
                    disabled={isLoading && activeSort !== 'recent'}
                >
                    Все поступления
                    {recentTotal > 0 && (
                        <> · {recentTotal.toLocaleString('ru-RU')}</>
                    )}
                </button>
            </div>

            {/* Grid */}
            <div className="project-supporters__list">
                {rows.map(([left, right], idx) => (
                    <div key={idx} className="project-supporters__row">
                        <SponsorCell sponsor={left} />
                        {right ? (
                            <SponsorCell sponsor={right} />
                        ) : (
                            <div className="project-supporters__cell project-supporters__cell--empty" />
                        )}
                    </div>
                ))}
                {activeState.data.length === 0 && !isLoading && (
                    <p className="project-supporters__empty">Нет данных</p>
                )}
            </div>

            {(hasMore || isLoading) && (
                <button
                    type="button"
                    className="project-supporters__load-more"
                    onClick={handleLoadMore}
                    disabled={isLoading || !hasMore}
                >
                    {isLoading ? 'Загрузка...' : 'Загрузить больше'}
                </button>
            )}
        </section>
    );
};

export default ProjectSupportersSchool;
