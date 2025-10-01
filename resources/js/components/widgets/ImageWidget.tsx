import { cn } from '@/lib/utils';
import React from 'react';

interface ImageWidgetProps {
    image: string;
    altText?: string;
    caption?: string;
    alignment?: 'left' | 'center' | 'right';
    size?: 'small' | 'medium' | 'large' | 'full';
    className?: string;
}

export const ImageWidget: React.FC<ImageWidgetProps> = ({
    image,
    altText = '',
    caption,
    alignment = 'center',
    size = 'medium',
    className,
}) => {
    const sizeClasses = {
        small: 'max-w-sm',
        medium: 'max-w-md',
        large: 'max-w-lg',
        full: 'w-full',
    };

    const alignmentClasses = {
        left: 'mx-0 mr-auto',
        center: 'mx-auto',
        right: 'ml-auto mx-0',
    };

    return (
        <figure
            className={cn(
                'block',
                sizeClasses[size],
                alignmentClasses[alignment],
                className,
            )}
        >
            <img
                src={image}
                alt={altText}
                className={cn(
                    'rounded-lg shadow-md',
                    size === 'full'
                        ? 'h-auto w-full'
                        : 'h-auto w-full object-cover',
                )}
            />
            {caption && (
                <figcaption className="mt-2 text-center text-sm text-gray-600">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
};
