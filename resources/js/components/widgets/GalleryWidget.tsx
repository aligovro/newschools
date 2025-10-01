import { cn } from '@/lib/utils';
import { X, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';

interface GalleryWidgetProps {
    images: string[];
    columns?: number;
    showCaptions?: boolean;
    lightbox?: boolean;
    className?: string;
}

export const GalleryWidget: React.FC<GalleryWidgetProps> = ({
    images,
    columns = 3,
    showCaptions = false,
    lightbox = true,
    className,
}) => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
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
            <div
                className={cn(
                    'grid gap-4',
                    gridCols[columns as keyof typeof gridCols] || 'grid-cols-3',
                    className,
                )}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={cn(
                            'group relative overflow-hidden rounded-lg bg-gray-100',
                            lightbox && 'cursor-pointer',
                        )}
                        onClick={() => handleImageClick(image)}
                    >
                        <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {lightbox && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-30">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>
                        )}

                        {showCaptions && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2 text-white">
                                <p className="text-sm">
                                    Изображение {index + 1}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightbox && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
                    onClick={closeLightbox}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw]">
                        <img
                            src={selectedImage}
                            alt="Lightbox"
                            className="max-h-full max-w-full rounded-lg"
                        />
                        <button
                            onClick={closeLightbox}
                            className="absolute -right-4 -top-4 rounded-full bg-white p-2 text-black shadow-lg hover:bg-gray-100"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
