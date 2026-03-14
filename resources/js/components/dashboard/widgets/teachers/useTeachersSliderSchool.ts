import { fetchOrganizationStaff } from '@/lib/api/public';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    buildCategoriesWithCounts,
    filterStaffByCategory,
} from './staffCategoryConfig';

export interface StaffMemberForSchool {
    id: number;
    full_name: string;
    position?: string | null;
    photo?: string | null;
}

export interface TeachersSliderSchoolMeta {
    categories: Array<{ slug: string; label: string; count: number }>;
}

interface UseTeachersSliderSchoolResult {
    staff: StaffMemberForSchool[];
    meta: TeachersSliderSchoolMeta | null;
    loading: boolean;
    error: string | null;
    activeCategory: string;
    setActiveCategory: (slug: string) => void;
}

function mapStaff(raw: Record<string, unknown>): StaffMemberForSchool {
    return {
        id: Number(raw.id),
        full_name: String(raw.full_name ?? ''),
        position: (raw.position as string) ?? null,
        photo: (raw.photo as string) ?? null,
    };
}

export function useTeachersSliderSchool(
    organizationId: number | undefined,
    limit: number,
): UseTeachersSliderSchoolResult {
    const [staff, setStaff] = useState<StaffMemberForSchool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategoryState] = useState<string>('');

    const setActiveCategory = useCallback((slug: string) => {
        setActiveCategoryState(slug);
    }, []);

    useEffect(() => {
        if (!organizationId || organizationId < 1) {
            setStaff([]);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchOrganizationStaff(
                    { organization_id: organizationId, limit: Math.min(limit, 50) },
                    { signal: controller.signal },
                );
                const list: StaffMemberForSchool[] = Array.isArray(payload?.data)
                    ? payload.data.map((s: Record<string, unknown>) => mapStaff(s))
                    : [];
                setStaff(list);
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить преподавателей',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [organizationId, limit]);

    const meta = useMemo(() => {
        if (staff.length === 0) return null;
        const categories = buildCategoriesWithCounts(staff);
        return { categories };
    }, [staff]);

    const filteredStaff = useMemo(
        () => filterStaffByCategory(staff, activeCategory),
        [staff, activeCategory],
    );

    return {
        staff: filteredStaff,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    };
}
