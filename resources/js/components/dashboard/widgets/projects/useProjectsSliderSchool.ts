import { fetchLatestProjects } from '@/lib/api/public';
import { useCallback, useEffect, useState } from 'react';

export interface ProjectCategoryMeta {
    slug: string;
    name: string;
    count: number;
}

export interface ProjectForSchool {
    id: number;
    title: string;
    slug?: string | null;
    description?: string | null;
    short_description?: string | null;
    image?: string | null;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    formatted_target_amount: string;
    formatted_collected_amount: string;
    organization?: { id: number; name: string; slug?: string | null } | null;
    category?: string | null;
    donations_count?: number;
    autopayments_count?: number;
}

export interface ProjectsSliderSchoolMeta {
    categories: ProjectCategoryMeta[];
    total_target_rubles: number;
    total_target_formatted: string;
}

interface UseProjectsSliderSchoolResult {
    projects: ProjectForSchool[];
    meta: ProjectsSliderSchoolMeta | null;
    loading: boolean;
    error: string | null;
    activeCategory: string;
    setActiveCategory: (slug: string) => void;
}

function mapProject(raw: Record<string, unknown>): ProjectForSchool {
    const target =
        typeof raw.target_amount_rubles === 'number'
            ? raw.target_amount_rubles
            : raw.target_amount
              ? Number(raw.target_amount) / 100
              : 0;
    const collected =
        typeof raw.collected_amount_rubles === 'number'
            ? raw.collected_amount_rubles
            : raw.collected_amount
              ? Number(raw.collected_amount) / 100
              : 0;
    const progress =
        typeof raw.progress_percentage === 'number'
            ? raw.progress_percentage
            : target > 0
              ? Math.min(100, (collected / target) * 100)
              : 0;
    const org = raw.organization as Record<string, unknown> | undefined;
    return {
        id: Number(raw.id),
        title: String(raw.title ?? ''),
        slug: (raw.slug as string) ?? null,
        description: (raw.description as string) ?? (raw.short_description as string) ?? null,
        short_description: (raw.short_description as string) ?? null,
        image: (raw.image as string) ?? null,
        target_amount_rubles: target,
        collected_amount_rubles: collected,
        progress_percentage: progress,
        formatted_target_amount:
            (raw.formatted_target_amount as string) ??
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(target),
        formatted_collected_amount:
            (raw.formatted_collected_amount as string) ??
            new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(collected),
        organization: org
            ? {
                  id: Number(org.id),
                  name: String(org.name ?? ''),
                  slug: (org.slug as string) ?? null,
              }
            : null,
        category: (raw.category as string) ?? null,
        donations_count: typeof raw.donations_count === 'number' ? raw.donations_count : undefined,
    };
}

export function useProjectsSliderSchool(
    organizationId: number | undefined,
    limit: number,
    excludeSlug?: string,
): UseProjectsSliderSchoolResult {
    const [projects, setProjects] = useState<ProjectForSchool[]>([]);
    const [meta, setMeta] = useState<ProjectsSliderSchoolMeta | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategoryState] = useState<string>('');

    const setActiveCategory = useCallback((slug: string) => {
        setActiveCategoryState(slug);
    }, []);

    useEffect(() => {
        if (!organizationId || organizationId < 1) {
            setProjects([]);
            setMeta(null);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchLatestProjects(
                    {
                        organization_id: organizationId,
                        limit: Math.min(limit, 30),
                        category: activeCategory || undefined,
                        with_meta: 1,
                        exclude_slug: excludeSlug || undefined,
                    },
                    { signal: controller.signal },
                );

                const list: ProjectForSchool[] = Array.isArray(payload?.data)
                    ? payload.data.map((p: Record<string, unknown>) => mapProject(p))
                    : [];
                setProjects(list);

                const m = payload?.meta as Record<string, unknown> | undefined;
                if (m && Array.isArray(m.categories)) {
                    setMeta({
                        categories: (m.categories as ProjectCategoryMeta[]).map((c) => ({
                            slug: c.slug,
                            name: c.name,
                            count: c.count,
                        })),
                        total_target_rubles: Number(m.total_target_rubles ?? 0),
                        total_target_formatted: String(
                            m.total_target_formatted ??
                                new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }).format(Number(m.total_target_rubles ?? 0)),
                        ),
                    });
                } else {
                    setMeta(null);
                }
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить проекты',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [organizationId, limit, activeCategory, excludeSlug]);

    return {
        projects,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    };
}
