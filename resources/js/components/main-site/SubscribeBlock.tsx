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
    locality: { name: string } | null;
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
                    params.locality_id = cityId;
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

    // Класс-модификатор для количества колонок (стилизуется через SCSS)
    const gridColsModifierClass = useMemo(() => {
        switch (columns) {
            case 1:
                return 'subscribe-block__schools-grid--cols-1';
            case 2:
                return 'subscribe-block__schools-grid--cols-2';
            case 3:
                return 'subscribe-block__schools-grid--cols-3';
            case 4:
                return 'subscribe-block__schools-grid--cols-4';
            default:
                return 'subscribe-block__schools-grid--cols-3';
        }
    }, [columns]);

    return (
        <section
            className="subscribe-block"
            style={{ background: backgroundGradient }}
        >
            {/* Фоновая картинка справа сверху */}
            <div className="subscribe-block__bg">
                <img
                    src={backgroundImage || '/images/subscribe-block-bg.png'}
                    alt=""
                    className="subscribe-block__bg-image"
                />
            </div>

            {/* Контент */}
            <div className="subscribe-block__content">
                {/* Заголовки */}
                {(mainTitle && show_title) || subtitle ? (
                    <div className="subscribe-block__header">
                        {mainTitle && show_title && (
                            <h2 className="subscribe-block__title">
                                {mainTitle}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="subscribe-block__subtitle">
                                {subtitle}
                            </p>
                        )}
                    </div>
                ) : null}

                {/* Форма поиска */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="subscribe-block__form"
                >
                    <div className="subscribe-block__form-row">
                        {/* Селектор города */}
                        <div className="subscribe-block__city-selector">
                            <CitySelector
                                value={selectedCity}
                                onChange={setSelectedCity}
                                detectOnMount={autoDetectCity}
                                disableAutoSet={!autoDetectCity}
                            />
                        </div>

                        {/* Поле поиска */}
                        <div className="subscribe-block__search">
                            <div className="subscribe-block__search-icon">
                                <Search className="subscribe-block__search-icon-svg" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Поиск по названию, адресу ${orgSingular}...`}
                                className="subscribe-block__search-input"
                            />
                        </div>
                    </div>
                </form>

                {/* Популярные школы */}
                <div className="subscribe-block__schools">
                    <h3 className="subscribe-block__schools-title">
                        Популярные {orgPlural}:
                    </h3>

                    {isLoading ? (
                        <div className="subscribe-block__loader-wrapper">
                            <div className="subscribe-block__loader" />
                        </div>
                    ) : popularSchools.length > 0 ? (
                        <div
                            className={`subscribe-block__schools-grid ${gridColsModifierClass}`}
                        >
                            {popularSchools.map((school) => (
                                <div
                                    key={school.id}
                                    className="subscribe-block__school-card"
                                >
                                    {/* Лого */}
                                    <div className="subscribe-block__school-logo">
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
                                            <span className="subscribe-block__school-logo-initial">
                                                {school.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {/* Текст */}
                                    <div className="subscribe-block__school-text">
                                        <div className="subscribe-block__school-address truncate">
                                            {[
                                                school.locality?.name,
                                                school.address,
                                            ]
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
                                        className="subscribe-block__subscribe-button"
                                        aria-label="Подписаться"
                                    >
                                        <Plus className="subscribe-block__subscribe-button-icon" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="subscribe-block__empty-state">
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
