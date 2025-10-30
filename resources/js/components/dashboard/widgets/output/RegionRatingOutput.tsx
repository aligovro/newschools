import React from 'react';
import { RegionRatingOutputConfig, WidgetOutputProps } from './types';

export const RegionRatingOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as RegionRatingOutputConfig;

    const {
        title = 'Рейтинг регионов',
        subtitle = '',
        regions = [],
        limit = 10,
        showVotes = true,
        showDescription = true,
    } = config;

    const displayRegions = limit > 0 ? regions.slice(0, limit) : regions;

    if (!regions || regions.length === 0) {
        return (
            <div
                className={`region-rating-output region-rating-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Рейтинг регионов не настроен
                    </span>
                </div>
            </div>
        );
    }

    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-yellow-600';
        if (rating >= 2.5) return 'text-orange-600';
        return 'text-red-600';
    };

    const getRatingStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>,
            );
        }

        if (hasHalfStar) {
            stars.push(
                <div key="half" className="relative">
                    <svg
                        className="h-5 w-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="absolute left-0 top-0 h-full w-1/2 overflow-hidden">
                        <svg
                            className="h-5 w-5 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </div>
                </div>,
            );
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <svg
                    key={`empty-${i}`}
                    className="h-5 w-5 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>,
            );
        }

        return stars;
    };

    const renderRegion = (region: any, index: number) => {
        return (
            <div
                key={region.id}
                className="region-item flex items-center justify-between rounded-lg bg-white p-4 shadow-sm"
            >
                <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                    </div>

                    {/* Region info */}
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {region.name}
                        </h3>
                        {showDescription && region.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                {region.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Rating */}
                <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="flex">
                            {getRatingStars(region.rating)}
                        </div>
                        <span
                            className={`text-lg font-bold ${getRatingColor(region.rating)}`}
                        >
                            {region.rating.toFixed(1)}
                        </span>
                    </div>
                    {showVotes && (
                        <p className="text-xs text-gray-500">
                            {region.votes}{' '}
                            {region.votes === 1 ? 'голос' : 'голосов'}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`region-rating-output ${className || ''}`}
            style={style}
        >
            {title && (
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {title}
                </h2>
            )}

            {subtitle && <p className="mb-6 text-gray-600">{subtitle}</p>}

            <div className="space-y-3">
                {displayRegions.map((region, index) =>
                    renderRegion(region, index),
                )}
            </div>

            {regions.length > limit && limit > 0 && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Показано {limit} из {regions.length} регионов
                    </p>
                </div>
            )}
        </div>
    );
};
