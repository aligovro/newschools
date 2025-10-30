import { Breadcrumbs } from '@/components/breadcrumbs';
import CitySelector from '@/components/main-site/CitySelector';
import YandexMap, { MapMarker } from '@/components/maps/YandexMap';
import SchoolCard from '@/components/SchoolCard';
import MainSiteLayout from '@/layouts/MainSiteLayout';
import { Link, router } from '@inertiajs/react';
import { List, MapPin, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    organizations: {
        data: OrganizationData[];
        current_page: number;
        last_page: number;
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
    organizations,
    filters,
}: OrganizationsPageProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
    const [selectedCity, setSelectedCity] = useState<{
        id: number;
        name: string;
        region?: { name: string };
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState(filters?.search || '');
    const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

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

            const url = `/organizations${params.toString() ? '?' + params.toString() : ''}`;
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        },
        [],
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
        (
            city: {
                id: number;
                name: string;
                region?: { name: string };
            } | null,
        ) => {
            setSelectedCity(city);
            updateFilters({
                search: searchQuery || undefined,
                city_id: city?.id,
                page: 1,
            });
        },
        [searchQuery, updateFilters],
    );

    // Подготовка маркеров для карты (с учетом фильтров)
    const mapMarkers: MapMarker[] = useMemo(() => {
        return organizations.data
            .filter((org) => org.latitude && org.longitude)
            .map((org) => ({
                id: org.id,
                position: [org.latitude!, org.longitude!] as [number, number],
                hint: org.name,
                balloon: `<div>
                    <h3>${org.name}</h3>
                    ${org.description ? `<p>${org.description}</p>` : ''}
                    ${org.region ? `<p>Регион: ${org.region.name}</p>` : ''}
                    ${org.address ? `<p>Адрес: ${org.address}</p>` : ''}
                    <a href="/organization/${org.slug}" style="color: #3b82f6; text-decoration: underline;">Посмотреть подробнее</a>
                </div>`,
            }));
    }, [organizations.data]);

    // Центр карты на основе всех организаций
    const mapCenter: [number, number] = useMemo(() => {
        if (mapMarkers.length === 0) return [55.751244, 37.618423]; // Москва по умолчанию

        const latitudes = mapMarkers.map((m) => m.position[0]);
        const longitudes = mapMarkers.map((m) => m.position[1]);
        const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
        const avgLon =
            longitudes.reduce((a, b) => a + b, 0) / longitudes.length;

        return [avgLat, avgLon];
    }, [mapMarkers]);

    // Формирование заголовка с названием города
    const pageTitle = selectedCity
        ? `Школы ${selectedCity.name}`
        : 'Школы города';

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
        return `/organizations?${params.toString()}`;
    };

    return (
        <MainSiteLayout
            site={site}
            positions={positions}
            pageTitle={pageTitle}
            pageDescription="Список всех организаций"
        >
            <div className="space-y-6">
                {/* Хлебные крошки */}
                <Breadcrumbs
                    breadcrumbs={[
                        { title: 'Главная', href: '/' },
                        { title: 'Школы', href: '' },
                    ]}
                />

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
                    <>
                        {organizations.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {organizations.data.map((organization) => (
                                    <SchoolCard
                                        key={organization.id}
                                        school={organization}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-500">
                                    Организации не найдены
                                </p>
                            </div>
                        )}

                        {organizations.last_page > 1 && (
                            <div className="flex justify-center space-x-2">
                                {organizations.current_page > 1 && (
                                    <Link
                                        href={getPaginationUrl(
                                            organizations.current_page - 1,
                                        )}
                                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Предыдущая
                                    </Link>
                                )}
                                {organizations.current_page <
                                    organizations.last_page && (
                                    <Link
                                        href={getPaginationUrl(
                                            organizations.current_page + 1,
                                        )}
                                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Следующая
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Organizations Map */}
                {activeTab === 'map' && (
                    <div className="rounded-lg border bg-white shadow-sm">
                        <div style={{ height: '600px', width: '100%' }}>
                            <YandexMap
                                center={mapCenter}
                                zoom={mapMarkers.length > 0 ? 10 : 6}
                                markers={mapMarkers}
                                height="600px"
                            />
                        </div>
                        {mapMarkers.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                <p>
                                    У организаций нет координат для отображения
                                    на карте
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainSiteLayout>
    );
}
