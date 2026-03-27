import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { SchoolCtaPill } from '@/components/site/school/SchoolCtaPill';

import { ProjectsSliderSchoolCard } from './ProjectsSliderSchoolCard';
import { ProjectsSliderSchoolFilters } from './ProjectsSliderSchoolFilters';
import { useProjectsSliderSchool } from './useProjectsSliderSchool';

interface ProjectsSliderSchoolConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
    exclude_slug?: string;
}

interface Props {
    config?: ProjectsSliderSchoolConfig;
}

export const ProjectsSliderSchoolWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Проекты школы',
        show_title = true,
        organization_id,
        limit = 12,
        exclude_slug,
    } = config;

    const {
        projects,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    } = useProjectsSliderSchool(organization_id, limit, exclude_slug);

    const swiperRef = useRef<SwiperType | null>(null);
    const navPrevRef = useRef<HTMLButtonElement>(null);
    const navNextRef = useRef<HTMLButtonElement>(null);

    const slidesPerView = 3;
    const shouldShowArrows = projects.length > slidesPerView;

    useEffect(() => {
        const swiper = swiperRef.current;
        if (!swiper || !shouldShowArrows || !navPrevRef.current || !navNextRef.current) return;
        const nav = swiper.params.navigation;
        if (nav && typeof nav !== 'boolean') {
            nav.prevEl = navPrevRef.current;
            nav.nextEl = navNextRef.current;
        }
        swiper.navigation?.destroy?.();
        swiper.navigation?.init?.();
        swiper.navigation?.update?.();
    }, [shouldShowArrows, projects.length]);

    const hasData = projects.length > 0;
    const categories = useMemo(
        () => meta?.categories ?? [],
        [meta?.categories],
    );

    return (
        <section className="projects-slider-school wrapper__block">
            <div className="projects-slider-school__container">
                <div className="projects-slider-school__header">
                    <div className="projects-slider-school__header-left">
                        {show_title && (
                            <h2 className="projects-slider-school__title">
                                {title}
                            </h2>
                        )}
                        <div className="projects-slider-school__filters-wrap">
                            <ProjectsSliderSchoolFilters
                                categories={categories}
                                activeSlug={activeCategory}
                                onSelect={setActiveCategory}
                            />
                        </div>
                    </div>
                    {meta && (
                        <div className="projects-slider-school__header-stats-wrap">
                            <img
                                src="/icons/school-template/flash-circle-outline.svg"
                                alt=""
                                aria-hidden="true"
                                className="projects-slider-school__header-stats-icon"
                            />
                            <div className="projects-slider-school__header-stats">
                                <div className="projects-slider-school__total-target">
                                    {meta.total_target_formatted}
                                </div>
                                <div className="projects-slider-school__total-label">
                                    общая необходимая сумма
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="projects-slider-school__placeholder">
                        <span>Загрузка…</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="projects-slider-school__error">
                        {error}
                    </div>
                )}

                {!loading && !error && !hasData && (
                    <div className="projects-slider-school__placeholder">
                        <span>Проекты не найдены</span>
                    </div>
                )}

                {!loading && !error && hasData && (
                    <>
                        <div className="projects-slider-school__slider">
                            <div className="projects-slider-school__swiper-wrap">
                                <Swiper
                                    modules={shouldShowArrows ? [Navigation] : []}
                                    navigation={
                                        shouldShowArrows
                                            ? {
                                                  prevEl: navPrevRef.current,
                                                  nextEl: navNextRef.current,
                                              }
                                            : false
                                    }
                                    spaceBetween={24}
                                    slidesPerView={1}
                                    breakpoints={{
                                        768: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                    }}
                                    onSwiper={(s) => {
                                        swiperRef.current = s;
                                    }}
                                    onBeforeInit={(swiper) => {
                                        if (!shouldShowArrows) return;
                                        if (!navPrevRef.current || !navNextRef.current) return;
                                        const nav = swiper.params.navigation;
                                        if (nav && typeof nav !== 'boolean') {
                                            nav.prevEl = navPrevRef.current;
                                            nav.nextEl = navNextRef.current;
                                        }
                                    }}
                                >
                                    {projects.map((p) => (
                                        <SwiperSlide key={p.id}>
                                            <div className="h-full">
                                                <ProjectsSliderSchoolCard
                                                    project={p}
                                                />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                            {shouldShowArrows && (
                                <>
                                    <button
                                        ref={navPrevRef}
                                        className="projects-slider-school__nav projects-slider-school__nav--prev"
                                        aria-label="Предыдущий"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        ref={navNextRef}
                                        className="projects-slider-school__nav projects-slider-school__nav--next"
                                        aria-label="Следующий"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>

                        <SchoolCtaPill href="/projects">
                            Все проекты школы
                        </SchoolCtaPill>
                    </>
                )}
            </div>
        </section>
    );
};
