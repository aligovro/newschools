import { widgetsApi } from '@/lib/api/widgets';
import { getPluralForm } from '@/lib/helpers';
import { getOrganizationId as getOrgIdFromConfig } from '@/utils/widgetHelpers';
import { usePage } from '@inertiajs/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CitySupportersOutputConfig, WidgetOutputProps } from './types';

interface CityData {
    schools_count?: number;
    supporters_count?: number;
    subscriptions_count?: number | null;
    alumni_count?: number | null;
    total_amount?: number;
}

interface RegionRow {
    id: number | string;
    name: string;
    rating: number;
    votes: number;
    _city?: CityData;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const formatNumber = (num: number) =>
    new Intl.NumberFormat('ru-RU', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);

interface RawApiResponse {
    data?: unknown;
    pagination?: PaginationData;
}

interface RawApiResponseNested {
    data?: unknown[];
    pagination?: PaginationData;
}

const parseApiResponse = (
    response: RawApiResponse,
): { data: unknown[]; pagination: PaginationData | null } => {
    if (!response?.data) return { data: [], pagination: null };
    if (Array.isArray(response.data)) {
        return { data: response.data, pagination: response.pagination ?? null };
    }
    if (typeof response.data === 'object' && 'data' in response.data) {
        const nested = response.data as RawApiResponseNested;
        return {
            data: Array.isArray(nested.data) ? nested.data : [],
            pagination: nested.pagination ?? response.pagination ?? null,
        };
    }
    return { data: [], pagination: null };
};

interface RawCity {
    id: number | string;
    name: string;
    region_name?: string;
    supporters_count?: number;
    schools_count?: number;
    subscriptions_count?: number | null;
    alumni_count?: number | null;
    total_amount?: number;
}

const mapRegion = (c: RawCity): RegionRow => ({
    id: c.id,
    name: c.region_name ? `${c.name} и ${c.region_name}` : c.name,
    rating: 5,
    votes: c.supporters_count ?? 0,
    _city: {
        schools_count: c.schools_count ?? 0,
        supporters_count: c.supporters_count,
        subscriptions_count: c.subscriptions_count ?? 0,
        alumni_count: c.alumni_count,
        total_amount: c.total_amount,
    },
});

const CityRow: React.FC<{ region: RegionRow }> = ({ region }) => {
    const city = region._city;
    if (!city) return null;

    return (
        <div className="city-supporters-output__row">
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

            <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--schools">
                <div className="city-supporters-output__column-icon city-supporters-output__column-icon--mobile-only">
                    <img
                        src="/icons/mobile-menu/schools.svg"
                        alt=""
                        className="h-full w-full object-contain"
                    />
                </div>
                {city.schools_count != null ? (
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

            <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--alumni">
                <div className="city-supporters-output__column-icon city-supporters-output__column-icon--mobile-only">
                    <img
                        src="/icons/organization/graduates.svg"
                        alt=""
                        className="h-full w-full object-contain"
                    />
                </div>
                <span className="city-supporters-output__number">
                    {formatNumber(city.alumni_count ?? 0)}
                </span>{' '}
                <span>
                    {getPluralForm(city.alumni_count ?? 0, [
                        'выпускник',
                        'выпускника',
                        'выпускников',
                    ])}
                </span>
            </div>

            <div className="city-supporters-output__column city-supporters-output__column--metric city-supporters-output__column--metric-icon">
                <div className="city-supporters-output__column-icon">
                    <img
                        src="/icons/lovely-blue.svg"
                        alt=""
                        className="h-full w-full object-contain"
                    />
                </div>
                <div className="city-supporters-output__column-text">
                    {city.subscriptions_count != null ? (
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
                            {formatNumber(Math.round(city.total_amount / 100))}
                        </span>
                        <span className="city-supporters-output__currency">
                            ₽
                        </span>
                    </div>
                ) : (
                    '-'
                )}
            </div>
        </div>
    );
};

export const CitySupportersOutput: React.FC<WidgetOutputProps> = ({
    widget,
    className,
    style,
}) => {
    const config = widget.config as CitySupportersOutputConfig;
    const {
        title = 'Топ поддерживающих городов',
        show_title = true,
        subtitle = '',
        regions = [],
        limit = 7,
    } = config;

    const [loadedRegions, setLoadedRegions] = useState<RegionRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const hasTriedLoad = useRef(false);

    const page = usePage();
    const pageProps = (page?.props ?? {}) as Record<string, unknown>;
    const org = pageProps?.organization as Record<string, unknown> | undefined;
    const site = pageProps?.site as Record<string, unknown> | undefined;
    const siteOrg = site?.organization as Record<string, unknown> | undefined;
    const pageOrganizationId = (pageProps?.organizationId ||
        org?.id ||
        site?.organization_id ||
        siteOrg?.id) as number | undefined;

    const widgetAny = widget as Record<string, unknown>;
    const widgetConfig = widgetAny?.config as Record<string, unknown> | undefined;
    const organizationId =
        config.organizationId ||
        (widgetConfig?.organization_id as number | undefined) ||
        (widgetAny?.organization_id as number | undefined) ||
        getOrgIdFromConfig(widget.config as Record<string, unknown>) ||
        pageOrganizationId;

    const loadData = useCallback(
        async (pageNum: number = 1, append: boolean = false) => {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            try {
                let result: { data: unknown[]; pagination: PaginationData | null } = {
                    data: [],
                    pagination: null,
                };

                if (organizationId) {
                    try {
                        const response = await widgetsApi.getCitySupporters(
                            organizationId,
                            { page: pageNum, per_page: 6 },
                        );
                        result = parseApiResponse(response);
                    } catch {
                        // fall through to public API
                    }
                }

                if (result.data.length === 0) {
                    const response = await widgetsApi.getCitySupportersPublic({
                        page: pageNum,
                        per_page: 6,
                    });
                    result = parseApiResponse(response);
                }

                const mapped = (result.data as RawCity[]).map(mapRegion);

                setLoadedRegions((prev) => (append ? [...prev, ...mapped] : mapped));

                if (result.pagination) {
                    setPagination(result.pagination);
                    setHasMore(
                        result.pagination.current_page < result.pagination.last_page,
                    );
                    setCurrentPage(result.pagination.current_page);
                }
            } catch (err) {
                console.error('Error loading city supporters data:', err);
                if (!append) setLoadedRegions([]);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [organizationId],
    );

    const loadMore = useCallback(() => {
        if (!hasMore || isLoadingMore || isLoading) return;
        loadData((pagination?.current_page ?? currentPage) + 1, true);
    }, [hasMore, isLoadingMore, isLoading, pagination, currentPage, loadData]);

    useEffect(() => {
        if ((regions?.length ?? 0) === 0 && !hasTriedLoad.current) {
            hasTriedLoad.current = true;
            loadData(1, false);
        }
    }, [regions, loadData]);

    const effectiveRegions = useMemo(
        () => (regions?.length > 0 ? regions : loadedRegions),
        [regions, loadedRegions],
    );

    const displayRegions = useMemo(
        () =>
            regions?.length > 0 && limit > 0
                ? effectiveRegions.slice(0, limit)
                : effectiveRegions,
        [effectiveRegions, limit, regions],
    );

    const emptyState = (
        <div
            className={`city-supporters-output ${className || ''}`}
            style={style}
        >
            <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <span className="text-gray-500">
                    {isLoading
                        ? 'Загрузка данных о поддерживающих городах…'
                        : 'Данные о поддерживающих городах не найдены'}
                </span>
            </div>
        </div>
    );

    if (!effectiveRegions.length) return emptyState;

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
                {displayRegions.map((region) => (
                    <CityRow key={region.id} region={region} />
                ))}
            </div>

            {!regions?.length && hasMore && (
                <div className="city-supporters-output__load-more">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={isLoadingMore || isLoading}
                        className="city-supporters-output__load-more-button"
                    >
                        {isLoadingMore ? 'Загрузка...' : 'Загрузить ещё'}
                    </button>
                </div>
            )}
        </div>
    );
};
