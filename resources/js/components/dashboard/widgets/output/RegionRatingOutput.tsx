import { widgetsApi } from '@/lib/api/widgets';
import { getOrganizationId as getOrgIdFromConfig } from '@/utils/widgetHelpers';
import { usePage } from '@inertiajs/react';
import React from 'react';
import { RegionRatingOutputConfig, WidgetOutputProps } from './types';

export const RegionRatingOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as RegionRatingOutputConfig;

    const {
        title = 'Топ поддерживающих городов',
        subtitle = '',
        regions = [],
        limit = 7,
        showVotes = true,
        showDescription = true,
    } = config;
    const [loadedRegions, setLoadedRegions] = React.useState<
        Array<{
            id: number | string;
            name: string;
            rating: number;
            votes: number;
            description?: string;
        }>
    >([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasTriedLoad, setHasTriedLoad] = React.useState(false);

    // Пытаемся определить organizationId: приоритет config, затем глобальные props страницы
    const page = usePage();
    const propsAny = (page?.props as any) || {};
    const pageOrganizationId = (propsAny?.organization?.id ||
        propsAny?.site?.organization_id ||
        propsAny?.site?.organization?.id) as number | undefined;
    const organizationId =
        config.organizationId ||
        (widget as any)?.config?.organization_id ||
        (widget as any)?.organization_id ||
        getOrgIdFromConfig(widget.config as any) ||
        pageOrganizationId;

    React.useEffect(() => {
        // Если нет преднастроенных регионов, попробуем загрузить с бэкенда
        if ((regions?.length ?? 0) === 0 && !hasTriedLoad) {
            setHasTriedLoad(true);
            setIsLoading(true);
            const loader = organizationId
                ? widgetsApi.getCitySupporters(organizationId, {
                      per_page: limit,
                  })
                : widgetsApi.getCitySupportersPublic({ per_page: limit });

            loader
                .then((resp) => {
                    const mapped = (resp?.data || []).map((c) => ({
                        id: c.id,
                        name: c.region_name
                            ? `${c.name} и ${c.region_name}`
                            : c.name,
                        rating: 5,
                        votes: c.supporters_count,
                        description: undefined,
                        _city: c,
                    }));
                    setLoadedRegions(mapped);
                })
                .catch((err) => {})
                .finally(() => setIsLoading(false));
        }
    }, [regions, organizationId, limit, hasTriedLoad]);

    const effectiveRegions =
        regions && regions.length > 0 ? regions : loadedRegions;
    const displayRegions =
        limit > 0 ? effectiveRegions.slice(0, limit) : effectiveRegions;

    if ((!effectiveRegions || effectiveRegions.length === 0) && isLoading) {
        return (
            <div
                className={`region-rating-output ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Загрузка рейтинга регионов…
                    </span>
                </div>
            </div>
        );
    }

    if (!effectiveRegions || effectiveRegions.length === 0) {
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

    // Убрали звезды/рейтинги — для городов выводим списочные метрики

    const renderRegion = (region: any, index: number) => {
        const city = (region as any)._city as
            | {
                  schools_count?: number;
                  supporters_count?: number;
                  subscriptions_count?: number | null;
                  alumni_count?: number | null;
                  total_amount?: number;
              }
            | undefined;
        return (
            <div
                key={region.id}
                className="region-item rounded-lg bg-white p-4 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-lg font-semibold text-gray-900">
                            {region.name}
                        </div>
                        <div className="mt-1 space-y-1 text-sm text-gray-700">
                            {city?.schools_count !== undefined && (
                                <div>
                                    {city.schools_count.toLocaleString('ru-RU')}{' '}
                                    школ
                                </div>
                            )}
                            {city?.alumni_count != null && (
                                <div>
                                    {city.alumni_count.toLocaleString('ru-RU')}{' '}
                                    выпускников
                                </div>
                            )}
                            {city?.subscriptions_count != null && (
                                <div>
                                    {city.subscriptions_count.toLocaleString(
                                        'ru-RU',
                                    )}{' '}
                                    подписок
                                </div>
                            )}
                            {typeof city?.total_amount === 'number' && (
                                <div>
                                    {(city.total_amount / 100)
                                        .toFixed(0)
                                        .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ' ',
                                        )}{' '}
                                    ₽
                                </div>
                            )}
                        </div>
                    </div>
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

            <div className="mt-6 text-center">
                <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50">
                    Загрузить ещё
                </button>
            </div>
        </div>
    );
};
