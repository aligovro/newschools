import { detectCityByGeolocation, fetchPublicCities } from '@/lib/api/public';
import { ChevronDown, Loader2, MapPin } from 'lucide-react';
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
    defaultCityName?: string; // Город по умолчанию (например, "Казань")
}

export default function CitySelector({
    value,
    onChange,
    defaultCityName = 'Казань',
}: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);

    // Попытка определения города по геолокации
    useEffect(() => {
        const detectCity = async () => {
            if (value) return; // Если город уже выбран, не определяем

            setIsDetecting(true);
            try {
                const detectedCity = await detectCityByGeolocation();
                if (detectedCity) {
                    onChange(detectedCity);
                } else {
                    // Если не удалось определить, устанавливаем город по умолчанию
                    const defaultCity = await findCityByName(defaultCityName);
                    if (defaultCity) {
                        onChange(defaultCity);
                    }
                }
            } catch (error) {
                console.error('Ошибка определения города:', error);
                // В случае ошибки устанавливаем город по умолчанию
                const defaultCity = await findCityByName(defaultCityName);
                if (defaultCity) {
                    onChange(defaultCity);
                }
            } finally {
                setIsDetecting(false);
            }
        };

        detectCity();
    }, []); // Выполняется только при монтировании

    // Поиск города по имени
    const findCityByName = async (name: string): Promise<City | null> => {
        try {
            const cities = await fetchPublicCities({ search: name });
            return (
                cities.find((c: City) =>
                    c.name.toLowerCase().includes(name.toLowerCase()),
                ) || null
            );
        } catch (error) {
            console.error('Ошибка поиска города:', error);
            return null;
        }
    };

    // Поиск городов при вводе текста
    const handleSearch = useCallback(async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setCities([]);
            return;
        }

        setIsLoading(true);
        try {
            const results = await fetchPublicCities({ search: query });
            setCities(results.slice(0, 20)); // Ограничиваем до 20 результатов
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

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="min-w-[120px] text-left">
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
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute left-0 top-full z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
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
                            ) : cities.length > 0 ? (
                                <ul className="py-1">
                                    {cities.map((city) => (
                                        <li key={city.id}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSelectCity(city)
                                                }
                                                className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-gray-100 ${
                                                    value?.id === city.id
                                                        ? 'bg-blue-50 text-blue-600'
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
                            ) : searchQuery.length >= 2 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Города не найдены
                                </div>
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Введите название города для поиска
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
