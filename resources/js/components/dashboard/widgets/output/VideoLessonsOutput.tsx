import { fetchOrganizationVideoLessons } from '@/lib/api/public';
import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VideoLessonsSliderSchoolWidget } from '../videoLessons/VideoLessonsSliderSchoolWidget';
import { WidgetOutputProps } from './types';

interface VideoLesson {
    id: number;
    title: string;
    description?: string | null;
    video_url: string;
    embed_url?: string | null;
    thumbnail?: string | null;
}

function parseOrgId(value: unknown): number | undefined {
    if (value == null || value === '') return undefined;
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}

export const VideoLessonsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const page = usePage();
    const siteProps = (page?.props as Record<string, unknown>)?.site as
        | Record<string, unknown>
        | undefined;

    const cfg = (widget.config || {}) as Record<string, unknown>;
    const configs = (
        widget as {
            configs?: Array<{
                config_key: string;
                config_value: string;
                config_type: string;
            }>;
        }
    ).configs;

    const fromConfigs = configs?.find(
        (c) =>
            c.config_key === 'organization_id' ||
            c.config_key === 'organizationId',
    );

    const orgIdFromSiteProps =
        parseOrgId(siteProps?.organization_id) ??
        parseOrgId(siteProps?.organizationId);

    const organization_id =
        parseOrgId(cfg.organization_id) ??
        parseOrgId(cfg.organizationId) ??
        (fromConfigs
            ? parseOrgId(
                  fromConfigs.config_type === 'number'
                      ? parseFloat(fromConfigs.config_value)
                      : fromConfigs.config_value,
              )
            : undefined) ??
        orgIdFromSiteProps;

    const title = (cfg.title as string) || 'Видео уроки';
    const show_title = (cfg.show_title as boolean) ?? true;
    const limit = cfg.limit ? Number(cfg.limit) : 12;
    const columns = cfg.columns ? Number(cfg.columns) : 3;
    const providedLessons = Array.isArray(cfg.video_lessons)
        ? (cfg.video_lessons as VideoLesson[])
        : [];

    const [fetched, setFetched] = useState<VideoLesson[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const displayLessons = useMemo(() => {
        const list =
            providedLessons.length > 0 ? providedLessons : fetched || [];
        return limit > 0 ? list.slice(0, limit) : list;
    }, [providedLessons, fetched, limit]);

    const hasData =
        providedLessons.length > 0 || (fetched && fetched.length > 0);

    const siteTemplate = (
        siteProps as Record<string, unknown>
    )?.template as string | undefined;
    const isSchool = siteTemplate === 'school';

    useEffect(() => {
        if (providedLessons.length > 0 || !organization_id || isSchool) return;

        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);
                const payload = await fetchOrganizationVideoLessons(
                    { organization_id, limit: Math.min(limit, 50) },
                    { signal: controller.signal },
                );
                const list: VideoLesson[] = Array.isArray(payload?.data)
                    ? payload.data.map((v: Record<string, unknown>) => ({
                          id: Number(v.id),
                          title: String(v.title ?? ''),
                          description: (v.description as string) ?? null,
                          video_url: String(v.video_url ?? ''),
                          embed_url: (v.embed_url as string) ?? null,
                          thumbnail: (v.thumbnail as string) ?? null,
                      }))
                    : [];
                setFetched(list);
            } catch (e: unknown) {
                if ((e as { name?: string })?.name !== 'AbortError') {
                    setError(
                        e instanceof Error
                            ? e.message
                            : 'Не удалось загрузить видео',
                    );
                }
            } finally {
                setLoading(false);
            }
        };

        run();
        return () => controller.abort();
    }, [organization_id, limit, providedLessons.length, isSchool]);

    const config = useMemo(
        () => ({
            title,
            show_title,
            organization_id: organization_id ?? undefined,
            limit,
        }),
        [title, show_title, organization_id, limit],
    );

    const getGridClasses = useCallback((cols: number) => {
        switch (cols) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-1 md:grid-cols-2';
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    }, []);

    const renderCard = (lesson: VideoLesson) => {
        const embedUrl = lesson.embed_url;
        const thumbUrl =
            lesson.thumbnail && !String(lesson.thumbnail).startsWith('blob:')
                ? lesson.thumbnail
                : null;

        return (
            <div
                key={lesson.id}
                className="video-lessons-output__card overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
                <div className="aspect-video overflow-hidden bg-gray-100">
                    {embedUrl ? (
                        // YouTube/Vimeo embed
                        <iframe
                            src={embedUrl}
                            title={lesson.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : thumbUrl ? (
                        // Custom thumbnail with link
                        <a
                            href={lesson.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                src={thumbUrl}
                                alt={lesson.title}
                                className="h-full w-full object-cover"
                            />
                        </a>
                    ) : (
                        // Fallback: link only
                        <a
                            href={lesson.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500"
                        >
                            Видео
                        </a>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="mb-2 font-semibold text-gray-900">
                        {lesson.title}
                    </h3>
                    {lesson.description && (
                        <p className="line-clamp-3 text-sm text-gray-600">
                            {lesson.description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    if (isSchool) {
        return (
            <div
                className={`video-lessons-output ${className || ''}`.trim()}
                style={style}
            >
                <VideoLessonsSliderSchoolWidget config={config} />
            </div>
        );
    }

    return (
        <div
            className={`video-lessons-output ${className || ''}`.trim()}
            style={style}
        >
            {title && show_title && (
                <div className="block__header">
                    <h2 className="block__title">{title}</h2>
                </div>
            )}

            {loading && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Загрузка…</span>
                </div>
            )}

            {error && !loading && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {!loading && !error && !hasData && (
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Видео уроки не настроены
                    </span>
                </div>
            )}

            {!loading && !error && displayLessons.length > 0 && (
                <div className={`grid gap-6 ${getGridClasses(columns)}`}>
                    {displayLessons.map(renderCard)}
                </div>
            )}
        </div>
    );
};

export default VideoLessonsOutput;
