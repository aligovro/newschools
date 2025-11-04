import { useDefaultCity } from '@/hooks/useDefaultCity';
import { detectCityByGeolocation, fetchPublicCities } from '@/lib/api/public';
import '@css/components/main-site/CitySelector.scss';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface City {
    id: number;
    name: string;
    region?: {
        name: string;
    };
}

interface CitySelectorProps {
    value: City | null;
    onChange: (city: City | null) => void;
    defaultCityName?: string;
    detectOnMount?: boolean;
}

export default function CitySelector({
    value,
    onChange,
    detectOnMount = false,
}: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    const {
        id: defaultId,
        name: defaultName,
        region: defaultRegion,
        loaded: globalDefaultLoaded,
    } = useDefaultCity();

    // Инициализация дефолтного города при монтировании
    useEffect(() => {
        if (!globalDefaultLoaded) return;
        if (value) return; // Если город уже выбран, не меняем

        // Если геолокация включена, пытаемся определить город
        if (detectOnMount) {
            setIsDetecting(true);
            detectCityByGeolocation()
                .then((detectedCity) => {
                    if (
                        detectedCity &&
                        typeof detectedCity === 'object' &&
                        detectedCity.id &&
                        detectedCity.name
                    ) {
                        onChange(detectedCity);
                    } else if (defaultId && defaultName) {
                        // Если геолокация не сработала, используем дефолтный
                        onChange({
                            id: defaultId,
                            name: defaultName,
                            region: defaultRegion
                                ? { name: defaultRegion.name }
                                : undefined,
                        });
                    }
                })
                .catch(() => {
                    // При ошибке используем дефолтный город
                    if (defaultId && defaultName) {
                        onChange({
                            id: defaultId,
                            name: defaultName,
                            region: defaultRegion
                                ? { name: defaultRegion.name }
                                : undefined,
                        });
                    }
                })
                .finally(() => {
                    setIsDetecting(false);
                });
        } else if (defaultId && defaultName) {
            // Без геолокации сразу устанавливаем дефолтный
            onChange({
                id: defaultId,
                name: defaultName,
                region: defaultRegion
                    ? { name: defaultRegion.name }
                    : undefined,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [globalDefaultLoaded, detectOnMount]);

    // Загрузка списка городов при открытии выпадашки
    useEffect(() => {
        if (!isOpen || cities.length > 0) return;

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
            let results: City[] = [];
            if (query.length >= 2) {
                results = await fetchPublicCities({ search: query });
            } else {
                results = await fetchPublicCities({ limit: 20 });
            }
            setCities((results as City[]).slice(0, 20));
        } catch (error) {
            console.error('Ошибка поиска городов:', error);
            setCities([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectCity = (city: City) => {
        onChange(city);
        setIsOpen(false);
        setSearchQuery('');
        setCities([]);
    };

    // Формируем дефолтный город для отображения в списке
    const getDefaultCityForList = (): City | null => {
        if (!defaultId || !defaultName) return null;

        // Проверяем, есть ли дефолтный город в загруженном списке с регионом
        const cityFromList = cities.find((c) => c.id === defaultId && c.region);
        if (cityFromList) return cityFromList;

        // Используем данные из глобальных настроек
        return {
            id: defaultId,
            name: defaultName,
            region: defaultRegion ? { name: defaultRegion.name } : undefined,
        };
    };

    const defaultCityForList = getDefaultCityForList();
    const filteredCities = cities.filter(
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
                className="city-selector__button"
            >
                <span className="city-selector__text">
                    {isDetecting ? (
                        <span className="flex items-center space-x-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-gray-500">
                                Определение...
                            </span>
                        </span>
                    ) : value ? (
                        value.name
                    ) : (
                        <span className="text-gray-500">Выберите город</span>
                    )}
                </span>
                <img src="/icons/direct-right.svg" alt="" className="city-selector__icon" />
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
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                                    {finalCities.map((city) => (
                                        <li key={city.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectCity(city)
                                                }
                                                className={`city-selector__city-item w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                                                    value?.id === city.id
                                                        ? 'city-selector__city-item--selected bg-blue-50 text-blue-600'
                                                        : 'text-gray-900'
                                                }`}
                                            >
                                                {city.name}
                                                {city.region && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({city.region.name})
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
