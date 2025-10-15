import { SelectOption } from '@/components/ui/universal-select/UniversalSelect';
import { apiClient } from '@/lib/api';
import { useCallback, useMemo, useState } from 'react';

export interface UseSelectDataOptions {
    endpoint: string;
    searchParam?: string;
    pageParam?: string;
    perPageParam?: string;
    perPage?: number;
    transformResponse?: (data: unknown[]) => SelectOption[];
    searchDebounceMs?: number;
    initialLoad?: boolean;
}

export interface UseSelectDataReturn {
    options: SelectOption[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    search: string;
    setSearch: (query: string) => void;
    loadMore: () => void;
    refresh: () => void;
    clearError: () => void;
}

export const useSelectData = ({
    endpoint,
    searchParam = 'search',
    pageParam = 'page',
    perPageParam = 'per_page',
    perPage = 20,
    transformResponse,
    searchDebounceMs = 300,
    initialLoad = true,
}: UseSelectDataOptions): UseSelectDataReturn => {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearchState] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTimeoutId, setSearchTimeoutId] =
        useState<NodeJS.Timeout | null>(null);

    // Дебаунс для поиска
    const setSearch = useCallback(
        (query: string) => {
            setSearchState(query);

            // Очищаем предыдущий таймаут
            if (searchTimeoutId) {
                clearTimeout(searchTimeoutId);
            }

            // Устанавливаем новый таймаут
            const timeoutId = setTimeout(() => {
                setCurrentPage(1);
                setOptions([]);
                loadData(query, 1, true);
            }, searchDebounceMs);

            setSearchTimeoutId(timeoutId);
        },
        [searchTimeoutId, searchDebounceMs],
    );

    // Загрузка данных
    const loadData = useCallback(
        async (
            searchQuery: string = search,
            page: number = 1,
            reset: boolean = false,
        ) => {
            try {
                if (reset) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                setError(null);

                const params: Record<string, unknown> = {
                    [pageParam]: page,
                    [perPageParam]: perPage,
                };

                if (searchQuery) {
                    params[searchParam] = searchQuery;
                }

                const response = await apiClient.getPaginated(endpoint, params);
                const data = response.data;

                // Обрабатываем ответ в зависимости от структуры
                let newOptions: SelectOption[] = [];
                let paginationData = null;

                if (
                    data &&
                    typeof data === 'object' &&
                    'data' in data &&
                    Array.isArray((data as any).data)
                ) {
                    // Laravel pagination format
                    newOptions = (data as any).data;
                    paginationData = {
                        current_page: (data as any).current_page,
                        last_page: (data as any).last_page,
                        total: (data as any).total,
                    };
                } else if (Array.isArray(data)) {
                    // Simple array format
                    newOptions = data as SelectOption[];
                    paginationData = {
                        current_page: 1,
                        last_page: 1,
                        total: data.length,
                    };
                } else {
                    throw new Error('Unexpected response format');
                }

                // Трансформируем данные если нужно
                if (transformResponse) {
                    newOptions = transformResponse(newOptions);
                }

                // Обновляем состояние
                if (reset) {
                    setOptions(newOptions);
                } else {
                    setOptions((prev) => [...prev, ...newOptions]);
                }

                setCurrentPage(paginationData.current_page);
                setTotalPages(paginationData.last_page);
                setHasMore(
                    paginationData.current_page < paginationData.last_page,
                );
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Произошла ошибка при загрузке данных';
                setError(errorMessage);
                console.error('Error loading select data:', err);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [
            endpoint,
            searchParam,
            pageParam,
            perPageParam,
            perPage,
            search,
            transformResponse,
        ],
    );

    // Загрузка следующей страницы
    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore || loading) return;

        const nextPage = currentPage + 1;
        loadData(search, nextPage, false);
    }, [hasMore, loadingMore, loading, currentPage, search, loadData]);

    // Обновление данных
    const refresh = useCallback(() => {
        setCurrentPage(1);
        setOptions([]);
        loadData(search, 1, true);
    }, [search, loadData]);

    // Очистка ошибки
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Очистка таймаута при размонтировании
    const cleanup = useCallback(() => {
        if (searchTimeoutId) {
            clearTimeout(searchTimeoutId);
        }
    }, [searchTimeoutId]);

    // Загружаем начальные данные при монтировании, если разрешено
    useMemo(() => {
        if (initialLoad) {
            loadData('', 1, true);
        }
        return cleanup;
    }, [initialLoad]);

    return {
        options,
        loading,
        loadingMore,
        hasMore,
        error,
        search,
        setSearch,
        loadMore,
        refresh,
        clearError,
    };
};

// Хук для работы с каскадными селектами (регион -> город -> населенный пункт)
export const useCascadeSelectData = () => {
    const [selectedRegionId, setSelectedRegionId] = useState<number | null>(
        null,
    );
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);

    // Данные регионов
    const regionsData = useSelectData({
        endpoint: '/dashboard/api/regions',
        transformResponse: (data: unknown[]) =>
            data.map((item: any) => ({
                value: item.id,
                label: item.name,
                description: item.code ? `Код: ${item.code}` : undefined,
            })),
    });

    // Данные городов
    const citiesData = useSelectData({
        endpoint: '/dashboard/api/cities-by-region',
        searchParam: 'region_id',
        initialLoad: false, // Не загружаем сразу
        transformResponse: (data: unknown[]) =>
            data.map((item: any) => ({
                value: item.id,
                label: item.name,
            })),
    });

    // Данные населенных пунктов
    const settlementsData = useSelectData({
        endpoint: '/dashboard/api/settlements-by-city',
        searchParam: 'city_id',
        initialLoad: false, // Не загружаем сразу
        transformResponse: (data: unknown[]) =>
            data.map((item: any) => ({
                value: item.id,
                label: item.name,
            })),
    });

    // Обработчики изменений
    const handleRegionChange = useCallback(
        (regionId: number | null) => {
            setSelectedRegionId(regionId);
            setSelectedCityId(null);

            if (regionId) {
                // Устанавливаем параметр поиска для городов
                citiesData.setSearch(regionId.toString());
                // Очищаем населенные пункты
                settlementsData.setSearch('');
            } else {
                citiesData.setSearch('');
                settlementsData.setSearch('');
            }
        },
        [citiesData, settlementsData],
    );

    const handleCityChange = useCallback(
        (cityId: number | null) => {
            setSelectedCityId(cityId);

            if (cityId) {
                // Устанавливаем параметр поиска для населенных пунктов
                settlementsData.setSearch(cityId.toString());
            } else {
                settlementsData.setSearch('');
            }
        },
        [settlementsData],
    );

    return {
        regions: {
            ...regionsData,
            value: selectedRegionId,
            onChange: handleRegionChange,
        },
        cities: {
            ...citiesData,
            value: selectedCityId,
            onChange: handleCityChange,
            disabled: !selectedRegionId,
        },
        settlements: {
            ...settlementsData,
            disabled: !selectedCityId,
        },
        handleRegionChange,
        handleCityChange,
    };
};
