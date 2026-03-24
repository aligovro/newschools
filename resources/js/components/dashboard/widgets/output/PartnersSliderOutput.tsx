import { getImageUrl } from '@/utils/getImageUrl';
import React, { useEffect, useMemo, useRef } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';

import { WidgetOutputProps } from './types';

export interface PartnerLogoItem {
    id?: string;
    name: string;
    logo?: string;
    url?: string;
    linkLabel?: string;
}

function parsePartnersFromWidget(widget: WidgetOutputProps['widget']): PartnerLogoItem[] {
    const cfg = (widget?.config || {}) as Record<string, unknown>;
    const configs = (widget as { configs?: Array<{ config_key: string; config_value: string }> })
        ?.configs;
    const fromConfigs = configs?.find((c) => c.config_key === 'partners');
    let raw: unknown = cfg.partners;
    if (raw == null && fromConfigs?.config_value) {
        try {
            raw = JSON.parse(fromConfigs.config_value);
        } catch {
            raw = [];
        }
    }
    if (typeof raw === 'string') {
        try {
            raw = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(raw)) return [];
    return raw
        .map((item, index) => {
            const o = item as Record<string, unknown>;
            const name = String(o.name ?? '').trim();
            const logo =
                o.logo != null ? String(o.logo).trim() : '';
            const url = o.url != null ? String(o.url).trim() : '';
            // Карточка без названия, но с логотипом — валидна (частый кейс при загрузке только лого).
            if (!name && !logo && !url) return null;
            return {
                id: o.id != null ? String(o.id) : `p-${index}`,
                name,
                logo: logo || undefined,
                url: url || undefined,
                linkLabel:
                    o.linkLabel != null
                        ? String(o.linkLabel)
                        : url
                          ? url.replace(/^https?:\/\//, '')
                          : undefined,
            } as PartnerLogoItem;
        })
        .filter(Boolean) as PartnerLogoItem[];
}

export const PartnersSliderOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const cfg = (widget?.config || {}) as Record<string, unknown>;

    const title = (cfg.title as string) || 'Партнёры фонда';
    const showTitle = (cfg.show_title as boolean) ?? true;
    const slidesPerView = Math.min(
        6,
        Math.max(2, Number(cfg.slidesPerView) || 6),
    );
    const autoplay = (cfg.autoplay as boolean) ?? true;
    const loop = (cfg.loop as boolean) ?? true;

    const partners = useMemo(() => parsePartnersFromWidget(widget), [widget]);

    const swiperRef = useRef<SwiperType | null>(null);
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);

    const loopEnabled = loop && partners.length > slidesPerView;

    useEffect(() => {
        if (partners.length < 2) return;

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
    }, [partners.length, loopEnabled, slidesPerView]);

    if (partners.length === 0) {
        return null;
    }

    const showNav = partners.length > 1;

    return (
        <section
            id="partners"
            className={`partners-slider-output wrapper__block ${loopEnabled ? 'partners-slider-output--loop' : ''} ${className || ''}`.trim()}
            style={style}
            aria-labelledby="partners-slider-heading"
        >
            <div className="partners-slider-output__inner">
                {showTitle && (
                    <div className="block__header partners-slider-output__header">
                        <h2
                            id="partners-slider-heading"
                            className="block__title"
                        >
                            {title}
                        </h2>
                    </div>
                )}
                <div className="partners-slider-output__controls">
                    {showNav ? (
                        <button
                            ref={prevRef}
                            type="button"
                            className="partners-slider-output__nav partners-slider-output__nav--prev"
                            aria-label="Предыдущие партнёры"
                        />
                    ) : null}
                    <div className="partners-slider-output__swiper-wrap">
                        <Swiper
                            modules={[Autoplay, Navigation]}
                            loop={loopEnabled}
                            watchOverflow
                            navigation={
                                showNav &&
                                prevRef.current &&
                                nextRef.current
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
                                if (!showNav) return;
                                const prevEl = prevRef.current;
                                const nextEl = nextRef.current;
                                if (!prevEl || !nextEl) return;

                                const nav = swiper.params.navigation;
                                if (nav && typeof nav !== 'boolean') {
                                    nav.prevEl = prevEl;
                                    nav.nextEl = nextEl;
                                }
                            }}
                            slidesPerView={slidesPerView}
                            spaceBetween={0}
                            autoplay={
                                autoplay
                                    ? { delay: 4500, disableOnInteraction: true }
                                    : false
                            }
                            breakpoints={{
                                0: {
                                    slidesPerView: 2,
                                    spaceBetween: 12,
                                },
                                640: {
                                    slidesPerView: 3,
                                    spaceBetween: 14,
                                },
                                1024: {
                                    slidesPerView: slidesPerView,
                                    spaceBetween: 0,
                                },
                            }}
                            className={`partners-slider-output__swiper ${loopEnabled ? 'partners-slider-output__swiper--loop' : ''}`}
                        >
                            {partners.map((p) => (
                                <SwiperSlide
                                    key={p.id || p.name || p.logo}
                                    className="partners-slider-output__slide"
                                >
                                    <article
                                        className="partners-slider-output__card"
                                        aria-label={p.name || undefined}
                                    >
                                        <div className="partners-slider-output__logo-wrap">
                                            {p.logo ? (
                                                <img
                                                    src={getImageUrl(p.logo)}
                                                    alt={p.name || ''}
                                                    className="partners-slider-output__logo"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div
                                                    className="partners-slider-output__logo-placeholder"
                                                    aria-hidden
                                                />
                                            )}
                                        </div>
                                        {p.name ? (
                                            <h3 className="partners-slider-output__name">
                                                {p.name}
                                            </h3>
                                        ) : null}
                                        {p.url ? (
                                            <a
                                                href={p.url}
                                                className="partners-slider-output__link"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {p.linkLabel || p.url}
                                            </a>
                                        ) : null}
                                    </article>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                    {showNav ? (
                        <button
                            ref={nextRef}
                            type="button"
                            className="partners-slider-output__nav partners-slider-output__nav--next"
                            aria-label="Следующие партнёры"
                        />
                    ) : null}
                </div>
            </div>
        </section>
    );
};

export default PartnersSliderOutput;
