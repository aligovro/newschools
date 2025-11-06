import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { isInternalLink, normalizeInternalUrl } from '@/lib/linkUtils';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Autoplay,
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
import 'swiper/css/effect-cube';
import 'swiper/css/effect-fade';
import 'swiper/css/effect-flip';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { HeroOutputConfig, HeroSlide, WidgetOutputProps } from './types';

// Single hero slide renderer
const HeroSlideRenderer: React.FC<{
    slide: HeroSlide;
    height: string;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
    css_class?: string;
}> = ({ slide, height, getGradientStyle, css_class }) => {
    // Filter out blob URLs for non-interactive viewing, keep only normal URLs
    const bg = slide.backgroundImage || '';
    const safeImage =
        typeof bg === 'string' && bg.startsWith('blob:') ? '' : bg;

    const slideStyle: React.CSSProperties = {
        backgroundImage: safeImage
            ? `url(${safeImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height,
        position: 'relative',
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: (slide.overlayOpacity || 0) / 100,
        background:
            slide.overlayGradient && slide.overlayGradient !== 'none'
                ? getGradientStyle(
                      slide.overlayColor || '#000000',
                      slide.overlayOpacity || 0,
                      slide.overlayGradient,
                      slide.overlayGradientIntensity || 50,
                  )
                : slide.overlayColor || '#000000',
    };

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

    return (
        <div
            key={slide.id}
            className={`hero-slide ${css_class || ''}`}
            style={slideStyle}
        >
            <div style={overlayStyle} />
            <div className="relative z-10 flex h-full items-center justify-center">
                <div className="max-w-4xl px-6 text-center text-white">
                    {slide.title && (
                        <h1 className="mb-4 text-5xl font-bold md:text-6xl">
                            {slide.title}
                        </h1>
                    )}
                    {slide.subtitle && (
                        <h2 className="mb-6 text-2xl font-light md:text-3xl">
                            {slide.subtitle}
                        </h2>
                    )}
                    {slide.description && (
                        <p className="mb-8 text-lg leading-relaxed md:text-xl">
                            {slide.description}
                        </p>
                    )}
                    {slide.buttonText && (
                        <Button
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                            onClick={handleButtonClick}
                        >
                            {slide.buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Hero slider component using Swiper
const HeroSlider: React.FC<{
    slides: HeroSlide[];
    height: string;
    animation: 'fade' | 'slide' | 'zoom' | 'flip' | 'cube';
    autoplay: boolean;
    autoplayDelay: number;
    loop: boolean;
    showDots: boolean;
    showArrows: boolean;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
    css_class?: string;
    widgetId: string | number;
}> = ({
    slides,
    height,
    animation,
    autoplay,
    autoplayDelay,
    loop,
    showDots,
    showArrows,
    getGradientStyle,
    css_class,
    widgetId,
}) => {
    // Swiper modules configuration
    const swiperModules = useMemo(() => {
        const modules = [Navigation, Pagination];

        if (autoplay) modules.push(Autoplay);

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
        }

        return modules;
    }, [autoplay, animation]);

    // Уникальные классы навигации/пагинации для нескольких слайдеров на странице
    const navigationNextClass = useMemo(
        () => `swiper-button-next-${widgetId}`,
        [widgetId],
    );
    const navigationPrevClass = useMemo(
        () => `swiper-button-prev-${widgetId}`,
        [widgetId],
    );
    const paginationClass = useMemo(
        () => `swiper-pagination-${widgetId}`,
        [widgetId],
    );

    // Swiper configuration
    const swiperConfig = useMemo(() => {
        const config: Record<string, any> = {
            modules: swiperModules,
            spaceBetween: 0,
            loop: loop || false,
            autoplay: autoplay
                ? {
                      delay: autoplayDelay || 5000,
                      disableOnInteraction: false,
                  }
                : false,
            navigation: showArrows
                ? {
                      nextEl: `.${navigationNextClass}`,
                      prevEl: `.${navigationPrevClass}`,
                  }
                : false,
            pagination: showDots
                ? {
                      clickable: true,
                      dynamicBullets: false,
                      el: `.${paginationClass}`,
                  }
                : false,
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
        }

        config.slidesPerView = 1;

        return config;
    }, [
        swiperModules,
        autoplay,
        autoplayDelay,
        loop,
        showArrows,
        showDots,
        animation,
        navigationNextClass,
        navigationPrevClass,
        paginationClass,
    ]);

    if (slides.length === 0) return null;

    return (
        <div
            className={`hero-slider relative ${css_class || ''}`}
            style={{
                height: height || '600px',
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
                className="h-full"
                style={{
                    height: height || '600px',
                }}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <HeroSlideRenderer
                            slide={slide}
                            height={height}
                            getGradientStyle={getGradientStyle}
                            css_class={css_class}
                        />
                    </SwiperSlide>
                ))}
                {showArrows && (
                    <>
                        <div className={navigationPrevClass}></div>
                        <div className={navigationNextClass}></div>
                    </>
                )}
            </Swiper>
            {showDots && <div className={paginationClass}></div>}
        </div>
    );
};

// Main HeroOutput component
export const HeroOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as HeroOutputConfig;
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const {
        height = '600px',
        animation = 'fade',
        autoplay = true,
        autoplayDelay = 5000,
        loop = false,
        showDots = true,
        showArrows = true,
        slides = [],
        css_class,
        styling = {},
    } = config;

    // Function to create gradient overlay style
    const getGradientStyle = (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ): string => {
        const alpha = opacity / 100;
        const transparentColor = `${color}00`;
        const solidColor = `${color}${Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0')}`;

        switch (gradient) {
            case 'left':
                return `linear-gradient(to right, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'right':
                return `linear-gradient(to left, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'top':
                return `linear-gradient(to bottom, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'bottom':
                return `linear-gradient(to top, ${solidColor} ${intensity}%, ${transparentColor})`;
            case 'center':
                return `radial-gradient(circle, ${transparentColor} 0%, ${solidColor} ${intensity}%, ${solidColor} 100%)`;
            default:
                return solidColor;
        }
    };

    // Get slides from widget data or config
    const currentSlides = useMemo(() => {
        // Try to get slides from widget.hero_slides first
        if (
            (widget as any).hero_slides &&
            Array.isArray((widget as any).hero_slides) &&
            (widget as any).hero_slides.length > 0
        ) {
            return (widget as any).hero_slides;
        }

        // Fallback to config.slides
        if (slides && Array.isArray(slides) && slides.length > 0) {
            return slides;
        }

        return [];
    }, [widget, slides]);

    // Check if images are loaded
    useEffect(() => {
        // Reset loading state when slides change
        setImagesLoaded(false);

        if (currentSlides.length === 0) {
            setImagesLoaded(true);
            return;
        }

        const imageUrls = currentSlides
            .map((slide: HeroSlide) => slide.backgroundImage)
            .filter((url: string | undefined | null): url is string => {
                if (!url || typeof url !== 'string') return false;
                return !url.startsWith('blob:');
            });

        if (imageUrls.length === 0) {
            // No images to load, mark as loaded
            setImagesLoaded(true);
            return;
        }

        let isCancelled = false;

        const imagePromises = imageUrls.map((url: string) => {
            return new Promise<void>((resolve) => {
                const img = new Image();
                img.onload = () => {
                    if (!isCancelled) resolve();
                };
                img.onerror = () => {
                    // Even if image fails, count it as "loaded" to not block rendering
                    if (!isCancelled) resolve();
                };
                img.src = url;
            });
        });

        // Set a timeout to show content even if images take too long
        const timeout = setTimeout(() => {
            if (!isCancelled) {
                setImagesLoaded(true);
            }
        }, 3000);

        Promise.all(imagePromises)
            .then(() => {
                if (!isCancelled) {
                    clearTimeout(timeout);
                    setImagesLoaded(true);
                }
            })
            .catch(() => {
                if (!isCancelled) {
                    clearTimeout(timeout);
                    setImagesLoaded(true);
                }
            });

        // Cleanup function
        return () => {
            isCancelled = true;
            clearTimeout(timeout);
        };
    }, [currentSlides]);

    if (currentSlides.length === 0) return null;

    // Show skeleton while images are loading
    if (!imagesLoaded) {
        return (
            <div
                className={`hero-output ${className || ''} ${css_class || ''}`}
                style={style}
            >
                <Skeleton
                    className="w-full"
                    style={{
                        height: height || '600px',
                        borderRadius: '0.375rem',
                    }}
                />
            </div>
        );
    }

    return (
        <div
            className={`hero-output ${className || ''} ${css_class || ''}`}
            style={style}
        >
            {currentSlides.length > 1 ? (
                <HeroSlider
                    slides={currentSlides}
                    height={height}
                    animation={animation}
                    autoplay={autoplay}
                    autoplayDelay={autoplayDelay}
                    loop={loop}
                    showDots={showDots}
                    showArrows={showArrows}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
                    widgetId={widget.id}
                />
            ) : (
                <HeroSlideRenderer
                    slide={currentSlides[0]}
                    height={height}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
                />
            )}
        </div>
    );
};
