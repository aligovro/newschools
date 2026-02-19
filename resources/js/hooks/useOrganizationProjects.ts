import { useCallback, useEffect, useState } from 'react';

export interface DashboardProjectItem {
    id: number;
    slug: string;
    title: string;
}

interface UseOrganizationProjectsResult {
    projects: DashboardProjectItem[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Загружает список проектов организации из dashboard API (JSON).
 * Используется в модалках виджетов top_donors / top_recurring_donors.
 */
export function useOrganizationProjects(
    organizationId: number | undefined,
): UseOrganizationProjectsResult {
    const [projects, setProjects] = useState<DashboardProjectItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!organizationId) {
            setProjects([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `/dashboard/organizations/${organizationId}/projects?per_page=100`,
                {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                },
            );
            const json = await res.json();
            if (json?.success && Array.isArray(json.data)) {
                setProjects(
                    json.data.map((p: { id: number; slug: string; title: string }) => ({
                        id: p.id,
                        slug: p.slug,
                        title: p.title,
                    })),
                );
            } else {
                setProjects([]);
            }
        } catch {
            setError('Не удалось загрузить список проектов');
            setProjects([]);
        } finally {
            setLoading(false);
        }
    }, [organizationId]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return { projects, loading, error, refetch: fetchProjects };
}
