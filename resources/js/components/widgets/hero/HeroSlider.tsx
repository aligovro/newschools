import React, { useEffect, useState } from 'react';
import { HeroRenderer } from './HeroRenderer';
import { HeroSlide } from './types';

interface HeroSliderProps {
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
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
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
    const [currentSlide, setCurrentSlide] = useState(0);

    // Автопрокрутка
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

    console.log('HeroSlider: slides debug', {
        slides_count: slides.length,
        current_slide: currentSlide,
        current_slide_data: slides[currentSlide],
    });

    if (slides.length === 0) return null;

    return (
        <div className="hero-slider relative">
            {/* Рендерим только текущий слайд для производительности */}
            <HeroRenderer
                slide={slides[currentSlide]}
                height={height}
                getGradientStyle={getGradientStyle}
                css_class={css_class}
            />

            {/* Точки навигации */}
            {showDots && slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform space-x-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`h-3 w-3 rounded-full ${
                                index === currentSlide
                                    ? 'bg-white'
                                    : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            )}

            {/* Стрелки навигации */}
            {showArrows && slides.length > 1 && (
                <>
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                        onClick={goToPrevious}
                    >
                        ←
                    </button>
                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 transform rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
                        onClick={goToNext}
                    >
                        →
                    </button>
                </>
            )}
        </div>
    );
};
