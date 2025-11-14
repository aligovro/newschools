import { router } from '@inertiajs/react';
import React, { useMemo, useRef, useState } from 'react';
import { isInternalLink, normalizeInternalUrl } from '@/lib/linkUtils';
import { getImageUrl } from '@/utils/getImageUrl';
import {
    Autoplay,
    EffectCards,
    EffectCube,
    EffectFade,
    EffectFlip,
    Navigation,
    Pagination,
} from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-cards';
import 'swiper/css/effect-cube';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-flip';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { WidgetOutputProps } from './types';

// Types for slider configuration
interface SliderSlide {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonLinkType: string;
    buttonOpenInNewTab: boolean;
    backgroundImage?: string;
    overlayOpacity?: number;
    overlayColor?: string;
    overlayGradient?: string;
    overlayGradientIntensity?: number;
    order: number;
}

interface SliderOutputConfig {
    type: 'hero' | 'grid';
    layout: 'fullwidth' | 'grid';
    slidesPerView: number;
    height: string;
    animation: 'fade' | 'slide' | 'flip' | 'cube';
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    showDots: boolean;
    showArrows: boolean;
    showProgress: boolean;
    spaceBetween: number;
    breakpoints: Record<string, any>;
    slides: SliderSlide[];
    singleSlide?: SliderSlide;
    css_class?: string;
    styling?: Record<string, unknown>;
}

// Function to create gradient overlay style
const getGradientStyle = (
    color: string,
    opacity: number,
    gradient: string,
    intensity: number,
): string => {
    const alpha = opacity / 100;
    const colorWithAlpha = `${color}${Math.round(alpha * 255)
        .toString(16)
        .padStart(2, '0')}`;

    switch (gradient) {
        case 'left':
            return `linear-gradient(to right, ${colorWithAlpha} ${intensity}%, transparent)`;
        case 'right':
            return `linear-gradient(to left, ${colorWithAlpha} ${intensity}%, transparent)`;
        case 'top':
            return `linear-gradient(to bottom, ${colorWithAlpha} ${intensity}%, transparent)`;
        case 'bottom':
            return `linear-gradient(to top, ${colorWithAlpha} ${intensity}%, transparent)`;
        case 'center':
            return `radial-gradient(circle, ${colorWithAlpha} ${intensity}%, transparent)`;
        default:
            return colorWithAlpha;
    }
};

// Single slide renderer
const SliderSlideRenderer: React.FC<{
    slide: SliderSlide;
    height: string;
    layout: 'fullwidth' | 'grid';
    css_class?: string;
}> = ({ slide, height, layout, css_class }) => {
    // Filter out blob URLs and format image URL
    const bg = slide.backgroundImage || '';
    const rawImage =
        typeof bg === 'string' && bg.startsWith('blob:') ? '' : bg;
    const safeImage = rawImage ? getImageUrl(rawImage) : '';

    const overlayStyle =
        slide.overlayOpacity &&
        slide.overlayOpacity > 0 &&
        slide.overlayGradient !== 'none'
            ? getGradientStyle(
                  slide.overlayColor || '#000000',
                  slide.overlayOpacity,
                  slide.overlayGradient || 'none',
                  slide.overlayGradientIntensity || 50,
              )
            : slide.overlayOpacity && slide.overlayOpacity > 0
              ? `${slide.overlayColor || '#000000'}${Math.round(
                    ((slide.overlayOpacity || 0) / 100) * 255,
                )
                    .toString(16)
                    .padStart(2, '0')}`
              : '';

    const handleButtonClick = () => {
        if (!slide.buttonLink) return;

        // Handle internal links with Inertia
        if (
            slide.buttonLinkType === 'internal' ||
            isInternalLink(slide.buttonLink)
        ) {
            const normalizedUrl = normalizeInternalUrl(slide.buttonLink);
            if (slide.buttonOpenInNewTab) {
                window.open(normalizedUrl, '_blank');
            } else {
                router.visit(normalizedUrl);
            }
        } else {
            // External links
            const target = slide.buttonOpenInNewTab ? '_blank' : '_self';
            window.open(slide.buttonLink, target);
        }
    };

    if (layout === 'grid') {
        // Grid layout - simple cards
        return (
            <div
                className="relative h-full overflow-hidden rounded-lg bg-white shadow-md"
                style={{ height: height || '300px' }}
            >
                {safeImage && (
                    <div className="relative h-32 bg-cover bg-center md:h-48">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${safeImage})`,
                            }}
                        />
                        {overlayStyle && (
                            <div
                                className="absolute inset-0"
                                style={{ background: overlayStyle }}
                            />
                        )}
                    </div>
                )}
                <div className="p-4">
                    <h3 className="mb-2 text-lg font-semibold">
                        {slide.title}
                    </h3>
                    {slide.subtitle && (
                        <p className="mb-2 text-sm text-gray-600">
                            {slide.subtitle}
                        </p>
                    )}
                    {slide.description && (
                        <p className="text-sm text-gray-500">
                            {slide.description}
                        </p>
                    )}
                    {slide.buttonText && (
                        <button
                            onClick={handleButtonClick}
                            className="mt-3 inline-block rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        >
                            {slide.buttonText}
                        </button>
                    )}
                </div>
            </div>
        );
    } else {
        // Full width - hero style
        return (
            <div
                className="relative flex h-full w-full items-center justify-center"
                style={{ height }}
            >
                {safeImage && (
                    <div className="absolute inset-0 bg-cover bg-center">
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${safeImage})`,
                            }}
                        />
                        {overlayStyle && (
                            <div
                                className="absolute inset-0"
                                style={{ background: overlayStyle }}
                            />
                        )}
                    </div>
                )}
                <div className="relative z-10 mx-auto max-w-4xl p-8 text-center text-white">
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                        {slide.title}
                    </h1>
                    {slide.subtitle && (
                        <h2 className="mb-6 text-xl md:text-2xl">
                            {slide.subtitle}
                        </h2>
                    )}
                    {slide.description && (
                        <p className="mb-8 text-lg">{slide.description}</p>
                    )}
                    {slide.buttonText && (
                        <button
                            onClick={handleButtonClick}
                            className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                        >
                            {slide.buttonText}
                        </button>
                    )}
                </div>
            </div>
        );
    }
};

