import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Pagination } from '@/components/sponsors/SponsorsSection';
import { createEmptyPagination } from '@/components/sponsors/SponsorsSection';
import { nameToInitials } from '@/utils/nameToInitials';


export interface Alumni {
    id: string | number;
    name: string;
    photo?: string | null;
    graduation?: string | null;
    class?: string | null;
    profession?: string | null;
    company?: string | null;
}

export interface AlumniPayload {
    data: Alumni[];
    pagination: Pagination;
}

interface AlumniSectionProps {
    title?: string;
    fetchEndpoint: string;
    initialData: Alumni[];
    initialPagination: Pagination;
    emptyStateMessage?: string;
}

interface AlumniState {
    data: Alumni[];
    pagination: Pagination;
    isLoaded: boolean;
}

const DEFAULT_TITLE = 'Выпускники школы';
const DEFAULT_EMPTY_MESSAGE =
    'Выпускники школы ещё не отображаются. Расскажите о первых историях успеха.';

const formatInitialState = (
    initialData: Alumni[],
    initialPagination: Pagination,
): AlumniState => ({
    data: initialData,
    pagination: initialPagination,
    isLoaded: initialData.length > 0 || (initialPagination?.total ?? 0) > 0,
});

export default function OrganizationAlumniSection({
    title = DEFAULT_TITLE,
    fetchEndpoint,
    initialData,
    initialPagination,
    emptyStateMessage = DEFAULT_EMPTY_MESSAGE,
}: AlumniSectionProps) {
    const [state, setState] = useState<AlumniState>(() =>
        formatInitialState(initialData, initialPagination),
    );
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

    const hasMore = useMemo(() => {
        if (!state.isLoaded) return false;
        return state.pagination.current_page < state.pagination.last_page;
    }, [state]);

    const fetchAlumni = useCallback(
        async (page = 1, append = false) => {
            const perPage = state.pagination?.per_page ?? initialPagination?.per_page ?? 6;

            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            const controller = new AbortController();
            abortControllerRef.current = controller;

            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    page: String(page),
                    per_page: String(perPage),
                });

                const response = await fetch(`${fetchEndpoint}?${params.toString()}`, {
                    headers: {
                        Accept: 'application/json',
                    },
                    credentials: 'same-origin',
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Не удалось загрузить выпускников (код ${response.status})`);
                }

                const payload: AlumniPayload = await response.json();
                const incomingData = Array.isArray(payload?.data) ? payload.data : [];
                const pagination = payload?.pagination ?? createEmptyPagination(perPage);

                setState((prev) => {
                    const mergedData = append ? [...prev.data, ...incomingData] : incomingData;

                    return {
                        data: mergedData,
                        pagination: {
                            current_page: pagination.current_page ?? page,
                            last_page: pagination.last_page ?? page,
                            per_page: pagination.per_page ?? perPage,
                            total: pagination.total ?? mergedData.length,
                        },
                        isLoaded: true,
                    };
                });
            } catch (fetchError) {
                if ((fetchError as Error).name === 'AbortError') {
                    return;
                }
                console.error(fetchError);
                setError('Не удалось загрузить выпускников. Попробуйте позже.');
            } finally {
                setIsLoading(false);
            }
        },
        [fetchEndpoint, initialPagination?.per_page, state.pagination?.per_page],
    );

    const handleLoadMore = useCallback(() => {
        if (isLoading || !state.isLoaded) {
            return;
        }

        if (state.pagination.current_page >= state.pagination.last_page) {
            return;
        }

        const nextPage = state.pagination.current_page + 1;
        void fetchAlumni(nextPage, true);
    }, [fetchAlumni, isLoading, state]);

    const renderCard = useCallback(
        (alumnus: Alumni) => {
            const metaParts = [alumnus.profession, alumnus.company].filter(Boolean);
            const meta = metaParts.join(', ');

            return (
                <div
                    key={alumnus.id}
                    className="alumni-section__card flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="alumni-section__avatar">
                            {alumnus.photo ? (
                                <AvatarImage
                                    src={alumnus.photo}
                                    alt={alumnus.name}
                                    className="object-cover"
                                />
                            ) : (
                                <AvatarFallback className="alumni-section__avatar-fallback">
                                    {nameToInitials(alumnus.name)}
                                </AvatarFallback>
                            )}
                        </Avatar>

                        <div className="flex flex-col">
                            {(alumnus.graduation || alumnus.class) && (
                                <span className="alumni-section__card-label">
                                    {[alumnus.graduation, alumnus.class].filter(Boolean).join(' · ')}
                                </span>
                            )}
                            <span className="alumni-section__card-name">{alumnus.name}</span>
                            {meta && (
                                <span className="alumni-section__card-label" style={{ color: '#1a1a1a' }}>
                                    {meta}
                                </span>
                            )}
                        </div>
                    </div>

                    {(alumnus.graduation || alumnus.class) && (
                        <div className="alumni-section__badge">
                            {alumnus.graduation ?? alumnus.class}
                        </div>
                    )}
                </div>
            );
        },
        [],
    );

    if (!state.isLoaded && !isLoading) {
        return null;
    }

    return (
        <section className="alumni-section mt-12 space-y-6">
            <div className="flex flex-col gap-4">
                <h2 className="alumni-section__title">
                    {title} · {state.pagination.total ?? state.data.length}
                </h2>
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
                {state.data.map(renderCard)}
            </div>

            {state.data.length === 0 && !isLoading && !error && (
                <div className="alumni-section__empty">
                    <p className="alumni-section__empty-text">{emptyStateMessage}</p>
                </div>
            )}

            {(hasMore || isLoading) && (
                <div className="flex">
                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoading || !hasMore}
                        className="alumni-section__load-more"
                    >
                        {isLoading ? 'Загрузка…' : 'Показать ещё'}
                    </button>
                </div>
            )}
        </section>
    );
}

