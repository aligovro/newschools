import CitySelector, {
    type City as PublicCity,
} from '@/components/main-site/CitySelector';
import { MapMarker } from '@/components/maps/YandexMap';
import { useDefaultCity } from '@/hooks/useDefaultCity';
import MainLayout from '@/layouts/MainLayout';
import { router } from '@inertiajs/react';
import { List, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ListTab from './ListTab';
import MapTab from './MapTab';

interface OrganizationData {
    id: number;
    name: string;
    slug: string;
    description?: string;
    address?: string;
    logo?: string;
    image?: string;
    region?: {
        name: string;
    };
    city?: {
        id: number;
        name: string;
    };
    type: string;
    projects_count: number;
    members_count?: number;
    sponsors_count?: number;
    donations_total: number;
    donations_collected: number;
    director_name?: string;
    needs_target_amount?: number | null;
    needs_collected_amount?: number | null;
    latitude?: number | null;
    longitude?: number | null;
}

interface OrganizationsPageProps {
    site: {
        id: number;
        name: string;
        slug: string;
        description?: string;
        favicon?: string;
        template: string;
        widgets_config: any[];
        seo_config?: Record<string, unknown>;
    };
    positions: any[];
    position_settings?: any[];
    organizations: {
        data: OrganizationData[];
        current_page: number;
        last_page: number;
        per_page?: number;
        total?: number;
        meta?: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    filters?: {
        search?: string;
        region_id?: number;
        city_id?: number;
    };
}

export default function Organizations({
    site,
    positions,
    position_settings = [],
    organizations,
    filters,
}: OrganizationsPageProps) {
    const paginationMeta =
        organizations.meta ??
        ({
            current_page: organizations.current_page ?? 1,
            last_page: organizations.last_page ?? 1,
            per_page: organizations.per_page ?? 6,
            total: organizations.total ?? organizations.data.length ?? 0,
        } satisfies OrganizationsPageProps['organizations']['meta']);

    const PAGE_SIZE = paginationMeta?.per_page ?? organizations.per_page ?? 6;
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
    const [selectedCity, setSelectedCity] = useState<PublicCity | null>(null);
    const [cityCoordinates, setCityCoordinates] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const {
        id: defaultCityId,
        name: defaultCityName,
        loaded: defaultCityLoaded,
    } = useDefaultCity();

    // Инициализация города из фильтров
    useEffect(() => {
        if (filters?.city_id && organizations.data.length > 0) {
            const org = organizations.data.find(
                (o) => o.city?.id === filters.city_id,
            );
            if (org?.city) {
                setSelectedCity({
                    id: org.city.id,
                    name: org.city.name,
                });
            }
        }
    }, [filters?.city_id, organizations.data]);

    // Автоматическое назначение дефолтного города, если ещё не выбран
    useEffect(() => {
        if (
            !selectedCity &&
            defaultCityLoaded &&
            typeof defaultCityId === 'number' &&
            defaultCityName
        ) {
            setSelectedCity({ id: defaultCityId, name: defaultCityName });
        }
    }, [selectedCity, defaultCityLoaded, defaultCityId, defaultCityName]);

    // Загрузка координат выбранного города
    useEffect(() => {
        if (!selectedCity?.name) {
            setCityCoordinates(null);
            return;
        }

        const fetchCityCoordinates = async () => {
            try {
                // Сначала пробуем получить по ID через dashboard API
                if (selectedCity.id) {
                    try {
                        const res = await fetch(
                            `/dashboard/api/cities/${selectedCity.id}`,
                        );
                        if (res.ok) {
                            const data = await res.json();
                            if (data?.latitude && data?.longitude) {
                                setCityCoordinates({
                                    latitude: Number(data.latitude),
                                    longitude: Number(data.longitude),
                                });
                                return;
                            }
                        }
                    } catch {
                        // Если не получилось, используем публичный API
                    }
                }

                // Fallback: используем публичный API по имени
                const url = new URL(
                    '/api/public/cities/resolve',
                    window.location.origin,
                );
                url.searchParams.set('name', selectedCity.name);
                const res = await fetch(url.toString());
                if (res.ok) {
                    const data = await res.json();
                    if (data?.city?.latitude && data?.city?.longitude) {
                        setCityCoordinates({
                            latitude: Number(data.city.latitude),
                            longitude: Number(data.city.longitude),
                        });
                    }
                }
            } catch (error) {
                console.error('Ошибка загрузки координат города:', error);
            }
        };

        fetchCityCoordinates();
    }, [selectedCity?.id, selectedCity?.name]);

    // Обновление URL при изменении фильтров
    const updateFilters = useCallback(
        (newFilters: { search?: string; city_id?: number; page?: number }) => {
            const params = new URLSearchParams();
            if (newFilters.search) {
                params.set('search', newFilters.search);
            }
            if (newFilters.city_id) {
                params.set('city_id', String(newFilters.city_id));
            }
            if (newFilters.page) {
                params.set('page', String(newFilters.page));
            }
            params.set('per_page', String(PAGE_SIZE));

            const url = `/organizations${params.toString() ? '?' + params.toString() : ''}`;
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        },
        [PAGE_SIZE],
    );

    // Обработчик изменения поиска с дебаунсом
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchQuery(value);
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                updateFilters({
                    search: value || undefined,
                    city_id: selectedCity?.id,
                    page: 1,
                });
            }, 500);
        },
        [selectedCity, updateFilters],
    );

    // Обработчик изменения города
    const handleCityChange = useCallback(
        (city: PublicCity | null) => {
            setSelectedCity(city);
            updateFilters({
                search: searchQuery || undefined,
                city_id: city?.id,
                page: 1,
            });
        },
        [searchQuery, updateFilters],
    );

    // Подготовка маркеров для карты (только для выбранного города)
    const mapMarkers: MapMarker[] = useMemo(() => {
        return organizations.data
            .filter((org) => {
                // Фильтруем только организации выбранного города
                if (selectedCity?.id && org.city?.id) {
                    return org.city.id === selectedCity.id;
                }
                // Если город не выбран, показываем все
                return true;
            })
            .map((org) => {
                const lat = org.latitude != null ? Number(org.latitude) : null;
                const lon =
                    org.longitude != null ? Number(org.longitude) : null;
                if (lat == null || lon == null) return null;
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                return {
                    id: org.id,
                    position: [lat, lon] as [number, number],
                    hint: org.name,
                    balloon: `<div>
                    <h3>${org.name}</h3>
                    ${org.description ? `<p>${org.description}</p>` : ''}
                    ${org.region ? `<p>Регион: ${org.region.name}</p>` : ''}
                    ${org.address ? `<p>Адрес: ${org.address}</p>` : ''}
                    <a href="/organization/${org.slug}" style="color: #3b82f6; text-decoration: underline;">Посмотреть подробнее</a>
                </div>`,
                    data: org, // Передаем данные организации для карточки
                } as MapMarker;
            })
            .filter((m): m is MapMarker => m !== null);
    }, [organizations.data, selectedCity?.id]);

    // Центр карты на основе выбранного города
    const mapCenter: [number, number] = useMemo(() => {
        // Если есть координаты выбранного города, используем их
        if (cityCoordinates) {
            return [cityCoordinates.latitude, cityCoordinates.longitude];
        }

        // Если есть маркеры, используем их центр
        if (mapMarkers.length > 0) {
            let sumLat = 0;
            let sumLon = 0;
            for (const marker of mapMarkers) {
                sumLat += marker.position[0];
                sumLon += marker.position[1];
            }
            return [sumLat / mapMarkers.length, sumLon / mapMarkers.length];
        }

        // По умолчанию Москва
        return [55.751244, 37.618423];
    }, [cityCoordinates, mapMarkers]);

    if (!defaultCityLoaded) {
        return (
            <MainLayout
                site={site}
                positions={positions}
                position_settings={position_settings}
                pageTitle="Загрузка..."
                pageDescription="Список всех организаций"
                breadcrumbs={[
                    { title: 'Главная', href: '/' },
                    { title: 'Школы', href: '' },
                ]}
            >
                <div className="space-y-6">
                    {/* Заголовок */}
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        Загрузка города…
                    </h1>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 items-center gap-4">
                            {/* Селектор города */}
                            <div className="min-w-[180px] animate-pulse rounded-lg bg-gray-100 px-3 py-2 text-gray-400">
                                Загрузка города…
                            </div>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // Формирование заголовка с названием города (c безопасным дефолтом)
    const pageTitle = `Школы ${selectedCity?.name || defaultCityName}`;

    // Формирование URL для пагинации
    const getPaginationUrl = (page: number): string => {
        const params = new URLSearchParams();
        if (filters?.search) {
            params.set('search', filters.search);
        }
        if (filters?.city_id) {
            params.set('city_id', String(filters.city_id));
        }
        params.set('page', String(page));
        params.set('per_page', String(PAGE_SIZE));
        return `/organizations?${params.toString()}`;
    };

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle={pageTitle}
            pageDescription="Список всех организаций"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Школы', href: '' },
            ]}
        >
            <div className="space-y-6">
                {/* Заголовок */}
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    {pageTitle}
                </h1>

                {/* Фильтры: Город | Поиск | Табы */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-4">
                        {/* Селектор города */}
                        <CitySelector
                            value={selectedCity}
                            onChange={handleCityChange}
                            defaultCityName="Казань"
                        />

                        {/* Поиск */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Поиск по названию, адресу школы..."
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Табы */}
                    <div className="flex items-center space-x-4">
                        <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'list'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <List className="h-4 w-4" />
                            <span>Список</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('map')}
                            className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'map'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <MapPin className="h-4 w-4" />
                            <span>На карте</span>
                        </button>
                    </div>
                </div>

                {/* Organizations List */}
                {activeTab === 'list' && (
                    <ListTab
                        organizations={organizations}
                        filters={filters}
                        getPaginationUrl={getPaginationUrl}
                    />
                )}

                {/* Organizations Map */}
                {activeTab === 'map' && (
                    <MapTab mapMarkers={mapMarkers} mapCenter={mapCenter} />
                )}
            </div>
        </MainLayout>
    );
}