// Main SliderOutput component
export const SliderOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as SliderOutputConfig;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [totalSlides, setTotalSlides] = useState(0);
    const swiperRef = useRef<any>(null);

    // Создаем уникальный ID для этого слайдера
    const sliderId = `slider-${widget.id}`;
    const navigationNextClass = `swiper-button-next-${widget.id}`;
    const navigationPrevClass = `swiper-button-prev-${widget.id}`;
    const paginationClass = `swiper-pagination-${widget.id}`;

    // Функция для получения значения из configs
    const getConfigValue = (
        configs:
            | Array<{
                  config_key: string;
                  config_value: string;
                  config_type: string;
              }>
            | undefined,
        key: string,
        defaultValue: unknown,
    ): unknown => {
        if (!configs) return defaultValue;
        const configItem = configs.find((c) => c.config_key === key);
        if (!configItem) return defaultValue;

        try {
            return JSON.parse(configItem.config_value);
        } catch {
            return configItem.config_value;
        }
    };

    // Извлекаем настройки из configs или из config
    const type =
        (getConfigValue(widget.configs, 'type', config.type) as
            | 'hero'
            | 'grid') || 'hero';
    const layout =
        (getConfigValue(widget.configs, 'layout', config.layout) as
            | 'fullwidth'
            | 'grid') || 'fullwidth';
    const slidesPerView =
        (getConfigValue(
            widget.configs,
            'slidesPerView',
            config.slidesPerView,
        ) as number) || 1;
    const height =
        (getConfigValue(widget.configs, 'height', config.height) as string) ||
        '400px';
    const animation =
        (getConfigValue(
            widget.configs,
            'animation',
            config.animation,
        ) as string) || 'fade';
    const autoplay =
        (getConfigValue(
            widget.configs,
            'autoplay',
            config.autoplay,
        ) as boolean) || false;
    const autoplayDelay =
        (getConfigValue(
            widget.configs,
            'autoplayDelay',
            config.autoplayDelay,
        ) as number) || 5000;
    const loop =
        (getConfigValue(widget.configs, 'loop', config.loop) as boolean) ||
        false;
    const showDots =
        (getConfigValue(
            widget.configs,
            'showDots',
            config.showDots,
        ) as boolean) || true;
    const showArrows =
        (getConfigValue(
            widget.configs,
            'showArrows',
            config.showArrows,
        ) as boolean) || true;
    const showProgress =
        (getConfigValue(
            widget.configs,
            'showProgress',
            config.showProgress,
        ) as boolean) || false;
    const spaceBetween =
        (getConfigValue(
            widget.configs,
            'spaceBetween',
            config.spaceBetween,
        ) as number) || 0;
    const breakpoints =
        (getConfigValue(
            widget.configs,
            'breakpoints',
            config.breakpoints,
        ) as Record<string, unknown>) || {};
    const css_class =
        (getConfigValue(
            widget.configs,
            'css_class',
            config.css_class,
        ) as string) || '';
    const styling =
        (getConfigValue(widget.configs, 'styling', config.styling) as Record<
            string,
            unknown
        >) || {};

    // Получаем слайды - приоритет: slider_slides -> config.slides -> slides_from_config
    const slides = (() => {
        // Сначала проверяем slider_slides
        if (
            (widget as any).slider_slides &&
            (widget as any).slider_slides.length > 0
        ) {
            return (widget as any).slider_slides;
        }

        // Затем config.slides
        if (config.slides && config.slides.length > 0) {
            return config.slides;
        }

        // И наконец slides_from_config (если есть)
        if (
            (widget as any).slides_from_config &&
            (widget as any).slides_from_config.length > 0
        ) {
            return (widget as any).slides_from_config;
        }

        return [];
    })();
    const singleSlide = config.singleSlide;

    // Get slides from widget data or config
    const currentSlides = useMemo(() => {
        // Try to get slides from widget data first
        if (
            (widget as any).slider_slides &&
            (widget as any).slider_slides.length > 0
        ) {
            return (widget as any).slider_slides;
        }

        // Fallback to config slides
        if (slides && slides.length > 0) {
            return slides;
        }

        // If single slide is provided, convert to array
        if (singleSlide) {
            return [singleSlide];
        }

        return [];
    }, [widget, slides, singleSlide]);

    // Скрываем стрелки и пагинацию, если слайд только один
    const hasMultipleSlides = currentSlides.length > 1;
    const shouldShowArrows = showArrows && hasMultipleSlides;
    const shouldShowDots = showDots && hasMultipleSlides;

    // Swiper modules configuration
    const swiperModules = useMemo(() => {
        const modules = [];

        // Всегда добавляем Navigation и Pagination
        modules.push(Navigation, Pagination);

        if (autoplay) modules.push(Autoplay);

        // Добавляем эффекты в зависимости от анимации
        switch (animation) {
            case 'fade':
                modules.push(EffectFade);
                break;
            case 'flip':
                modules.push(EffectFlip);
                break;
            case 'cube':
                modules.push(EffectCube);
                break;
            case 'cards':
                modules.push(EffectCards);
                break;
        }

        return modules;
    }, [autoplay, animation]);

    // Swiper configuration
    const swiperConfig = useMemo(() => {
        const config: Record<string, any> = {
            modules: swiperModules,
            spaceBetween: spaceBetween || 0,
            loop: loop || false,
            autoplay: autoplay
                ? {
                      delay: autoplayDelay || 5000,
                      disableOnInteraction: false,
                  }
                : false,
            navigation: shouldShowArrows
                ? {
                      nextEl: `.${navigationNextClass}`,
                      prevEl: `.${navigationPrevClass}`,
                  }
                : false,
            pagination: shouldShowDots
                ? {
                      clickable: true,
                      dynamicBullets: false,
                      el: `.${paginationClass}`,
                  }
                : false,
            // Добавляем обработчики событий для прогресс-бара
            on: {
                init: function (swiper: any) {
                    // Сохраняем реальное количество слайдов из Swiper
                    setTotalSlides(swiper.slides.length);
                },
                slideChange: function (swiper: any) {
                    // Используем realIndex для loop режима
                    setCurrentSlide(swiper.realIndex);
                },
            },
        };

        // Animation settings
        if (animation === 'fade') {
            config.effect = 'fade';
            config.fadeEffect = {
                crossFade: true,
            };
        } else if (animation === 'flip') {
            config.effect = 'flip';
            config.flipEffect = {
                slideShadows: true,
                limitRotation: true,
            };
        } else if (animation === 'cube') {
            config.effect = 'cube';
            config.cubeEffect = {
                slideShadows: true,
                shadow: true,
                shadowOffset: 20,
                shadowScale: 0.94,
            };
        } else if (animation === 'cards') {
            config.effect = 'cards';
            config.cardsEffect = {
                perSlideOffset: 8,
                perSlideRotate: 2,
                rotate: true,
                slideShadows: true,
            };
        }

        // Grid layout settings
        if (layout === 'grid') {
            config.slidesPerView = slidesPerView || 1;
            config.spaceBetween = spaceBetween || 20;

            // Для grid layout не используем эффекты, которые не поддерживают множественные слайды
            if (
                animation === 'fade' ||
                animation === 'flip' ||
                animation === 'cube'
            ) {
                config.effect = 'slide'; // Принудительно используем slide для grid
            }

            config.breakpoints = breakpoints || {
                640: {
                    slidesPerView: Math.min(2, slidesPerView || 1),
                    spaceBetween: spaceBetween || 20,
                },
                768: {
                    slidesPerView: Math.min(3, slidesPerView || 1),
                    spaceBetween: spaceBetween || 30,
                },
                1024: {
                    slidesPerView: slidesPerView || 1,
                    spaceBetween: spaceBetween || 40,
                },
            };
        } else {
            config.slidesPerView = 1;
        }

        return config;
    }, [
        swiperModules,
        spaceBetween,
        loop,
        autoplay,
        autoplayDelay,
        shouldShowArrows,
        shouldShowDots,
        showProgress,
        animation,
        layout,
        slidesPerView,
        breakpoints,
    ]);

    if (currentSlides.length === 0) {
        return (
            <div
                className={`slider-output-empty ${className || ''}`}
                style={style}
            >
                <div className="rounded-lg border border-gray-300 bg-gray-50 p-8 text-center">
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Слайдер
                    </h3>
                    <p className="text-gray-600">
                        Добавьте слайды для отображения слайдера
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            id={sliderId}
            className={`slider-output ${css_class || ''}`}
            style={{
                height: height || '400px', // Применяем высоту к контейнеру
            }}
        >
            {/* Добавляем CSS стили для стрелок навигации */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    .${navigationNextClass},
                    .${navigationPrevClass} {
                        color: #333;
                        background: white;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        z-index: 100;
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s ease;
                        opacity: 1;
                        visibility: visible;
                    }
                    .${navigationPrevClass} {
                        left: 15px;
                    }
                    .${navigationNextClass} {
                        right: 15px;
                    }
                    .${navigationNextClass}:after,
                    .${navigationPrevClass}:after {
                        font-size: 16px;
                        font-weight: 600;
                        color: #333;
                        content: '';
                    }
                    .${navigationNextClass}:after {
                        content: '›';
                    }
                    .${navigationPrevClass}:after {
                        content: '‹';
                    }
                    .${navigationNextClass}:hover,
                    .${navigationPrevClass}:hover {
                        background: #f5f5f5;
                        transform: translateY(-50%) scale(1.05);
                    }
                    .${paginationClass} {
                        position: absolute;
                        bottom: 20px;
                        left: 50% !important;
                        transform: translateX(-50%);
                        z-index: 100;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.9);
                        padding: 8px 12px;
                        border-radius: 20px;
                        width: auto;
                        min-width: 60px;
                        max-width: 200px;
                        opacity: 1;
                        visibility: visible;
                        flex-wrap: nowrap;
                        white-space: nowrap;
                        overflow: hidden;
                        text-align: center;
                    }
                    .${paginationClass} .swiper-pagination-bullet {
                        background: rgba(0, 0, 0, 0.3);
                        width: 8px;
                        height: 8px;
                        margin: 0 4px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        opacity: 0.6;
                        display: inline-block;
                        flex-shrink: 0;
                    }
                    .${paginationClass} .swiper-pagination-bullet:hover {
                        background: rgba(0, 0, 0, 0.5);
                        opacity: 1;
                    }
                    .${paginationClass} .swiper-pagination-bullet-active {
                        background: #333;
                        opacity: 1;
                        transform: scale(1.2);
                    }
                    /* Переопределяем inline стили Swiper для статичной пагинации */
                    .${paginationClass} .swiper-pagination-bullet {
                        position: static !important;
                        left: auto !important;
                        right: auto !important;
                        transform: none !important;
                        margin: 0 4px !important;
                        display: inline-block !important;
                    }
                `,
                }}
            />
            <Swiper
                {...swiperConfig}
                className={`h-full ${css_class || ''}`}
                style={{
                    height: height || '400px', // Применяем высоту к Swiper
                }}
                onSlideChange={(swiper) => {
                    setCurrentSlide(swiper.realIndex);
                    setTotalSlides(swiper.slides.length);
                }}
            >
                {currentSlides.map((slide: any) => (
                    <SwiperSlide key={slide.id}>
                        <SliderSlideRenderer
                            slide={slide}
                            height={height}
                            layout={layout}
                            css_class={css_class}
                        />
                    </SwiperSlide>
                ))}

                {/* Добавляем стрелки навигации */}
                {shouldShowArrows && (
                    <>
                        <div className={navigationPrevClass}></div>
                        <div className={navigationNextClass}></div>
                    </>
                )}
            </Swiper>

            {/* Контейнер для пагинации */}
            {shouldShowDots && <div className={paginationClass}></div>}

            {/* Контейнер для прогресс-бара */}
            {showProgress && (
                <div
                    className="swiper-progress-bar"
                    style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        width: '100%',
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.3)',
                        zIndex: 10,
                    }}
                >
                    <div
                        className="swiper-progress-fill"
                        style={{
                            height: '100%',
                            background: '#007aff',
                            width: (() => {
                                if (totalSlides === 0) return '0%';

                                // Простой расчет: используем реальные данные из Swiper
                                const progress =
                                    ((currentSlide + 1) / totalSlides) * 100;
                                return `${Math.min(progress, 100)}%`;
                            })(),
                            transition: 'width 0.3s ease',
                        }}
                    ></div>
                </div>
            )}
        </div>
    );
};
