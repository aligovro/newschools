import { fetchPublicOrganizations } from '@/lib/api/public';
import '@css/components/main-site/SubscribeBlock.scss';
import { usePage } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CitySelector from './CitySelector';

interface Organization {
    id: number;
    name: string;
    address: string;
    logo: string | null;
    image: string | null;
    city: { name: string } | null;
}

interface SubscribeBlockProps {
    config?: {
        mainTitle?: string;
        subtitle?: string;
        backgroundGradient?: string;
        backgroundImage?: string;
        schoolsLimit?: number;
        columns?: number;
    };
}

export default function SubscribeBlock({ config = {} }: SubscribeBlockProps) {
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
    const mainTitle =
        config.mainTitle || 'Подпишись на постоянную поддержку своей школы';
    const subtitle =
        config.subtitle ||
        'Подписка поможет закрывать регулярные нужды школы и реализовывать проекты';
    const backgroundGradient =
        config.backgroundGradient ||
        'linear-gradient(84deg, #96bdff 0%, #3259ff 100%)';
    const backgroundImage = config.backgroundImage || '';
    const schoolsLimit = config.schoolsLimit || 6;
    const columns = config.columns || 3;

    // Используем глобальную терминологию
    const orgSingular = useMemo(() => {
        return (
            globalTerminology?.organization?.singular_nominative?.toLowerCase() ||
            'школы'
        );
    }, [globalTerminology]);

    const orgPlural = useMemo(() => {
        return globalTerminology?.organization?.plural_nominative || 'Школы';
    }, [globalTerminology]);
    const [selectedCity, setSelectedCity] = useState<{
        id: number;
        name: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [popularSchools, setPopularSchools] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Загружаем популярные школы
    const loadPopularSchools = useCallback(
        async (cityId?: number) => {
            setIsLoading(true);
            try {
                const params: Record<string, string | number> = {
                    type: 'school',
                    limit: schoolsLimit,
                    order_by: 'donations_total',
                    order_direction: 'desc',
                };

                if (cityId) {
                    params.city_id = cityId;
                }

                const response = await fetchPublicOrganizations(params);
                const schools = response.data || [];
                setPopularSchools(schools.slice(0, schoolsLimit));
            } catch (error) {
                console.error('Ошибка загрузки популярных школ:', error);
                setPopularSchools([]);
            } finally {
                setIsLoading(false);
            }
        },
        [schoolsLimit],
    );

    // Загружаем школы при изменении города
    useEffect(() => {
        loadPopularSchools(selectedCity?.id);
    }, [selectedCity, loadPopularSchools]);

    // Поиск школ
    const handleSearch = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setIsLoading(true);
            try {
                const params: Record<string, string | number> = {
                    type: 'school',
                    limit: schoolsLimit,
                };

                if (searchQuery.trim()) {
                    params.search = searchQuery.trim();
                }

                if (selectedCity?.id) {
                    params.city_id = selectedCity.id;
                }

                const response = await fetchPublicOrganizations(params);
                const schools = response.data || [];
                setPopularSchools(schools.slice(0, schoolsLimit));
            } catch (error) {
                console.error('Ошибка поиска школ:', error);
            } finally {
                setIsLoading(false);
            }
        },
        [searchQuery, selectedCity, schoolsLimit],
    );

    const handleSubscribe = (schoolId: number) => {
        // TODO: Реализовать подписку на школу
        console.log('Подписка на школу:', schoolId);
    };

    // Определяем классы для grid в зависимости от количества колонок
    const gridColsClass = useMemo(() => {
        switch (columns) {
            case 1:
                return 'grid-cols-1';
            case 2:
                return 'grid-cols-1 md:grid-cols-2';
            case 3:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
            case 4:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
            default:
                return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
        }
    }, [columns]);

    return (
        <section
            className="subscribe-block relative overflow-hidden rounded-[20px] p-8 md:p-12"
            style={{
                height: '572px',
                background: backgroundGradient,
            }}
        >
            {/* Фоновая картинка справа сверху */}
            <div className="absolute right-0 top-0 h-full w-full overflow-hidden">
                <img
                    src={backgroundImage || '/images/subscribe-block-bg.png'}
                    alt=""
                    className="absolute right-0 top-0 h-auto max-h-full w-auto max-w-[50%] object-contain object-right-top"
                />
            </div>

            {/* Контент */}
            <div className="relative z-10 max-w-4xl">
                {/* Заголовки */}
                <div className="mb-8">
                    <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                        {mainTitle}
                    </h2>
                    <p className="text-lg text-white/90 md:text-xl">
                        {subtitle}
                    </p>
                </div>

                {/* Форма поиска */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="flex flex-col gap-4 md:flex-row">
                        {/* Селектор города */}
                        <div className="w-full md:w-auto">
                            <CitySelector
                                value={selectedCity}
                                onChange={setSelectedCity}
                                detectOnMount={true}
                            />
                        </div>

                        {/* Поле поиска */}
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Поиск по названию, адресу ${orgSingular}...`}
                                className="subscribe-block__search-input w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white backdrop-blur-sm placeholder:text-white/70 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                            <button
                                type="submit"
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/70 transition-colors hover:text-white"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </form>

                {/* Популярные школы */}
                <div>
                    <h3 className="mb-4 text-xl font-semibold text-white">
                        Популярные {orgPlural}:
                    </h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="subscribe-block__loader h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                        </div>
                    ) : popularSchools.length > 0 ? (
                        <div className={`grid gap-4 ${gridColsClass}`}>
                            {popularSchools.map((school) => (
                                <div
                                    key={school.id}
                                    className="subscribe-block__school-card flex items-center gap-3 rounded-lg bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/15"
                                >
                                    {/* Лого */}
                                    <div className="subscribe-block__school-logo flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/20">
                                        {school.logo ? (
                                            <img
                                                src={school.logo}
                                                alt={school.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : school.image ? (
                                            <img
                                                src={school.image}
                                                alt={school.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-semibold text-white">
                                                {school.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Текст */}
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-sm font-medium text-white">
                                            {school.address ||
                                                (school.city?.name
                                                    ? `${school.city.name}`
                                                    : '')}
                                        </div>
                                        <div className="truncate text-sm text-white/80">
                                            {school.name}
                                        </div>
                                    </div>

                                    {/* Кнопка подписки */}
                                    <button
                                        onClick={() =>
                                            handleSubscribe(school.id)
                                        }
                                        className="subscribe-block__subscribe-button flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#3259ff] transition-colors hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50"
                                        aria-label="Подписаться"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="subscribe-block__empty-state rounded-lg bg-white/10 p-6 text-center text-white/80 backdrop-blur-sm">
                            {searchQuery || selectedCity
                                ? 'Школы не найдены'
                                : 'Загрузка...'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
