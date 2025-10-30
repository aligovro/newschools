import React, { useEffect, useState } from 'react';
import { StatItem, StatsOutputConfig, WidgetOutputProps } from './types';

export const StatsOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as StatsOutputConfig;

    const {
        title = '',
        stats = [],
        columns = 3,
        layout = 'grid',
        showIcons = true,
        animation = 'none',
    } = config;

    const [animatedStats, setAnimatedStats] = useState<StatItem[]>([]);

    // Count-up animation effect
    useEffect(() => {
        if (animation === 'count-up') {
            const duration = 2000; // 2 seconds
            const steps = 60; // 60 steps
            const stepDuration = duration / steps;

            stats.forEach((stat, statIndex) => {
                const numericValue =
                    typeof stat.value === 'number'
                        ? stat.value
                        : parseInt(stat.value.toString()) || 0;
                const increment = numericValue / steps;

                for (let step = 0; step <= steps; step++) {
                    setTimeout(() => {
                        setAnimatedStats((prev) => {
                            const newStats = [...prev];
                            newStats[statIndex] = {
                                ...stat,
                                value: Math.round(increment * step),
                            };
                            return newStats;
                        });
                    }, step * stepDuration);
                }
            });
        } else {
            setAnimatedStats(stats);
        }
    }, [stats, animation]);

    if (!stats || stats.length === 0) {
        return (
            <div
                className={`stats-output stats-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Статистика не настроена
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

    const getLayoutClasses = (layout: string) => {
        switch (layout) {
            case 'list':
                return 'flex flex-col space-y-4';
            case 'carousel':
                return 'flex overflow-x-auto space-x-4 pb-4';
            case 'grid':
            default:
                return `grid gap-6 ${getGridClasses(columns)}`;
        }
    };

    const getAnimationClasses = (animation: string) => {
        switch (animation) {
            case 'fade-in':
                return 'animate-fade-in';
            case 'count-up':
                return 'transition-all duration-300';
            default:
                return '';
        }
    };

    const renderStatItem = (stat: StatItem, index: number) => {
        const currentStat = animatedStats[index] || stat;

        return (
            <div
                key={index}
                className={`stat-item ${getAnimationClasses(animation)} ${
                    layout === 'carousel' ? 'w-64 flex-shrink-0' : ''
                }`}
            >
                <div className="rounded-lg bg-white p-6 shadow-md">
                    {showIcons && stat.icon && (
                        <div className="mb-4 flex justify-center">
                            <div className="rounded-full bg-blue-100 p-3">
                                {stat.icon}
                            </div>
                        </div>
                    )}
                    <div className="text-center">
                        <div
                            className="text-3xl font-bold text-gray-900"
                            style={{ color: stat.color }}
                        >
                            {currentStat.value}
                        </div>
                        <div className="mt-2 text-lg font-medium text-gray-700">
                            {stat.label}
                        </div>
                        {stat.description && (
                            <div className="mt-1 text-sm text-gray-500">
                                {stat.description}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`stats-output ${className || ''}`} style={style}>
            {title && (
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    {title}
                </h2>
            )}
            <div className={getLayoutClasses(layout)}>
                {stats.map((stat, index) => renderStatItem(stat, index))}
            </div>
        </div>
    );
};
