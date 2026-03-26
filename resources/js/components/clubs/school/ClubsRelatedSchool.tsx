import type { ClubPublicView } from '@/components/clubs/clubPublicTypes';
import { scheduleTimeGroups } from '@/lib/clubSchedule';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';

interface Props {
    clubs: ClubPublicView[];
}

const ClubsRelatedSchool: React.FC<Props> = ({ clubs }) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const sliderWrapRef = useRef<HTMLDivElement | null>(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    const handlePrev = useCallback(() => swiperRef.current?.slidePrev(), []);
    const handleNext = useCallback(() => swiperRef.current?.slideNext(), []);

    useEffect(() => {
        const el = sliderWrapRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        const ro = new ResizeObserver(() => {
            swiperRef.current?.update();
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    if (clubs.length === 0) return null;

    const showNav = clubs.length > 1;

    return (
        <section className="clubs-related-school">
            <h2 className="clubs-related-school__title">Другие кружки и секции</h2>

            <div
                ref={sliderWrapRef}
                className="clubs-related-school__slider-wrap"
            >
                <Swiper
                    slidesPerView={1}
                    spaceBetween={24}
                    breakpoints={{ 1024: { slidesPerView: 2 } }}
                    onSwiper={(s) => {
                        swiperRef.current = s;
                        setIsEnd(s.isEnd);
                        requestAnimationFrame(() => s.update());
                    }}
                    onSlideChange={(s) => {
                        setIsBeginning(s.isBeginning);
                        setIsEnd(s.isEnd);
                    }}
                >
                    {clubs.map((club) => {
                        const chips = scheduleTimeGroups(club.schedule).map(
                            (g) => `${g.time} — ${g.days.join(', ')}`,
                        );
                        return (
                            <SwiperSlide key={club.id}>
                                <a
                                    href={`/club/${club.id}`}
                                    className="clubs-related-school__card-link"
                                >
                                    <div className="clubs-slider-widget__card-inner">
                                        <div className="clubs-slider-widget__card-content">
                                            <h3 className="clubs-slider-widget__card-title">
                                                {club.name}
                                            </h3>
                                            {chips.length > 0 && (
                                                <div className="clubs-slider-widget__badges">
                                                    {chips.map((chip, i) => (
                                                        <span
                                                            key={i}
                                                            className="clubs-slider-widget__badge clubs-slider-widget__badge--time"
                                                        >
                                                            {chip}
                                                        </span>
                                                    ))}
                                                    <span className="clubs-slider-widget__badge clubs-slider-widget__badge--appointment">
                                                        По предварительной записи
                                                    </span>
                                                </div>
                                            )}
                                            {club.description && (
                                                <p className="clubs-slider-widget__card-desc">
                                                    {club.description}
                                                </p>
                                            )}
                                            <div className="clubs-slider-widget__actions">
                                                <span className="clubs-slider-widget__btn clubs-slider-widget__btn--outline">
                                                    Подробнее
                                                </span>
                                            </div>
                                        </div>

                                        <div className="clubs-slider-widget__card-image-wrap">
                                            {club.image ? (
                                                <img
                                                    src={club.image}
                                                    alt={club.name}
                                                    className="clubs-slider-widget__card-image"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="clubs-slider-widget__card-image-placeholder" />
                                            )}
                                        </div>
                                    </div>
                                </a>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {showNav && (
                    <>
                        <button
                            type="button"
                            className="clubs-slider-widget__nav clubs-slider-widget__nav--prev"
                            onClick={handlePrev}
                            disabled={isBeginning}
                            aria-label="Предыдущий"
                        >
                            <ChevronLeft size={18} strokeWidth={1.5} />
                        </button>
                        <button
                            type="button"
                            className="clubs-slider-widget__nav clubs-slider-widget__nav--next"
                            onClick={handleNext}
                            disabled={isEnd}
                            aria-label="Следующий"
                        >
                            <ChevronRight size={18} strokeWidth={1.5} />
                        </button>
                    </>
                )}
            </div>

            <a href="/clubs" className="clubs-slider-widget__all-link">
                Все кружки и секции
            </a>
        </section>
    );
};

export default React.memo(ClubsRelatedSchool);
