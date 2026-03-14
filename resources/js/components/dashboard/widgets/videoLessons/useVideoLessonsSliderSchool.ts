import { fetchOrganizationVideoLessons } from '@/lib/api/public';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    buildVideoCategoriesWithCounts,
    filterVideoLessonsByCategory,
    getCategoryLabel,
    getCategorySlugForVideoLesson,
} from './videoLessonCategoryConfig';

export interface VideoLessonForSchool {
    id: number;
    title: string;
    description?: string | null;
    video_url: string;
    embed_url?: string | null;
    thumbnail?: string | null;
    created_at?: string | null;
    category_slug?: string | null;
    category_label?: string | null;
}

interface UseVideoLessonsSliderSchoolResult {
    lessons: VideoLessonForSchool[];
    meta: { categories: Array<{ slug: string; label: string; count: number }> } | null;
    loading: boolean;
    error: string | null;
    activeCategory: string;
    setActiveCategory: (slug: string) => void;
}

function mapLesson(raw: Record<string, unknown>): VideoLessonForSchool {
    const title = String(raw.title ?? '');
    const description = (raw.description as string) ?? null;
    const categorySlug = getCategorySlugForVideoLesson(title, description);
    const slug = categorySlug ?? null;
    return {
        id: Number(raw.id),
        title,
        description,
        video_url: String(raw.video_url ?? ''),
        embed_url: (raw.embed_url as string) ?? null,
        thumbnail: (raw.thumbnail as string) ?? null,
        created_at: (raw.created_at as string) ?? null,
        category_slug: slug,
        category_label: slug ? getCategoryLabel(slug) : null,
    };
}

export function formatVideoLessonMeta(lesson: VideoLessonForSchool): string {
    const parts: string[] = [];
    if (lesson.category_label) parts.push(lesson.category_label);
    if (lesson.created_at) {
        try {
            const d = new Date(lesson.created_at);
            parts.push(
                d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
            );
        } catch {
            // ignore
        }
    }
    return parts.join(' · ') || '';
}

export function useVideoLessonsSliderSchool(
    organizationId: number | undefined,
    limit: number,
): UseVideoLessonsSliderSchoolResult {
    const [lessons, setLessons] = useState<VideoLessonForSchool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategoryState] = useState<string>('');

    const setActiveCategory = useCallback((slug: string) => {
        setActiveCategoryState(slug);
    }, []);

    useEffect(() => {
        if (!organizationId || organizationId < 1) {
            setLessons([]);
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchOrganizationVideoLessons(
                    { organization_id: organizationId, limit: Math.min(limit, 50) },
                    { signal: controller.signal },
                );
                const list: VideoLessonForSchool[] = Array.isArray(payload?.data)
                    ? payload.data.map((v: Record<string, unknown>) => mapLesson(v))
                    : [];
                setLessons(list);
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить видео уроки',
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
        if (lessons.length === 0) return null;
        const categories = buildVideoCategoriesWithCounts(lessons);
        return { categories };
    }, [lessons]);

    const filteredLessons = useMemo(
        () => filterVideoLessonsByCategory(lessons, activeCategory),
        [lessons, activeCategory],
    );

    return {
        lessons: filteredLessons,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    };
}
