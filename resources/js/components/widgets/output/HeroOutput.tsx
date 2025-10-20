import { Button } from '@/components/ui/button';
import React, { useMemo } from 'react';
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
        opacity: (slide.overlayOpacity || 50) / 100,
        background:
            slide.overlayGradient && slide.overlayGradient !== 'none'
                ? getGradientStyle(
                      slide.overlayColor || '#000000',
                      slide.overlayOpacity || 50,
                      slide.overlayGradient,
                      slide.overlayGradientIntensity || 50,
                  )
                : slide.overlayColor || '#000000',
    };

    const handleButtonClick = () => {
        if (!slide.buttonLink) return;

        const target = slide.buttonOpenInNewTab ? '_blank' : '_self';

        // Handle internal links
        if (slide.buttonLinkType === 'internal') {
            // If link starts with /, it's an internal link
            if (slide.buttonLink.startsWith('/')) {
                window.location.href = slide.buttonLink;
            } else {
                // If doesn't start with /, add /
                window.location.href = `/${slide.buttonLink}`;
            }
        } else {
            // External links
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
                    <h1 className="mb-4 text-5xl font-bold md:text-6xl">
                        {slide.title}
                    </h1>
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
    showDots: boolean;
    showArrows: boolean;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
    css_class?: string;
}> = ({
    slides,
    height,
    animation,
    autoplay,
    autoplayDelay,
    showDots,
    showArrows,
    getGradientStyle,
    css_class,
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

    // Swiper configuration
    const swiperConfig = useMemo(() => {
        const config: Record<string, any> = {
            modules: swiperModules,
            spaceBetween: 0,
            loop: false,
            autoplay: autoplay
                ? {
                      delay: autoplayDelay || 5000,
                      disableOnInteraction: false,
                  }
                : false,
            navigation: showArrows
                ? {
                      nextEl: '.swiper-button-next',
                      prevEl: '.swiper-button-prev',
                  }
                : false,
            pagination: showDots
                ? {
                      clickable: true,
                      dynamicBullets: true,
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
        showArrows,
        showDots,
        animation,
    ]);

    if (slides.length === 0) return null;

    return (
        <div
            className={`hero-slider relative ${css_class || ''}`}
            style={{
                height: height || '600px', // Применяем высоту к контейнеру
            }}
        >
            <Swiper
                {...swiperConfig}
                className="h-full"
                style={{
                    height: height || '600px', // Применяем высоту к Swiper
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
            </Swiper>
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

    // Логируем данные hero виджета (временно отключено)
    // console.log('HeroOutput - Widget data:', {
    //     widget_id: widget.id,
    //     widget_name: widget.name,
    //     config,
    //     hero_slides: (widget as any).hero_slides,
    //     slides_from_config: config.slides,
    //     singleSlide: config.singleSlide,
    // });

    const {
        type = 'single',
        height = '600px',
        animation = 'fade',
        autoplay = true,
        autoplayDelay = 5000,
        showDots = true,
        showArrows = true,
        slides = [],
        singleSlide = {
            id: '1',
            title: 'Добро пожаловать',
            subtitle: 'Наш сайт',
            description: 'Описание вашего сайта',
            buttonText: 'Узнать больше',
            buttonLink: '#',
            buttonOpenInNewTab: false,
            buttonLinkType: 'internal',
            backgroundImage: '',
            overlayOpacity: 50,
            overlayColor: '#000000',
            overlayGradient: 'none',
            overlayGradientIntensity: 50,
        },
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
        // Try to get slides from widget data first
        if (
            (widget as any).hero_slides &&
            (widget as any).hero_slides.length > 0
        ) {
            return (widget as any).hero_slides;
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

    if (currentSlides.length === 0) return null;

    return (
        <div className={`hero-output ${className || ''}`} style={style}>
            {type === 'slider' ? (
                <HeroSlider
                    slides={currentSlides}
                    height={height}
                    animation={animation}
                    autoplay={autoplay}
                    autoplayDelay={autoplayDelay}
                    showDots={showDots}
                    showArrows={showArrows}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
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
