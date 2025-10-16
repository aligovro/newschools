import { Button } from '@/components/ui/button';
import React from 'react';
import { HeroSlide } from './types';

interface HeroRendererProps {
    slide: HeroSlide | null;
    height: string;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
    css_class?: string;
}

export const HeroRenderer: React.FC<HeroRendererProps> = ({
    slide,
    height,
    getGradientStyle,
    css_class,
}) => {
    // Если slide не существует, показываем пустой блок
    if (!slide) {
        return (
            <div
                className={`hero-renderer ${css_class || ''}`}
                style={{ height }}
            >
                <div className="flex h-full items-center justify-center text-gray-500">
                    Нет данных для отображения
                </div>
            </div>
        );
    }

    // Генерируем URL изображения
    const bg = slide.backgroundImage || '';

    let safeImage = '';
    if (bg) {
        if (bg.startsWith('blob:')) {
            safeImage = '';
        } else if (bg.startsWith('http://') || bg.startsWith('https://')) {
            safeImage = bg;
        } else {
            // Убираем лишние слеши и добавляем /storage/
            const cleanPath = bg.replace(/^\/+/, '');
            safeImage = `${window.location.origin}/storage/${cleanPath}`;
        }
    }

    console.log('HeroRenderer: Slide image URL', {
        slide_id: slide.id,
        backgroundImage: slide.backgroundImage,
        final_url: safeImage,
    });

    const slideStyle = {
        backgroundImage: safeImage
            ? `url(${safeImage})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height,
        position: 'relative' as const,
    };

    const overlayStyle = {
        position: 'absolute' as const,
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

    return (
        <div
            key={slide.id}
            className={`hero-slide ${css_class || ''}`}
            style={{ ...slideStyle, pointerEvents: 'none' }}
        >
            <div style={overlayStyle} />
            <div
                className="relative z-10 flex h-full items-center justify-center"
                style={{ pointerEvents: 'auto' }}
            >
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
                            onClick={() => {
                                if (slide.buttonLink) {
                                    const target = slide.buttonOpenInNewTab
                                        ? '_blank'
                                        : '_self';

                                    // Обработка внутренних ссылок
                                    if (slide.buttonLinkType === 'internal') {
                                        // Если ссылка начинается с /, это внутренняя ссылка
                                        if (slide.buttonLink.startsWith('/')) {
                                            window.location.href =
                                                slide.buttonLink;
                                        } else {
                                            // Если не начинается с /, добавляем /
                                            window.location.href = `/${slide.buttonLink}`;
                                        }
                                    } else {
                                        // Внешние ссылки
                                        window.open(slide.buttonLink, target);
                                    }
                                }
                            }}
                        >
                            {slide.buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
