import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

interface SliderSettings {
    autoplay?: boolean;
    autoplay_delay?: number;
    show_arrows?: boolean;
    show_dots?: boolean;
    height?: string;
    overlay_opacity?: number;
    text_position?: string;
    animation?: string;
    items_per_view?: number;
    items_per_view_mobile?: number;
    gap?: number;
    infinite?: boolean;
    lightbox?: boolean;
}

interface Slide {
    id: number;
    title?: string;
    subtitle?: string;
    description?: string;
    image?: string;
    background_image?: string;
    button_text?: string;
    button_url?: string;
    button_style?: string;
    content_type?: string;
    content_data?: any;
    image_url?: string;
    background_image_url?: string;
}

interface SliderRendererProps {
    slider: {
        id: number;
        type: string;
        settings: SliderSettings;
        slides: Slide[];
    };
    className?: string;
}

export default function SliderRenderer({
    slider,
    className,
}: SliderRendererProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(
        slider.settings.autoplay || false,
    );
    const [isMobile, setIsMobile] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const sliderRef = useRef<HTMLDivElement>(null);

    const settings = {
        autoplay: true,
        autoplay_delay: 5000,
        show_arrows: true,
        show_dots: true,
        height: '100vh',
        overlay_opacity: 0.4,
        text_position: 'center',
        animation: 'fade',
        items_per_view: 3,
        items_per_view_mobile: 1,
        gap: 20,
        infinite: true,
        lightbox: false,
        ...slider.settings,
    };

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isPlaying && slider.slides.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentSlide((prev) => {
                    if (settings.infinite) {
                        return (prev + 1) % slider.slides.length;
                    }
                    return prev === slider.slides.length - 1 ? 0 : prev + 1;
                });
            }, settings.autoplay_delay);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [
        isPlaying,
        slider.slides.length,
        settings.autoplay_delay,
        settings.infinite,
    ]);

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        if (settings.infinite) {
            setCurrentSlide((prev) => (prev + 1) % slider.slides.length);
        } else {
            setCurrentSlide((prev) =>
                prev === slider.slides.length - 1 ? 0 : prev + 1,
            );
        }
    };

    const prevSlide = () => {
        if (settings.infinite) {
            setCurrentSlide((prev) =>
                prev === 0 ? slider.slides.length - 1 : prev - 1,
            );
        } else {
            setCurrentSlide((prev) =>
                prev === 0 ? slider.slides.length - 1 : prev - 1,
            );
        }
    };

    const handleMouseEnter = () => {
        if (settings.autoplay) {
            setIsPlaying(false);
        }
    };

    const handleMouseLeave = () => {
        if (settings.autoplay) {
            setIsPlaying(true);
        }
    };

    if (!slider.slides || slider.slides.length === 0) {
        return null;
    }

    const renderHeroSlider = () => (
        <div
            ref={sliderRef}
            className="relative w-full overflow-hidden"
            style={{ height: settings.height }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {slider.slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={cn(
                        'absolute inset-0 transition-opacity duration-1000',
                        index === currentSlide ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    {slide.background_image_url && (
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{
                                backgroundImage: `url(${slide.background_image_url})`,
                            }}
                        />
                    )}
                    <div
                        className="absolute inset-0 bg-black"
                        style={{ opacity: settings.overlay_opacity }}
                    />
                    <div
                        className={cn(
                            'relative z-10 flex h-full items-center justify-center px-4 text-white',
                            {
                                'text-left': settings.text_position === 'left',
                                'text-center':
                                    settings.text_position === 'center',
                                'text-right':
                                    settings.text_position === 'right',
                                'items-start pt-20':
                                    settings.text_position === 'top',
                                'items-end pb-20':
                                    settings.text_position === 'bottom',
                            },
                        )}
                    >
                        <div className="max-w-4xl">
                            {slide.subtitle && (
                                <p className="mb-2 text-lg font-medium opacity-90">
                                    {slide.subtitle}
                                </p>
                            )}
                            {slide.title && (
                                <h1 className="mb-4 text-4xl font-bold md:text-6xl">
                                    {slide.title}
                                </h1>
                            )}
                            {slide.description && (
                                <p className="mb-8 text-lg opacity-90 md:text-xl">
                                    {slide.description}
                                </p>
                            )}
                            {slide.button_text && slide.button_url && (
                                <a
                                    href={slide.button_url}
                                    className={cn(
                                        'inline-block rounded-lg px-8 py-3 text-lg font-semibold transition-colors',
                                        {
                                            'bg-blue-600 hover:bg-blue-700':
                                                slide.button_style ===
                                                'primary',
                                            'bg-gray-600 hover:bg-gray-700':
                                                slide.button_style ===
                                                'secondary',
                                            'border-2 border-white hover:bg-white hover:text-black':
                                                slide.button_style ===
                                                'outline',
                                        },
                                    )}
                                >
                                    {slide.button_text}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {settings.show_arrows && slider.slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
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
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
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

            {settings.show_dots && slider.slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 space-x-2">
                    {slider.slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                'h-3 w-3 rounded-full transition-colors',
                                index === currentSlide
                                    ? 'bg-white'
                                    : 'bg-white/50',
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderContentSlider = () => {
        const itemsPerView = isMobile
            ? settings.items_per_view_mobile
            : settings.items_per_view;
        const slideWidth = 100 / itemsPerView;

        return (
            <div
                ref={sliderRef}
                className="relative w-full overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentSlide * slideWidth}%)`,
                        gap: `${settings.gap}px`,
                    }}
                >
                    {slider.slides.map((slide) => (
                        <div
                            key={slide.id}
                            className="flex-shrink-0"
                            style={{
                                width: `calc(${slideWidth}% - ${settings.gap}px)`,
                            }}
                        >
                            <div className="h-full rounded-lg bg-white shadow-lg">
                                {slide.image_url && (
                                    <img
                                        src={slide.image_url}
                                        alt={slide.title || ''}
                                        className="h-48 w-full rounded-t-lg object-cover"
                                    />
                                )}
                                <div className="p-6">
                                    {slide.title && (
                                        <h3 className="mb-2 text-xl font-semibold">
                                            {slide.title}
                                        </h3>
                                    )}
                                    {slide.description && (
                                        <p className="mb-4 text-gray-600">
                                            {slide.description}
                                        </p>
                                    )}
                                    {slide.button_text && slide.button_url && (
                                        <a
                                            href={slide.button_url}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            {slide.button_text}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {settings.show_arrows &&
                    slider.slides.length > itemsPerView && (
                        <>
                            <button
                                onClick={prevSlide}
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-50"
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
                                onClick={nextSlide}
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-50"
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

                {settings.show_dots && slider.slides.length > itemsPerView && (
                    <div className="mt-4 flex justify-center space-x-2">
                        {Array.from({
                            length: Math.ceil(
                                slider.slides.length / itemsPerView,
                            ),
                        }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index * itemsPerView)}
                                className={cn(
                                    'h-3 w-3 rounded-full transition-colors',
                                    Math.floor(currentSlide / itemsPerView) ===
                                        index
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300',
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderSlider = () => {
        switch (slider.type) {
            case 'hero':
                return renderHeroSlider();
            case 'content':
            case 'gallery':
            case 'testimonials':
                return renderContentSlider();
            default:
                return renderHeroSlider();
        }
    };

    return (
        <div className={cn('slider-container', className)}>
            {renderSlider()}
        </div>
    );
}
