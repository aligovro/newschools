import { useEffect, useMemo, useState } from 'react';

export interface AlumniStatsData {
    supporters_count: number;
    total_donated: number;
    projects_count: number;
    total_projects_count?: number;
}

const statsPromiseCache = new Map<string, Promise<AlumniStatsData>>();
const statsValueCache = new Map<string, AlumniStatsData>();

const buildCacheKey = (organizationId?: number): string =>
    organizationId ? `org:${organizationId}` : 'all';

const fetchAlumniStats = (
    cacheKey: string,
    organizationId?: number,
): Promise<AlumniStatsData> => {
    if (!statsPromiseCache.has(cacheKey)) {
        const params = new URLSearchParams();
        if (organizationId) {
            params.set('organization_id', String(organizationId));
        }

        const queryString = params.toString();
        const request = fetch(
            `/api/public/alumni-stats${queryString ? `?${queryString}` : ''}`,
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        'Не удалось загрузить статистику выпускников',
                    );
                }
                return response.json() as Promise<AlumniStatsData>;
            })
            .then((data) => {
                statsValueCache.set(cacheKey, data);
                return data;
            })
            .catch((error) => {
                statsPromiseCache.delete(cacheKey);
                throw error;
            });

        statsPromiseCache.set(cacheKey, request);
    }

    return statsPromiseCache.get(cacheKey)!;
};

export const useAlumniStatsData = (
    organizationId?: number | null,
): {
    stats: AlumniStatsData | null;
    loading: boolean;
    error: string | null;
} => {
    const normalizedOrganizationId = useMemo(() => {
        if (
            typeof organizationId === 'number' &&
            Number.isFinite(organizationId) &&
            organizationId > 0
        ) {
            return organizationId;
        }

        return undefined;
    }, [organizationId]);

    const cacheKey = useMemo(
        () => buildCacheKey(normalizedOrganizationId),
        [normalizedOrganizationId],
    );

    const [stats, setStats] = useState<AlumniStatsData | null>(() => {
        return statsValueCache.get(cacheKey) ?? null;
    });
    const [loading, setLoading] = useState<boolean>(() => {
        return !statsValueCache.has(cacheKey);
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const cachedValue = statsValueCache.get(cacheKey);
        if (cachedValue) {
            setStats(cachedValue);
            setLoading(false);
            setError(null);
            return () => {
                isMounted = false;
            };
        }

        setStats(null);
        setLoading(true);
        setError(null);

        fetchAlumniStats(cacheKey, normalizedOrganizationId)
            .then((data) => {
                if (!isMounted) return;
                setStats(data);
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Не удалось загрузить статистику выпускников',
                );
                setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [cacheKey, normalizedOrganizationId]);

    return { stats, loading, error };
};

export const clearAlumniStatsCache = (organizationId?: number | null): void => {
    const normalizedOrganizationId =
        typeof organizationId === 'number' && organizationId > 0
            ? organizationId
            : undefined;
    const cacheKey = buildCacheKey(normalizedOrganizationId);
    statsPromiseCache.delete(cacheKey);
    statsValueCache.delete(cacheKey);
};
