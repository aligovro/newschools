import React from 'react';
import { HeroSlide } from './types';

interface ImagePreviewProps {
    slide: HeroSlide;
    getGradientStyle: (
        color: string,
        opacity: number,
        gradient: string,
        intensity: number,
    ) => string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    slide,
    getGradientStyle,
}) => {
    if (!slide.backgroundImage) return null;

    return (
        <div className="mt-2">
            <div className="relative h-32 w-full overflow-hidden rounded">
                <img
                    src={slide.backgroundImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                />
                {/* Предварительный просмотр наложения */}
                {slide.overlayOpacity && slide.overlayOpacity > 0 && (
                    <div
                        className="absolute inset-0"
                        style={{
                            opacity: (slide.overlayOpacity || 0) / 100,
                            background:
                                slide.overlayGradient &&
                                slide.overlayGradient !== 'none'
                                    ? getGradientStyle(
                                          slide.overlayColor || '#000000',
                                          slide.overlayOpacity || 0,
                                          slide.overlayGradient,
                                          slide.overlayGradientIntensity || 50,
                                      )
                                    : slide.overlayColor || '#000000',
                        }}
                    />
                )}
            </div>
        </div>
    );
};
