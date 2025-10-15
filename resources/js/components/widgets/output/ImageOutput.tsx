import React from 'react';
import { ImageOutputConfig, WidgetOutputProps } from './types';

export const ImageOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as ImageOutputConfig;

    const {
        image = '',
        altText = '',
        caption = '',
        alignment = 'center',
        size = 'medium',
    } = config;

    if (!image) {
        return (
            <div
                className={`image-output image-output--placeholder ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Изображение не выбрано
                    </span>
                </div>
            </div>
        );
    }

    // Filter out blob URLs for non-interactive viewing
    const safeImage =
        typeof image === 'string' && image.startsWith('blob:') ? '' : image;

    if (!safeImage) {
        return (
            <div
                className={`image-output image-output--placeholder ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Изображение недоступно
                    </span>
                </div>
            </div>
        );
    }

    const getSizeClasses = (size: string) => {
        switch (size) {
            case 'small':
                return 'max-w-xs';
            case 'medium':
                return 'max-w-md';
            case 'large':
                return 'max-w-2xl';
            case 'full':
                return 'w-full';
            default:
                return 'max-w-md';
        }
    };

    const getAlignmentClasses = (alignment: string) => {
        switch (alignment) {
            case 'left':
                return 'mx-0 mr-auto';
            case 'right':
                return 'mx-0 ml-auto';
            case 'center':
                return 'mx-auto';
            default:
                return 'mx-auto';
        }
    };

    return (
        <div className={`image-output ${className || ''}`} style={style}>
            <div
                className={`${getSizeClasses(size)} ${getAlignmentClasses(alignment)}`}
            >
                <img
                    src={safeImage}
                    alt={altText}
                    className="h-auto w-full rounded-lg object-cover"
                    loading="lazy"
                />
                {caption && (
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {caption}
                    </p>
                )}
            </div>
        </div>
    );
};
