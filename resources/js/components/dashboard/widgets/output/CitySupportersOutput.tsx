import { widgetsApi } from '@/lib/api/widgets';
import { getPluralForm } from '@/lib/helpers';
import { getOrganizationId as getOrgIdFromConfig } from '@/utils/widgetHelpers';
import { usePage } from '@inertiajs/react';
import React, { useMemo } from 'react';
import { CitySupportersOutputConfig, WidgetOutputProps } from './types';

export const CitySupportersOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as CitySupportersOutputConfig;

    const {
        title = 'Топ поддерживающих городов',
        show_title = true, // По умолчанию true для обратной совместимости
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
            _city?: {
                schools_count?: number;
                supporters_count?: number;
                subscriptions_count?: number | null;
                alumni_count?: number | null;
                total_amount?: number;
            };
        }>
    >([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const [hasTriedLoad, setHasTriedLoad] = React.useState(false);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(false);
    const [pagination, setPagination] = React.useState<{
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    } | null>(null);

    // Пытаемся определить organizationId: приоритет config, затем глобальные props страницы
    const page = usePage();
    const propsAny = (page?.props as any) || {};
    const pageOrganizationId = (propsAny?.organizationId ||
        propsAny?.organization?.id ||
        propsAny?.site?.organization_id ||
        propsAny?.site?.organization?.id) as number | undefined;
    const organizationId =
        config.organizationId ||
        (widget as any)?.config?.organization_id ||
        (widget as any)?.organization_id ||
        getOrgIdFromConfig(widget.config as any) ||
        pageOrganizationId;

    // Для отладки
    React.useEffect(() => {
        if (!organizationId && !hasTriedLoad) {
            console.log('CitySupportersOutput: organizationId not found', {
                config: config.organizationId,
                widgetConfig: (widget as any)?.config?.organization_id,
                widgetOrgId: (widget as any)?.organization_id,
                pageOrgId: pageOrganizationId,
                props: propsAny,
            });
        }
    }, [organizationId, hasTriedLoad]);

    // Функция загрузки данных
    const loadData = React.useCallback(
        async (page: number = 1, append: boolean = false) => {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            try {
                let response;
                let dataArray = [];
                let paginationData = null;

                // Сначала пробуем загрузить данные для организации (если указана)
                if (organizationId) {
                    try {
                        response = await widgetsApi.getCitySupporters(
                            organizationId,
                            {
                                page,
                                per_page: 6,
                            },
                        );

                        // Обрабатываем разные форматы ответа API
                        if (response?.data && Array.isArray(response.data)) {
                            dataArray = response.data;
                            paginationData = response.pagination;
                        } else if (
                            response?.data &&
                            typeof response.data === 'object' &&
                            'data' in response.data
                        ) {
                            dataArray = Array.isArray(response.data.data)
                                ? response.data.data
                                : [];
                            paginationData =
                                response.data.pagination || response.pagination;
                        }
                    } catch (orgErr) {
                        console.warn(
                            'CitySupportersOutput: failed to load organization data, using public API',
                            orgErr,
                        );
                    }
                }

                // Если данных для организации нет, используем публичный API
                if (dataArray.length === 0 && !response) {
                    response = await widgetsApi.getCitySupportersPublic({
                        page,
                        per_page: 6,
                    });

                    if (response?.data && Array.isArray(response.data)) {
                        dataArray = response.data;
                        paginationData = response.pagination;
                    } else if (
                        response?.data &&
                        typeof response.data === 'object' &&
                        'data' in response.data
                    ) {
                        dataArray = Array.isArray(response.data.data)
                            ? response.data.data
                            : [];
                        paginationData =
                            response.data.pagination || response.pagination;
                    }
                }

                const mapped = dataArray.map((c) => {
                    return {
                        id: c.id,
                        name: c.region_name
                            ? `${c.name} и ${c.region_name}`
                            : c.name,
                        rating: 5,
                        votes: c.supporters_count || 0,
                        description: undefined,
                        _city: {
                            schools_count: c.schools_count ?? 0,
                            supporters_count: c.supporters_count,
                            subscriptions_count: c.subscriptions_count ?? 0,
                            alumni_count: c.alumni_count,
                            total_amount: c.total_amount,
                        },
                    };
                });

                if (append) {
                    setLoadedRegions((prev) => [...prev, ...mapped]);
                } else {
                    setLoadedRegions(mapped);
                }

                if (paginationData) {
                    setPagination(paginationData);
                    setHasMore(
                        paginationData.current_page < paginationData.last_page,
                    );
                    setCurrentPage(paginationData.current_page);
                }
            } catch (err) {
                console.error('Error loading city supporters data:', err);
                if (!append) {
                    setLoadedRegions([]);
                }
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [organizationId],
    );

    // Загрузка следующей страницы
    const loadMore = React.useCallback(() => {
        if (!hasMore || isLoadingMore || isLoading) return;
        const nextPage = (pagination?.current_page || currentPage) + 1;
        loadData(nextPage, true);
    }, [hasMore, isLoadingMore, isLoading, pagination, currentPage, loadData]);

    React.useEffect(() => {
        // Если нет преднастроенных регионов, загружаем с бэкенда
        if ((regions?.length ?? 0) === 0 && !hasTriedLoad) {
            setHasTriedLoad(true);
            loadData(1, false);
        }
    }, [regions, hasTriedLoad, loadData]);

    const effectiveRegions = useMemo(
        () => (regions && regions.length > 0 ? regions : loadedRegions),
        [regions, loadedRegions],
    );

    // Для преднастроенных регионов используем limit, для загруженных - показываем все
    const displayRegions = useMemo(() => {
        if (regions && regions.length > 0) {
            return limit > 0
                ? effectiveRegions.slice(0, limit)
                : effectiveRegions;
        }
        return effectiveRegions;
    }, [effectiveRegions, limit, regions]);

    // Форматирование чисел с пробелами для разделения тысяч
    const formatNumber = useMemo(
        () => (num: number) => {
            return new Intl.NumberFormat('ru-RU', {
                useGrouping: true,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(num);
        },
        [],
    );

    const formatAmount = useMemo(
        () => (amount: number) => {
            const rubles = amount / 100;
            return `${formatNumber(Math.round(rubles))} ₽`;
        },
        [formatNumber],
    );

    if ((!effectiveRegions || effectiveRegions.length === 0) && isLoading) {
        return (
            <div
                className={`city-supporters-output ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Загрузка данных о поддерживающих городах…
                    </span>
                </div>
            </div>
        );
    }

    if (!effectiveRegions || effectiveRegions.length === 0) {
        return (
            <div
                className={`city-supporters-output city-supporters-output--empty ${className || ''}`}
                style={style}
            >
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <span className="text-gray-500">
                        Данные о поддерживающих городах не найдены
                    </span>
                </div>
            </div>
        );
    }

    const renderCityRow = (region: (typeof displayRegions)[0]) => {
        const city = region._city;
        if (!city) return null;

        return (
            <div key={region.id} className="city-supporters-output__row">
                {/* Первая колонка: Иконка + Название города */}
                <div className="city-supporters-output__column city-supporters-output__column--city">
                    <div className="city-supporters-output__column-icon">
                        <img
                            src="/icons/map-black-icon.svg"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="city-supporters-output__column-text">
                        {region.name}
                    </div>
                </div>

                {/* Вторая колонка: Количество школ */}
                <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--schools">
                    <div className="city-supporters-output__column-icon city-supporters-output__column-icon--mobile-only">
                        <img
                            src="/icons/mobile-menu/schools.svg"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    {city.schools_count !== undefined ? (
                        <>
                            <span className="city-supporters-output__number">
                                {formatNumber(city.schools_count)}
                            </span>{' '}
                            <span>
                                {getPluralForm(city.schools_count, [
                                    'школа',
                                    'школы',
                                    'школ',
                                ])}
                            </span>
                        </>
                    ) : (
                        '-'
                    )}
                </div>

                {/* Третья колонка: Количество выпускников */}
                <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--alumni">
                    <div className="city-supporters-output__column-icon city-supporters-output__column-icon--mobile-only">
                        <img
                            src="/icons/organization/graduates.svg"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    {city.alumni_count != null ? (
                        <>
                            <span className="city-supporters-output__number">
                                {formatNumber(city.alumni_count)}
                            </span>{' '}
                            <span>
                                {getPluralForm(city.alumni_count, [
                                    'выпускник',
                                    'выпускника',
                                    'выпускников',
                                ])}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="city-supporters-output__number">0</span>{' '}
                            <span>выпускников</span>
                        </>
                    )}
                </div>

                {/* Четвертая колонка: Иконка + Количество подписок */}
                <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--metric-icon">
                    <div className="city-supporters-output__column-icon">
                        <img
                            src="/icons/lovely-blue.svg"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    <div className="city-supporters-output__column-text">
                        {city.subscriptions_count !== undefined &&
                        city.subscriptions_count !== null ? (
                            <>
                                <span className="city-supporters-output__number">
                                    {formatNumber(city.subscriptions_count)}
                                </span>{' '}
                                <span>
                                    {getPluralForm(city.subscriptions_count, [
                                        'подписчик',
                                        'подписчика',
                                        'подписчиков',
                                    ])}
                                </span>
                            </>
                        ) : (
                            '-'
                        )}
                    </div>
                </div>

                {/* Пятая колонка: Общая сумма сборов */}
                <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--amount">
                    <div className="city-supporters-output__column-icon city-supporters-output__column-icon--mobile-only">
                        <img
                            src="/icons/organization/auto-payments.svg"
                            alt=""
                            className="h-full w-full object-contain"
                        />
                    </div>
                    {typeof city.total_amount === 'number' ? (
                        <div className="city-supporters-output__amount-wrapper">
                            <span className="city-supporters-output__number">
                                {formatNumber(
                                    Math.round(city.total_amount / 100),
                                )}
                            </span>
                            <span className="city-supporters-output__currency">₽</span>
                        </div>
                    ) : (
                        '-'
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            className={`city-supporters-output ${className || ''}`}
            style={style}
        >
            {title && show_title && (
                <h2 className="city-supporters-output__title">{title}</h2>
            )}

            {subtitle && <p className="mb-6 text-gray-600">{subtitle}</p>}

            <div className="city-supporters-output__list">
                {displayRegions.map((region) => renderCityRow(region))}
            </div>

            {/* Кнопка "Загрузить еще" для пагинации */}
            {(!regions || regions.length === 0) && hasMore && (
                <div className="city-supporters-output__load-more">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoadingMore || isLoading}
                        className="city-supporters-output__load-more-button"
                    >
                        {isLoadingMore ? (
                            <>
                                <span className="city-supporters-output__load-more-spinner">
                                    ⏳
                                </span>
                                Загрузка...
                            </>
                        ) : (
                            'Загрузить еще'
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
