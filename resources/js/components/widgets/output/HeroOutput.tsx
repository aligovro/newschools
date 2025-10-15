import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
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

// Hero slider component
const HeroSlider: React.FC<{
    slides: HeroSlide[];
    height: string;
    animation: 'fade' | 'slide' | 'zoom';
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
    animation: _animation,
    autoplay,
    autoplayDelay,
    showDots,
    showArrows,
    getGradientStyle,
    css_class,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Autoplay
    useEffect(() => {
        if (!autoplay || slides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === slides.length - 1 ? 0 : prev + 1,
            );
        }, autoplayDelay);

        return () => clearInterval(interval);
    }, [autoplay, autoplayDelay, slides.length]);

    const goToPrevious = () => {
        setCurrentSlide(
            currentSlide === 0 ? slides.length - 1 : currentSlide - 1,
        );
    };

    const goToNext = () => {
        setCurrentSlide(
            currentSlide === slides.length - 1 ? 0 : currentSlide + 1,
        );
    };

    if (slides.length === 0) return null;

    return (
        <div className="hero-slider relative">
            {/* Render only current slide for performance */}
            <HeroSlideRenderer
                slide={slides[currentSlide]}
                height={height}
                getGradientStyle={getGradientStyle}
                css_class={css_class}
            />

            {/* Navigation dots */}
            {showDots && slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`h-3 w-3 rounded-full transition-colors ${
                                index === currentSlide
                                    ? 'bg-white'
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Navigation arrows */}
            {showArrows && slides.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                        onClick={goToPrevious}
                        aria-label="Previous slide"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                        onClick={goToNext}
                        aria-label="Next slide"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </>
            )}
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

    const currentSlides = type === 'slider' ? slides : [singleSlide];

    if (currentSlides.length === 0) return null;

    return (
        <div className={`hero-output ${className || ''}`} style={style}>
            {type === 'slider' ? (
                <HeroSlider
                    slides={slides}
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
                    slide={singleSlide}
                    height={height}
                    getGradientStyle={getGradientStyle}
                    css_class={css_class}
                />
            )}
        </div>
    );
};
