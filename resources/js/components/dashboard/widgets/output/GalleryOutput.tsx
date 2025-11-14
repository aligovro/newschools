import { getImageUrl } from '@/utils/getImageUrl';
import React, { useState } from 'react';
import { GalleryOutputConfig, WidgetOutputProps } from './types';

export const GalleryOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as GalleryOutputConfig;

    const {
        images = [],
        columns = 3,
        showCaptions = false,
        lightbox = true,
    } = config;

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (!images || images.length === 0) {
        return (
            <div
                className={`gallery-output gallery-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">Галерея пуста</span>
                </div>
            </div>
        );
    }

    // Filter out blob URLs and format image URLs
    const safeImages = images
        .filter((img) => typeof img === 'string' && !img.startsWith('blob:'))
        .map((img) => getImageUrl(img as string));

    if (safeImages.length === 0) {
        return (
            <div
                className={`gallery-output gallery-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Изображения недоступны
                    </span>
                </div>
            </div>
        );
    }

    const getGridClasses = (columns: number) => {
        switch (columns) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-1 md:grid-cols-2';
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            case 5:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
            case 6:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    };

    const handleImageClick = (image: string) => {
        if (lightbox) {
            setSelectedImage(image);
        }
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    return (
        <>
            <div className={`gallery-output ${className || ''}`} style={style}>
                <div className={`grid gap-4 ${getGridClasses(columns)}`}>
                    {safeImages.map((image, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-lg bg-gray-100"
                        >
                            <img
                                src={image}
                                alt={`Gallery image ${index + 1}`}
                                className="h-48 w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onClick={() => handleImageClick(image)}
                            />
                            {showCaptions && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-white">
                                    <p className="text-sm">
                                        Изображение {index + 1}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            {lightbox && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={closeLightbox}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img
                            src={selectedImage}
                            alt="Lightbox view"
                            className="max-h-full max-w-full object-contain"
                        />
                        <button
                            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                            onClick={closeLightbox}
                            aria-label="Close lightbox"
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
