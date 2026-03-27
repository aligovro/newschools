import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { SchoolCtaPill } from '@/components/site/school/SchoolCtaPill';

import { VideoLessonsSliderSchoolCard } from './VideoLessonsSliderSchoolCard';
import { VideoLessonsSliderSchoolFilters } from './VideoLessonsSliderSchoolFilters';
import { useVideoLessonsSliderSchool } from './useVideoLessonsSliderSchool';

interface VideoLessonsSliderSchoolConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
}

interface Props {
    config?: VideoLessonsSliderSchoolConfig;
}

export const VideoLessonsSliderSchoolWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Видео уроки',
        show_title = true,
        organization_id,
        limit = 12,
    } = config;

    const {
        lessons,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    } = useVideoLessonsSliderSchool(organization_id, limit);

    const swiperRef = useRef<SwiperType | null>(null);
    const navPrevRef = useRef<HTMLButtonElement>(null);
    const navNextRef = useRef<HTMLButtonElement>(null);

    const slidesPerView = 3;
    const shouldShowArrows = lessons.length > slidesPerView;

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
    }, [shouldShowArrows, lessons.length]);

    const hasData = lessons.length > 0;
    const categories = useMemo(
        () => meta?.categories ?? [],
        [meta?.categories],
    );

    return (
        <section className="video-lessons-slider-school wrapper__block">
            <div className="video-lessons-slider-school__container">
                <div className="video-lessons-slider-school__header">
                    {show_title && (
                        <h2 className="video-lessons-slider-school__title">
                            {title}
                        </h2>
                    )}
                    <div className="video-lessons-slider-school__filters-wrap">
                        <VideoLessonsSliderSchoolFilters
                            categories={categories}
                            activeSlug={activeCategory}
                            onSelect={setActiveCategory}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="video-lessons-slider-school__placeholder">
                        <span>Загрузка…</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="video-lessons-slider-school__error">
                        {error}
                    </div>
                )}

                {!loading && !error && !hasData && (
                    <div className="video-lessons-slider-school__placeholder">
                        <span>Видео уроки не настроены</span>
                    </div>
                )}

                {!loading && !error && hasData && (
                    <>
                        <div className="video-lessons-slider-school__slider">
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
                                    640: { slidesPerView: 2 },
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
                                {lessons.map((lesson) => (
                                    <SwiperSlide key={lesson.id}>
                                        <div className="h-full">
                                            <VideoLessonsSliderSchoolCard lesson={lesson} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                            {shouldShowArrows && (
                                <>
                                    <button
                                        ref={navPrevRef}
                                        className="video-lessons-slider-school__nav video-lessons-slider-school__nav--prev"
                                        aria-label="Предыдущий"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        ref={navNextRef}
                                        className="video-lessons-slider-school__nav video-lessons-slider-school__nav--next"
                                        aria-label="Следующий"
                                    >
                                        <ArrowRight size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                        <SchoolCtaPill href="/video-lessons">
                            Все видео уроки
                        </SchoolCtaPill>
                    </>
                )}
            </div>
        </section>
    );
};
