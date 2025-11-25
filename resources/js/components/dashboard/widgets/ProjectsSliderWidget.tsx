import ProjectCard from '@/components/projects/ProjectCard';
import { fetchLatestProjects } from '@/lib/api/public';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

interface ProjectOrganization {
    id: number;
    name: string;
    slug?: string | null;
}

interface Project {
    id: number;
    title: string;
    slug?: string | null;
    short_description?: string | null;
    description?: string | null;
    image?: string | null;
    target_amount_rubles?: number;
    collected_amount_rubles?: number;
    progress_percentage: number;
    organization?: ProjectOrganization | null;
    organization_name?: string | null;
}

interface ProjectsSliderConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
    slidesPerView?: number;
    showHeaderActions?: boolean;
}

interface Props {
    config?: ProjectsSliderConfig;
}

export const ProjectsSliderWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Проекты',
        show_title = true,
        organization_id,
        limit = 6,
        slidesPerView = 3,
        showHeaderActions = true,
    } = config;

    const [items, setItems] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const swiperRef = useRef<SwiperType | null>(null);
    const navigationPrevRef = useRef<HTMLButtonElement>(null);
    const navigationNextRef = useRef<HTMLButtonElement>(null);

    const page = usePage<{ project?: { slug?: string } }>();
    const currentProjectSlug = (page?.props as any)?.project?.slug ?? undefined;
    const effectiveTitle = currentProjectSlug ? 'Другие проекты' : title;

    const shouldShowArrows = useMemo(
        () => items.length > slidesPerView,
        [items.length, slidesPerView],
    );

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            try {
                setLoading(true);
                setError(null);

                const payload = await fetchLatestProjects(
                    {
                        organization_id,
                        limit: Math.min(
                            limit + (currentProjectSlug ? 1 : 0),
                            30,
                        ),
                        exclude_slug: currentProjectSlug,
                    },
                    {
                        signal: controller.signal,
                    },
                );

                const projects: Project[] = Array.isArray(payload?.data)
                    ? payload.data.map((project: any) => {
                          const targetRubles =
                              typeof project.target_amount_rubles === 'number'
                                  ? project.target_amount_rubles
                                  : project.target_amount
                                    ? Number(project.target_amount) / 100
                                    : 0;
                          const collectedRubles =
                              typeof project.collected_amount_rubles ===
                              'number'
                                  ? project.collected_amount_rubles
                                  : project.collected_amount
                                    ? Number(project.collected_amount) / 100
                                    : 0;
                          const progress =
                              typeof project.progress_percentage === 'number'
                                  ? project.progress_percentage
                                  : targetRubles > 0
                                    ? Math.min(
                                          100,
                                          (collectedRubles / targetRubles) *
                                              100,
                                      )
                                    : 0;

                          const organization: ProjectOrganization | null =
                              project.organization &&
                              typeof project.organization === 'object'
                                  ? {
                                        id: project.organization.id,
                                        name: project.organization.name,
                                        slug: project.organization.slug,
                                    }
                                  : project.organization_id
                                    ? {
                                          id: project.organization_id,
                                          name:
                                              project.organization_name ??
                                              'Организация',
                                          slug: undefined,
                                      }
                                    : null;

                          return {
                              ...project,
                              description:
                                  project.description ??
                                  project.short_description ??
                                  '',
                              organization,
                              target_amount_rubles: targetRubles,
                              collected_amount_rubles: collectedRubles,
                              progress_percentage: progress,
                          };
                      })
                    : [];

                const filteredProjects = currentProjectSlug
                    ? projects.filter(
                          (project) => project.slug !== currentProjectSlug,
                      )
                    : projects;

                setItems(filteredProjects.slice(0, limit));
            } catch (fetchError) {
                if ((fetchError as { name?: string })?.name === 'AbortError') {
                    return;
                }
                const message =
                    fetchError instanceof Error
                        ? fetchError.message
                        : 'Не удалось загрузить проекты';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        run();

        return () => controller.abort();
    }, [organization_id, limit, currentProjectSlug]);

    useEffect(() => {
        const swiper = swiperRef.current;
        const prevEl = navigationPrevRef.current;
        const nextEl = navigationNextRef.current;

        if (!swiper || !shouldShowArrows || !prevEl || !nextEl) return;

        const navigation = swiper.params.navigation;
        if (navigation && typeof navigation !== 'boolean') {
            navigation.prevEl = prevEl;
            navigation.nextEl = nextEl;
        }

        const navigationModule = swiper.navigation;
        navigationModule?.destroy();
        navigationModule?.init();
        navigationModule?.update();
    }, [shouldShowArrows, items.length]);

    return (
        <section className="wrapper__block">
            <div className="container mx-auto">
                {(effectiveTitle && show_title) || showHeaderActions ? (
                    <div className="block__header">
                        {effectiveTitle && show_title && (
                            <h2 className="block__title">{effectiveTitle}</h2>
                        )}
                        {showHeaderActions && (
                            <Link
                                href="/projects"
                                className="btn-outline-primary dark-color"
                            >
                                Все проекты
                            </Link>
                        )}
                    </div>
                ) : null}

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

                {!loading && !error && items.length === 0 && (
                    <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                        <span className="text-gray-500">
                            Проекты не найдены
                        </span>
                    </div>
                )}

                {items.length > 0 && (
                    <div className="projects-slider-widget relative">
                        <Swiper
                            modules={shouldShowArrows ? [Navigation] : []}
                            navigation={
                                shouldShowArrows
                                    ? {
                                          prevEl: navigationPrevRef.current,
                                          nextEl: navigationNextRef.current,
                                      }
                                    : false
                            }
                            spaceBetween={16}
                            slidesPerView={1}
                            breakpoints={{
                                640: {
                                    slidesPerView: Math.min(2, slidesPerView),
                                },
                                1024: { slidesPerView },
                            }}
                            onSwiper={(swiper) => {
                                swiperRef.current = swiper;
                            }}
                            onBeforeInit={(swiper) => {
                                if (!shouldShowArrows) return;
                                const prevEl = navigationPrevRef.current;
                                const nextEl = navigationNextRef.current;
                                if (!prevEl || !nextEl) return;

                                const navigation = swiper.params.navigation;
                                if (
                                    navigation &&
                                    typeof navigation !== 'boolean'
                                ) {
                                    navigation.prevEl = prevEl;
                                    navigation.nextEl = nextEl;
                                }
                            }}
                        >
                            {items.map((project) => (
                                <SwiperSlide key={project.id}>
                                    <div className="h-full">
                                        <ProjectCard project={project} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>

                        {shouldShowArrows && (
                            <>
                                <button
                                    ref={navigationPrevRef}
                                    className="projects-slider-widget__navigation projects-slider-widget__navigation--prev"
                                    aria-label="Предыдущий проект"
                                >
                                    <ArrowLeft />
                                </button>
                                <button
                                    ref={navigationNextRef}
                                    className="projects-slider-widget__navigation projects-slider-widget__navigation--next"
                                    aria-label="Следующий проект"
                                >
                                    <ArrowRight />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectsSliderWidget;
