import type { WidgetData, WidgetPosition } from '@/components/dashboard/site-builder/types';
import { VideoLessonsSliderSchoolCard } from '@/components/dashboard/widgets/videoLessons/VideoLessonsSliderSchoolCard';
import type { VideoLessonForSchool } from '@/components/dashboard/widgets/videoLessons/useVideoLessonsSliderSchool';
import { fetchOrganizationVideoLessons } from '@/lib/api/public';
import {
    buildVideoCategoriesWithCounts,
    filterVideoLessonsByCategory,
    getCategoryLabel,
    getCategorySlugForVideoLesson,
} from '@/components/dashboard/widgets/videoLessons/videoLessonCategoryConfig';
import { SchoolCtaPill } from '@/components/site/school/SchoolCtaPill';
import MainLayout from '@/layouts/MainLayout';
import React, { useCallback, useMemo, useState } from 'react';

interface Site {
    id: number;
    name: string;
    slug: string;
    description?: string;
    favicon?: string;
    template: string;
    site_type: string;
    organization_id?: number;
    widgets_config: WidgetData[];
    seo_config?: Record<string, unknown>;
    layout_config?: { sidebar_position?: 'left' | 'right' };
    custom_css?: string | null;
}

interface RawLesson {
    id: number;
    title: string;
    description?: string | null;
    video_url: string;
    embed_url?: string | null;
    thumbnail?: string | null;
    created_at?: string | null;
}

interface Props {
    site: Site;
    lessons: RawLesson[];
    total: number;
    has_more: boolean;
    per_page: number;
    positions?: WidgetPosition[];
    position_settings?: Array<{
        position_slug: string;
        visibility_rules?: Record<string, unknown>;
        layout_overrides?: Record<string, unknown>;
    }>;
    seo?: { title?: string; description?: string };
}

function mapLesson(raw: RawLesson): VideoLessonForSchool {
    const slug = getCategorySlugForVideoLesson(raw.title, raw.description ?? null);
    return {
        id:             raw.id,
        title:          raw.title,
        description:    raw.description ?? null,
        video_url:      raw.video_url,
        embed_url:      raw.embed_url ?? null,
        thumbnail:      raw.thumbnail ?? null,
        created_at:     raw.created_at ?? null,
        category_slug:  slug ?? null,
        category_label: slug ? getCategoryLabel(slug) : null,
    };
}

export default function VideoLessonsAll({
    site,
    lessons: initialLessons,
    has_more: initialHasMore,
    per_page: perPage,
    positions = [],
    position_settings = [],
    seo,
}: Props) {
    const [lessons, setLessons]     = useState<VideoLessonForSchool[]>(initialLessons.map(mapLesson));
    const [hasMore, setHasMore]     = useState(initialHasMore);
    const [loading, setLoading]     = useState(false);
    const [activeCategory, setActiveCategory] = useState('');

    const categories = useMemo(() => buildVideoCategoriesWithCounts(lessons), [lessons]);

    const visibleLessons = useMemo(
        () => filterVideoLessonsByCategory(lessons, activeCategory),
        [lessons, activeCategory],
    );

    const loadMore = useCallback(async () => {
        if (loading || !hasMore || !site.organization_id) return;
        setLoading(true);
        try {
            const result = await fetchOrganizationVideoLessons({
                organization_id: site.organization_id,
                limit:  perPage,
                offset: lessons.length,
            });
            const next = ((result.data ?? []) as RawLesson[]).map(mapLesson);
            setLessons((prev) => [...prev, ...next]);
            setHasMore(result.has_more ?? false);
        } finally {
            setLoading(false);
        }
    }, [hasMore, lessons.length, loading, perPage, site.organization_id]);

    const pageTitle = seo?.title ?? `Видео уроки — ${site.name}`;

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            seo={seo}
            pageTitle={pageTitle}
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Видео уроки', href: '' },
            ]}
        >
            <section className="video-lessons-all">
                <h1 className="video-lessons-all__title">Видео уроки</h1>

                {categories.length > 1 && (
                    <div className="video-lessons-all__filters">
                        <button
                            type="button"
                            className={`video-lessons-all__filter-btn${activeCategory === '' ? ' video-lessons-all__filter-btn--active' : ''}`}
                            onClick={() => setActiveCategory('')}
                        >
                            Все
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.slug}
                                type="button"
                                className={`video-lessons-all__filter-btn${activeCategory === cat.slug ? ' video-lessons-all__filter-btn--active' : ''}`}
                                onClick={() => setActiveCategory(cat.slug)}
                            >
                                {cat.label}
                                <span className="video-lessons-all__filter-count">{cat.count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {visibleLessons.length === 0 && !loading && (
                    <p className="video-lessons-all__empty">Видео уроки не добавлены</p>
                )}

                {visibleLessons.length > 0 && (
                    <div className="video-lessons-all__grid">
                        {visibleLessons.map((lesson) => (
                            <VideoLessonsSliderSchoolCard key={lesson.id} lesson={lesson} />
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="video-lessons-all__load-more">
                        <SchoolCtaPill
                            type="button"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? 'Загрузка…' : 'Загрузить ещё'}
                        </SchoolCtaPill>
                    </div>
                )}
            </section>
        </MainLayout>
    );
}
