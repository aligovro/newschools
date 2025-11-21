import { useDefaultCity } from '@/hooks/useDefaultCity';
import {
    detectCityByGeolocation,
    fetchPublicCities,
    type PublicCity,
} from '@/lib/api/public';
import '@css/components/main-site/CitySelector.scss';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type Locality = PublicCity;

interface CitySelectorProps {
    value: Locality | null;
    onChange: (locality: Locality | null) => void;
    defaultCityName?: string;
    detectOnMount?: boolean;
    variant?: 'light' | 'dark';
    disableAutoSet?: boolean; // Отключает автоматическую установку дефолтного города
}

export default function CitySelector({
    value,
    onChange,
    detectOnMount = false,
    variant = 'light',
    disableAutoSet = false,
}: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [localities, setCities] = useState<Locality[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const defaultCityDetailsRef = useRef<Locality | null>(null);

    const {
        id: defaultId,
        name: defaultName,
        region: defaultRegion,
        loaded: globalDefaultLoaded,
    } = useDefaultCity();

    // Инициализация дефолтного города при монтировании
    useEffect(() => {
        if (!globalDefaultLoaded) return;
        if (value) return;
        if (disableAutoSet) return;

        let cancelled = false;

        const fallbackCity = () => {
            if (!defaultId || !defaultName) return null;
            if (defaultCityDetailsRef.current) {
                return defaultCityDetailsRef.current;
            }
            return {
                id: defaultId,
                name: defaultName,
                region: defaultRegion
                    ? { name: defaultRegion.name }
                    : undefined,
                latitude: undefined,
                longitude: undefined,
            } satisfies Locality;
        };

        const loadDefaultCity = async () => {
            if (!defaultId) {
                return fallbackCity();
            }
            try {
                const [cityById] = await fetchPublicCities({
                    ids: [defaultId],
                });
                if (cityById) {
                    defaultCityDetailsRef.current = cityById as Locality;
                    return defaultCityDetailsRef.current;
                }
            } catch (error) {
                console.debug('Failed to load default locality details', error);
            }
            if (defaultName) {
                try {
                    const [cityByName] = await fetchPublicCities({
                        search: defaultName,
                        limit: 1,
                    });
                    if (cityByName) {
                        defaultCityDetailsRef.current = cityByName as Locality;
                        return defaultCityDetailsRef.current;
                    }
                } catch (error) {
                    console.debug(
                        'Failed to resolve default locality by name',
                        error,
                    );
                }
            }
            return fallbackCity();
        };

        const applyDefaultCity = async () => {
            const cityToSet = await loadDefaultCity();
            if (!cancelled && cityToSet) {
                defaultCityDetailsRef.current = cityToSet;
                onChange(cityToSet);
            }
        };

        if (detectOnMount) {
            setIsDetecting(true);
            detectCityByGeolocation()
                .then(async (detectedCity) => {
                    if (
                        detectedCity &&
                        typeof detectedCity === 'object' &&
                        detectedCity.id &&
                        detectedCity.name
                    ) {
                        if (!cancelled) {
                            onChange(detectedCity as Locality);
                        }
                    } else {
                        await applyDefaultCity();
                    }
                })
                .catch(async () => {
                    await applyDefaultCity();
                })
                .finally(() => {
                    if (!cancelled) {
                        setIsDetecting(false);
                    }
                });
        } else {
            applyDefaultCity();
        }

        return () => {
            cancelled = true;
        };
    }, [
        globalDefaultLoaded,
        value,
        disableAutoSet,
        detectOnMount,
        defaultId,
        defaultName,
        defaultRegion,
        onChange,
    ]);

    // Загрузка списка городов при открытии выпадашки
    useEffect(() => {
        if (!isOpen || localities.length > 0) return;

        setIsLoading(true);
        fetchPublicCities({ limit: 100 })
            .then((results) => {
                setCities(results);
            })
            .catch(() => {
                setCities([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    // Поиск городов при вводе текста
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        setIsLoading(true);
        try {
            let results: Locality[] = [];
            if (query.length >= 2) {
                results = await fetchPublicCities({ search: query });
            } else {
                results = await fetchPublicCities({ limit: 20 });
            }
            setCities((results as Locality[]).slice(0, 20));
        } catch (error) {
            console.error('Ошибка поиска городов:', error);
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectCity = (locality: Locality) => {
        onChange(locality);
        setIsOpen(false);
        setSearchQuery('');
        setCities([]);
    };

    const handleClearCity = () => {
        onChange(null);
        setIsOpen(false);
        setSearchQuery('');
        setCities([]);
    };

    // Формируем дефолтный город для отображения в списке
    const getDefaultCityForList = (): Locality | null => {
        if (!defaultId || !defaultName) return null;

        // Проверяем, есть ли дефолтный город в загруженном списке с регионом
        const cityFromList = localities.find(
            (c) => c.id === defaultId && c.region,
        );
        if (cityFromList) return cityFromList as Locality;

        if (value && value.id === defaultId) {
            defaultCityDetailsRef.current = value;
            return value;
        }

        if (defaultCityDetailsRef.current) {
            return defaultCityDetailsRef.current;
        }

        // Используем данные из глобальных настроек
        return {
            id: defaultId,
            name: defaultName,
            region: defaultRegion ? { name: defaultRegion.name } : undefined,
            latitude: undefined,
            longitude: undefined,
        };
    };

    const defaultCityForList = getDefaultCityForList();
    const filteredCities = localities.filter(
        (c) => !defaultCityForList || c.id !== defaultCityForList.id,
    );
    const sortedCities = [...filteredCities].sort((a, b) =>
        a.name.localeCompare(b.name),
    );
    const finalCities = [
        ...(defaultCityForList ? [defaultCityForList] : []),
        ...sortedCities,
    ];

    return (
        <div className="city-selector relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`city-selector__button ${
                    variant === 'dark' ? 'city-selector__button--dark' : ''
                }`}
            >
                <span className="city-selector__text">
                    {isDetecting ? (
                        <span className="flex items-center space-x-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-gray-500">
                                Определение...
                            </span>
                        </span>
                    ) : (
                        (value?.name ?? 'Все города')
                    )}
                </span>
                <img
                    src="/icons/direct-right.svg"
                    alt=""
                    className="city-selector__icon"
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="city-selector__overlay fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="city-selector__dropdown absolute left-0 top-full z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <div className="p-3">
                            <input
                                type="text"
                                placeholder="Поиск города..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                // Важно: шрифт не меньше 16px, чтобы мобильный браузер не зумил экран при фокусе
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                                </div>
                            ) : finalCities.length > 0 ? (
                                <ul className="py-1">
                                    <li>
                                        <button
                                            type="button"
                                            onClick={handleClearCity}
                                            className={`city-selector__city-item w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                                                !value
                                                    ? 'city-selector__city-item--selected bg-blue-50 text-blue-600'
                                                    : 'text-gray-900'
                                            }`}
                                        >
                                            Все города
                                        </button>
                                    </li>
                                    {finalCities.map((locality) => (
                                        <li key={locality.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectCity(locality)
                                                }
                                                className={`city-selector__city-item w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                                                    value?.id === locality.id
                                                        ? 'city-selector__city-item--selected bg-blue-50 text-blue-600'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {locality.name}
                                                {locality.region && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({locality.region.name})
                                                    </span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Города не найдены
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
