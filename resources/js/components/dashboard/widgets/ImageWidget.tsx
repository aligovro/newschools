import { cn } from '@/lib/utils';
import { getConfigValue, WidgetConfig } from '@/utils/getConfigValue';
import { Link } from '@inertiajs/react';
import React from 'react';

interface ImageWidgetProps {
    image: string;
    altText?: string;
    caption?: string;
    alignment?: 'left' | 'center' | 'right';
    size?: 'small' | 'medium' | 'large' | 'full';
    className?: string;
    // Поддержка configs для нормализованных данных
    configs?: WidgetConfig[];
    styling?: Record<string, any>;
    linkUrl?: string;
    linkType?: 'internal' | 'external';
    openInNewTab?: boolean;
}

export const ImageWidget: React.FC<ImageWidgetProps> = ({
    image,
    altText = '',
    caption,
    alignment = 'center',
    size = 'medium',
    className,
    configs,
    styling,
    linkUrl,
    linkType = 'internal',
    openInNewTab = false,
}) => {
    // Извлекаем значения из configs если они переданы
    const configImage = configs
        ? getConfigValue(configs, 'image', image)
        : image;
    const configAltText = configs
        ? getConfigValue(configs, 'altText', altText)
        : altText;
    const configCaption = configs
        ? getConfigValue(configs, 'caption', caption)
        : caption;
    const configAlignment = configs
        ? getConfigValue(configs, 'alignment', alignment)
        : alignment;
    const configSize = configs ? getConfigValue(configs, 'size', size) : size;
    const configLinkUrl = configs
        ? getConfigValue(configs, 'linkUrl', linkUrl)
        : linkUrl;
    const configLinkType = configs
        ? getConfigValue(configs, 'linkType', linkType)
        : linkType;
    const configOpenInNewTab = configs
        ? getConfigValue(configs, 'openInNewTab', openInNewTab)
        : openInNewTab;

    // Если нет изображения, не рендерим ничего
    if (!configImage) {
        return null;
    }
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

    const imageElement = (
        <img
            src={configImage}
            alt={configAltText}
            className={cn(
                'rounded-lg shadow-md',
                configSize === 'full'
                    ? 'h-auto w-full'
                    : 'h-auto w-full object-cover',
            )}
        />
    );

    const wrappedImage = configLinkUrl ? (
        configLinkType === 'external' ? (
            <a
                href={String(configLinkUrl)}
                target={configOpenInNewTab ? '_blank' : undefined}
                rel={configOpenInNewTab ? 'noopener noreferrer' : undefined}
            >
                {imageElement}
            </a>
        ) : (
            <Link
                href={String(configLinkUrl)}
                target={configOpenInNewTab ? '_blank' : undefined}
            >
                {imageElement}
            </Link>
        )
    ) : (
        imageElement
    );

    return (
        <figure
            className={cn(
                'block',
                sizeClasses[configSize as keyof typeof sizeClasses],
                alignmentClasses[
                    configAlignment as keyof typeof alignmentClasses
                ],
                className,
            )}
            style={styling}
        >
            {wrappedImage}
            {configCaption && (
                <figcaption className="mt-2 text-center text-sm text-gray-600">
                    {configCaption}
                </figcaption>
            )}
        </figure>
    );
};
