import { fetchPublicOrganizations } from '@/lib/api/public';
import '@css/components/main-site/SubscribeBlock.scss';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import type { User as AppUser, Auth } from '@/types';
import CitySelector from './CitySelector';
import { SubscribeSponsorModal } from './SubscribeSponsorModal';

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
        show_title?: boolean; // Показывать заголовок на сайте
        subtitle?: string;
        backgroundGradient?: string;
        backgroundImage?: string;
        schoolsLimit?: number;
        columns?: number;
        autoDetectCity?: boolean; // Автоопределение города по геолокации
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
        auth?: Auth;
    }>();

    const globalTerminology = props.terminology;

    // Настройки из конфига с дефолтными значениями
    const mainTitle =
        config.mainTitle || 'Подпишись на постоянную поддержку своей школы';
    const show_title = config.show_title ?? true; // По умолчанию true для обратной совместимости
    const subtitle =
        config.subtitle ||
        'Подписка поможет закрывать регулярные нужды школы и реализовывать проекты';
    const backgroundGradient =
        config.backgroundGradient ||
        'linear-gradient(84deg, #96bdff 0%, #3259ff 100%)';
    const backgroundImage = config.backgroundImage || '';
    const schoolsLimit = config.schoolsLimit || 6;
    const columns = config.columns || 3;
    const autoDetectCity = config.autoDetectCity ?? false;

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
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [targetOrganization, setTargetOrganization] =
        useState<Organization | null>(null);

    const initialUser = props.auth?.user || null;
    const [sessionUser, setSessionUser] = useState<AppUser | null>(initialUser);

    useEffect(() => {
        setSessionUser(initialUser);
    }, [initialUser]);

    // Функция для выполнения поиска
    const performSearch = useCallback(
        async (query: string, cityId?: number) => {
            setIsLoading(true);
            try {
                const params: Record<string, string | number> = {
                    type: 'school',
                    limit: schoolsLimit,
                    order_by: 'donations_total',
                    order_direction: 'desc',
                };

                if (query.trim()) {
                    params.search = query.trim();
                }

                if (cityId) {
                    params.city_id = cityId;
                }

                const response = await fetchPublicOrganizations(params);
                const schools = response.data || [];
                setPopularSchools(schools.slice(0, schoolsLimit));
            } catch (error) {
                console.error('Ошибка поиска школ:', error);
                setPopularSchools([]);
            } finally {
                setIsLoading(false);
            }
        },
        [schoolsLimit],
    );

    // Поиск школ при изменении текста или города (live search с дебаунсом)
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchQuery, selectedCity?.id);
        }, 500); // Дебаунс 500ms

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

    const handleSubscribe = useCallback(
        async (school: Organization) => {
            if (sessionUser) {
                try {
                    await axios.post(
                        '/api/auth/phone/attach',
                        { organization_id: school.id },
                        { withCredentials: true },
                    );
                    toast.success(
                        `Вы подписались как спонсор ${school.name}. Благодарим!`,
                    );
                } catch (error: any) {
                    const message =
                        error.response?.data?.message ||
                        'Не удалось оформить подписку. Попробуйте позже.';
                    toast.error(message);
                }
                return;
            }

            setTargetOrganization(school);
            setIsModalOpen(true);
        },
        [sessionUser],
    );

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
            className="subscribe-block relative overflow-hidden rounded-[20px]"
            style={{
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
            <div className="relative z-10 flex h-full flex-col">
                {/* Заголовки */}
                {(mainTitle && show_title) || subtitle ? (
                    <div className="mb-8 p-8 pb-0 md:p-12">
                        {mainTitle && show_title && (
                            <h2 className="subscribe-block__title mb-4 text-3xl font-bold text-white md:text-4xl">
                                {mainTitle}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="text-lg text-white/90 md:text-xl">
                                {subtitle}
                            </p>
                        )}
                    </div>
                ) : null}

                {/* Форма поиска */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="mb-8 pl-8 pr-8 md:pl-12 md:pr-12"
                >
                    <div className="flex flex-col gap-4 md:flex-row">
                        {/* Селектор города */}
                        <div className="w-full md:w-auto">
                            <CitySelector
                                value={selectedCity}
                                onChange={setSelectedCity}
                                detectOnMount={autoDetectCity}
                                disableAutoSet={!autoDetectCity}
                            />
                        </div>

                        {/* Поле поиска */}
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3">
                                <Search className="h-5 w-5 text-white/70" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Поиск по названию, адресу ${orgSingular}...`}
                                className="subscribe-block__search-input w-full border border-white/20 bg-white/10 text-white backdrop-blur-sm placeholder:text-white/70 focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                        </div>
                    </div>
                </form>

                {/* Популярные школы */}
                <div className="flex-1 overflow-auto pl-8 pr-8 md:pl-12 md:pr-12">
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
                                    className="subscribe-block__school-card flex items-center gap-3 p-3"
                                >
                                    {/* Лого */}
                                    <div className="subscribe-block__school-logo flex shrink-0 items-center justify-center overflow-hidden rounded-full">
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
                                            <span className="text-lg font-semibold text-gray-400">
                                                {school.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Текст */}
                                    <div className="min-w-0 flex-1">
                                        <div className="subscribe-block__school-address truncate">
                                            {[school.city?.name, school.address]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </div>
                                        <div className="subscribe-block__school-name truncate">
                                            {school.name}
                                        </div>
                                    </div>

                                    {/* Кнопка подписки */}
                                    <button
                                        onClick={() => handleSubscribe(school)}
                                        className="subscribe-block__subscribe-button flex shrink-0 items-center justify-center"
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
            <SubscribeSponsorModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                organization={
                    targetOrganization
                        ? {
                              id: targetOrganization.id,
                              name: targetOrganization.name,
                          }
                        : null
                }
                onCompleted={(user) => {
                    setSessionUser(user);
                    setIsModalOpen(false);
                }}
            />
        </section>
    );
}
