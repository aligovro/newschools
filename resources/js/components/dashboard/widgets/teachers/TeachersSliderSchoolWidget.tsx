import { ArrowLeft, ArrowRight } from 'lucide-react';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { TeachersSliderSchoolCard } from './TeachersSliderSchoolCard';
import { TeachersSliderSchoolFilters } from './TeachersSliderSchoolFilters';
import { useTeachersSliderSchool } from './useTeachersSliderSchool';

interface TeachersSliderSchoolConfig {
    title?: string;
    show_title?: boolean;
    organization_id?: number;
    limit?: number;
}

interface Props {
    config?: TeachersSliderSchoolConfig;
}

export const TeachersSliderSchoolWidget: React.FC<Props> = ({ config = {} }) => {
    const {
        title = 'Преподаватели',
        show_title = true,
        organization_id,
        limit = 12,
    } = config;

    const {
        staff,
        meta,
        loading,
        error,
        activeCategory,
        setActiveCategory,
    } = useTeachersSliderSchool(organization_id, limit);

    const swiperRef = useRef<SwiperType | null>(null);
    const navPrevRef = useRef<HTMLButtonElement>(null);
    const navNextRef = useRef<HTMLButtonElement>(null);

    const slidesPerView = 5;
    const shouldShowArrows = staff.length > slidesPerView;

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
    }, [shouldShowArrows, staff.length]);

    const hasData = staff.length > 0;
    const categories = useMemo(
        () => meta?.categories ?? [],
        [meta?.categories],
    );

    return (
        <section
            id="teachers"
            className="teachers-slider-school wrapper__block"
        >
            <div className="teachers-slider-school__container">
                <div className="teachers-slider-school__header">
                    {show_title && (
                        <h2 className="teachers-slider-school__title">
                            {title}
                        </h2>
                    )}
                    <div className="teachers-slider-school__filters-wrap">
                        <TeachersSliderSchoolFilters
                            categories={categories}
                            activeSlug={activeCategory}
                            onSelect={setActiveCategory}
                        />
                    </div>
                </div>

                {loading && (
                    <div className="teachers-slider-school__placeholder">
                        <span>Загрузка…</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="teachers-slider-school__error">
                        {error}
                    </div>
                )}

                {!loading && !error && !hasData && (
                    <div className="teachers-slider-school__placeholder">
                        <span>Преподаватели не настроены</span>
                    </div>
                )}

                {!loading && !error && hasData && (
                    <div className="teachers-slider-school__slider">
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
                                480: { slidesPerView: 2 },
                                640: { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                                1280: { slidesPerView: 5 },
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
                            {staff.map((m) => (
                                <SwiperSlide key={m.id}>
                                    <div className="h-full">
                                        <TeachersSliderSchoolCard member={m} />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                        {shouldShowArrows && (
                            <>
                                <button
                                    ref={navPrevRef}
                                    className="teachers-slider-school__nav teachers-slider-school__nav--prev"
                                    aria-label="Предыдущий"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <button
                                    ref={navNextRef}
                                    className="teachers-slider-school__nav teachers-slider-school__nav--next"
                                    aria-label="Следующий"
                                >
                                    <ArrowRight size={20} />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
