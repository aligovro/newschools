import type { AboutValueCard } from '@/lib/aboutPageLayout';
import React, { useEffect, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

/** Декоративный знак в духе макета (контур + акцент), без импорта ассетов из Figma. */
function ValueCardDecor() {
    return (
        <div className="school-about-values__decor" aria-hidden>
            <svg
                className="school-about-values__decor-svg"
                width="62"
                height="62"
                viewBox="0 0 62 62"
            >
                <circle
                    cx="31"
                    cy="31"
                    r="25.83"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
                <path
                    d="M20 38c4-8 8-10 11-10s7 2 11 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
}

export interface AboutValuesCardsProps {
    cards: AboutValueCard[];
    title?: string;
}

/**
 * Слайдер карточек «Ключевые ценности»: на широком экране до 3 карточек в ряд,
 * на узких — свайп; стрелки привязаны к Swiper через ref (как в макете — у заголовка).
 */
export const AboutValuesCards: React.FC<AboutValuesCardsProps> = ({
    cards,
    title = 'Ключевые ценности',
}) => {
    const swiperRef = useRef<SwiperType | null>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const loop = cards.length > 3;

    useEffect(() => {
        if (!cards.length) return;

        const swiper = swiperRef.current;
        const prevEl = prevRef.current;
        const nextEl = nextRef.current;
        if (!swiper || !prevEl || !nextEl) return;

        const nav = swiper.params.navigation;
        if (nav && typeof nav !== 'boolean') {
            nav.prevEl = prevEl;
            nav.nextEl = nextEl;
        }

        swiper.navigation?.destroy?.();
        swiper.navigation?.init?.();
        swiper.navigation?.update?.();
    }, [cards.length, loop]);

    if (!cards.length) return null;

    return (
        <div className="school-about-values">
            <div className="school-about-values__head">
                <h2 id="values-heading" className="school-about-values__title">
                    {title}
                </h2>
                <div
                    className="school-about-values__nav"
                    role="group"
                    aria-label="Навигация по карточкам"
                >
                    <button
                        ref={prevRef}
                        type="button"
                        className="school-about-values__btn school-about-values__btn--prev"
                        aria-label="Предыдущие карточки"
                    />
                    <button
                        ref={nextRef}
                        type="button"
                        className="school-about-values__btn school-about-values__btn--next"
                        aria-label="Следующие карточки"
                    />
                </div>
            </div>

            <div className="school-about-values__swiper-wrap">
                <Swiper
                    modules={[Navigation]}
                    loop={loop}
                    navigation={
                        prevRef.current && nextRef.current
                            ? {
                                  prevEl: prevRef.current,
                                  nextEl: nextRef.current,
                              }
                            : false
                    }
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    onBeforeInit={(swiper) => {
                        const prevEl = prevRef.current;
                        const nextEl = nextRef.current;
                        if (!prevEl || !nextEl) return;

                        const nav = swiper.params.navigation;
                        if (nav && typeof nav !== 'boolean') {
                            nav.prevEl = prevEl;
                            nav.nextEl = nextEl;
                        }
                    }}
                    slidesPerView={1}
                    spaceBetween={16}
                    watchOverflow
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 24,
                        },
                        1280: {
                            slidesPerView: 3,
                            spaceBetween: 30,
                        },
                    }}
                    className="school-about-values__swiper"
                >
                    {cards.map((card, idx) => (
                        <SwiperSlide
                            key={`${card.title}-${idx}`}
                            className="school-about-values__slide"
                        >
                            <article className="school-about-values__card">
                                <ValueCardDecor />
                                <h3 className="school-about-values__card-title">
                                    {card.title}
                                </h3>
                                {card.body?.trim() ? (
                                    <p className="school-about-values__card-body whitespace-pre-wrap">
                                        {card.body.trim()}
                                    </p>
                                ) : null}
                            </article>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default AboutValuesCards;
