import { cn } from '@/lib/utils';
import React from 'react';

interface StatItem {
    value: string | number;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
}

interface StatsWidgetProps {
    title?: string;
    stats: StatItem[];
    columns?: number;
    layout?: 'grid' | 'list' | 'carousel';
    showIcons?: boolean;
    animation?: 'none' | 'count-up' | 'fade-in';
    className?: string;
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
    title,
    stats,
    columns = 3,
    layout = 'grid',
    showIcons = true,
    animation = 'fade-in',
    className,
}) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
    };

    const animationClasses = {
        none: '',
        'count-up': 'animate-count-up',
        'fade-in': 'animate-fade-in',
    };

    const getDefaultIcon = (index: number) => {
        const icons = [
            <svg
                key="users"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>,
            <svg
                key="dollar"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                />
            </svg>,
            <svg
                key="heart"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                />
            </svg>,
            <svg
                key="star"
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>,
        ];
        return icons[index % icons.length];
    };

    const formatValue = (value: string | number) => {
        if (typeof value === 'number') {
            if (value >= 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
            } else if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}K`;
            }
            return value.toLocaleString('ru-RU');
        }
        return value;
    };

    if (layout === 'list') {
        return (
            <section className={cn('py-8', className)}>
                <div className="container mx-auto px-4">
                    {title && (
                        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                            {title}
                        </h2>
                    )}

                    <div className="space-y-4">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-center justify-between rounded-lg border bg-white p-6 shadow-sm',
                                    animationClasses[animation],
                                )}
                            >
                                <div className="flex items-center space-x-4">
                                    {showIcons && (
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                            {stat.icon || getDefaultIcon(index)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">
                                            {stat.label}
                                        </p>
                                        {stat.description && (
                                            <p className="text-xs text-gray-500">
                                                {stat.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatValue(stat.value)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={cn('py-8', className)}>
            <div className="container mx-auto px-4">
                {title && (
                    <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
                        {title}
                    </h2>
                )}

                <div
                    className={cn(
                        'grid gap-6',
                        gridCols[columns as keyof typeof gridCols] ||
                            'grid-cols-3',
                    )}
                >
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className={cn(
                                'rounded-lg border bg-white p-6 text-center shadow-sm',
                                animationClasses[animation],
                            )}
                        >
                            {showIcons && (
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    {stat.icon || getDefaultIcon(index)}
                                </div>
                            )}

                            <div className="mb-2">
                                <p
                                    className="text-3xl font-bold text-gray-900"
                                    style={{ color: stat.color }}
                                >
                                    {formatValue(stat.value)}
                                </p>
                            </div>

                            <p className="text-lg font-medium text-gray-900">
                                {stat.label}
                            </p>

                            {stat.description && (
                                <p className="mt-2 text-sm text-gray-600">
                                    {stat.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
