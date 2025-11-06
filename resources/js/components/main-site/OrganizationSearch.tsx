import { fetchPublicOrganizations } from '@/lib/api/public';
import '@css/components/main-site/OrganizationSearch.scss';
import { Link, usePage } from '@inertiajs/react';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CitySelector from './CitySelector';

interface Organization {
    id: number;
    name: string;
    address: string;
    slug: string;
    logo: string | null;
    image: string | null;
    city: { name: string } | null;
    region?: { name: string } | null;
}

interface OrganizationSearchProps {
    config?: {
        placeholder?: string;
        resultsLimit?: number;
        showCitySelector?: boolean;
        emptyMessage?: string;
    };
}

export default function OrganizationSearch({
    config = {},
}: OrganizationSearchProps) {
    // Получаем глобальную терминологию из shared props
    const { props } = usePage<{
        terminology?: {
            organization?: {
                singular_nominative?: string;
                plural_nominative?: string;
            };
        };
    }>();

    const globalTerminology = props.terminology;

    // Настройки из конфига с дефолтными значениями
    const placeholder =
        config.placeholder || 'Поиск по названию, адресу школы...';
    const resultsLimit = config.resultsLimit || 10;
    const showCitySelector = config.showCitySelector !== false;
    const emptyMessage = config.emptyMessage || 'Организации не найдены';

    // Используем глобальную терминологию
    const orgSingular = useMemo(() => {
        return (
            globalTerminology?.organization?.singular_nominative?.toLowerCase() ||
            'школы'
        );
    }, [globalTerminology]);

    const [selectedCity, setSelectedCity] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Функция для выполнения поиска
    const performSearch = useCallback(
        async (query: string, cityId?: number) => {
            if (query.trim().length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setIsLoading(true);
            try {
                const params: Record<string, string | number> = {
                    type: 'school',
                    limit: resultsLimit,
                    order_by: 'name',
                    order_direction: 'asc',
                };

                if (query.trim()) {
                    params.search = query.trim();
                }

                if (cityId) {
                    params.city_id = cityId;
                }

                const response = await fetchPublicOrganizations(params);
                const organizations = response.data || [];
                setResults(organizations);
                setShowResults(organizations.length > 0);
            } catch (error) {
                console.error('Ошибка поиска организаций:', error);
                setResults([]);
                setShowResults(false);
            } finally {
                setIsLoading(false);
            }
        },
        [resultsLimit],
    );

    // Поиск при изменении текста или города (live search с дебаунсом)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchQuery, selectedCity?.id);
        }, 300); // Дебаунс 300ms для автодополнения

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, selectedCity, performSearch]);

    // Обработчик submit формы
    const handleSearchSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            await performSearch(searchQuery, selectedCity?.id);
        },
        [searchQuery, selectedCity, performSearch],
    );

    // Обработчик очистки поиска
    const handleClear = useCallback(() => {
        setSearchQuery('');
        setResults([]);
        setShowResults(false);
        inputRef.current?.focus();
    }, []);

    // Закрытие результатов при клике вне компонента
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                resultsRef.current &&
                !resultsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Фокус на поле ввода при открытии результатов
    const handleInputFocus = () => {
        if (results.length > 0) {
            setShowResults(true);
        }
    };

    return (
        <section className="organization-search relative py-4">
            <form onSubmit={handleSearchSubmit} className="relative mb-8">
                <div className="flex flex-col gap-4 md:flex-row">
                    {/* Селектор города (опционально) */}
                    {showCitySelector && (
                        <div className="w-full md:w-auto">
                            <CitySelector
                                value={selectedCity}
                                onChange={setSelectedCity}
                                detectOnMount={false}
                            />
                        </div>
                    )}

                    {/* Поле поиска */}
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                            <Search className="h-5 w-5 text-white/70" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={handleInputFocus}
                            placeholder={placeholder}
                            className="organization-search__input w-full border border-white/20 bg-white/10 text-white backdrop-blur-sm placeholder:text-white/70 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-white/70 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Результаты поиска */}
                {showResults && (
                    <div
                        ref={resultsRef}
                        className="organization-search__results absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="py-2">
                                {results.map((org) => (
                                    <li key={org.id}>
                                        <Link
                                            href={`/organizations/${org.slug}`}
                                            className="organization-search__result-item flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                                            onClick={() =>
                                                setShowResults(false)
                                            }
                                        >
                                            {/* Лого */}
                                            <div className="organization-search__logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                                                {org.logo ? (
                                                    <img
                                                        src={org.logo}
                                                        alt={org.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : org.image ? (
                                                    <img
                                                        src={org.image}
                                                        alt={org.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-lg font-semibold text-gray-400">
                                                        {org.name
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Информация */}
                                            <div className="min-w-0 flex-1">
                                                <div className="organization-search__name truncate font-semibold text-gray-900">
                                                    {org.name}
                                                </div>
                                                <div className="organization-search__address truncate text-sm text-gray-600">
                                                    {org.address ||
                                                        (org.city?.name
                                                            ? `${org.city.name}`
                                                            : '')}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                {emptyMessage}
                            </div>
                        )}
                    </div>
                )}
            </form>
        </section>
    );
}
