import CategoryFilter from '@/components/main-site/CategoryFilter';
import CitySelector, {
    type Locality as SelectorCity,
} from '@/components/main-site/CitySelector';
import LoadMoreButton from '@/components/main-site/LoadMoreButton';
import ProjectCard from '@/components/projects/ProjectCard';
import { useDefaultCity } from '@/hooks/useDefaultCity';
import MainLayout from '@/layouts/MainLayout';
import { fetchCityById } from '@/lib/api/public';
import '@css/pages/main-site/projects-page.scss';
import { router } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

interface Organization {
    name: string;
    slug: string;
    region?: {
        name: string;
    };
}

import type { MoneyAmount } from '@/types/money';

interface FundingSummary {
    target: MoneyAmount;
    collected: MoneyAmount;
    progress_percentage: number;
}

interface Project {
    id: number;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    funding?: FundingSummary;
    target_amount_rubles: number;
    collected_amount_rubles: number;
    progress_percentage: number;
    organization?: Organization;
}

interface Category {
    value: string;
    label: string;
}

interface ProjectsPageProps {
    site: any;
    positions: any[];
    position_settings?: any[];
    projects: {
        data: Project[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search?: string;
        category?: string;
        locality_id?: number;
    };
    categories: Category[];
}

export default function Projects({
    site,
    positions,
    position_settings = [],
    projects: initialProjects,
    filters: initialFilters,
    categories,
}: ProjectsPageProps) {
    const [projects, setProjects] = useState(initialProjects.data);
    const [currentPage, setCurrentPage] = useState(
        initialProjects.current_page,
    );
    const [lastPage, setLastPage] = useState(initialProjects.last_page);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(
        initialFilters.category || '',
    );
    const {
        id: defaultCityId,
        loaded: defaultCityLoaded,
        name: defaultCityName,
    } = useDefaultCity();

    const [selectedCity, setSelectedCity] = useState<SelectorCity | null>(null);
    const [isCityManuallySelected, setIsCityManuallySelected] = useState(
        !!initialFilters.locality_id,
    );

    // Синхронизация с новыми данными при изменении фильтров
    useEffect(() => {
        setProjects(initialProjects.data);
        setCurrentPage(initialProjects.current_page);
        setLastPage(initialProjects.last_page);
    }, [
        initialProjects.data,
        initialProjects.current_page,
        initialProjects.last_page,
    ]);

    // Синхронизация города из URL (если пользователь выбирал его ранее)
    useEffect(() => {
        const cityId = initialFilters.locality_id;

        if (!cityId) {
            setSelectedCity(null);
            setIsCityManuallySelected(false);
            return;
        }

        setIsCityManuallySelected(true);

        if (
            defaultCityLoaded &&
            defaultCityId &&
            cityId === defaultCityId &&
            defaultCityName
        ) {
            setSelectedCity({
                id: defaultCityId,
                name: defaultCityName,
            });
            return;
        }

        let isMounted = true;

        fetchCityById(cityId)
            .then((cityData) => {
                if (!isMounted) return;
                setSelectedCity({
                    id: cityData.id,
                    name: cityData.name,
                });
            })
            .catch(() => {
                if (!isMounted) return;
                setSelectedCity({
                    id: cityId,
                    name: '',
                });
            });

        return () => {
            isMounted = false;
        };
    }, [
        initialFilters.locality_id,
        defaultCityLoaded,
        defaultCityId,
        defaultCityName,
    ]);

    // Обновление URL при изменении фильтров
    const updateFilters = useCallback(
        (newFilters: {
            category?: string;
            locality_id?: number | null;
            page?: number;
        }) => {
            const params = new URLSearchParams();

            // Используем новые значения фильтров или текущие
            const category =
                newFilters.category !== undefined
                    ? newFilters.category
                    : selectedCategory;

            // Для города: если явно передан null - убираем из URL
            // Если передан locality_id - используем его
            // Если не передан - используем текущий, но только если он был выбран вручную
            let cityId: number | undefined;
            if (newFilters.locality_id !== undefined) {
                cityId = newFilters.locality_id || undefined;
            } else if (isCityManuallySelected && selectedCity?.id) {
                cityId = selectedCity.id;
            }

            if (category) {
                params.set('category', category);
            }
            if (cityId) {
                params.set('locality_id', String(cityId));
            }
            if (newFilters.page && newFilters.page > 1) {
                params.set('page', String(newFilters.page));
            }

            const url = `/projects${params.toString() ? '?' + params.toString() : ''}`;
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ['projects', 'filters'],
                },
            );
        },
        [selectedCategory, selectedCity, isCityManuallySelected],
    );

    // Обработчик изменения категории
    const handleCategoryChange = useCallback(
        (category: string) => {
            setSelectedCategory(category);
            updateFilters({ category, page: 1 });
        },
        [updateFilters],
    );

    // Обработчик изменения города
    const handleCityChange = useCallback(
        (locality: SelectorCity | null) => {
            setSelectedCity(locality);

            if (locality) {
                setIsCityManuallySelected(true);
                updateFilters({ locality_id: locality.id, page: 1 });
            } else {
                setIsCityManuallySelected(false);
                updateFilters({ locality_id: null, page: 1 });
            }
        },
        [updateFilters],
    );

    // Загрузка следующей страницы
    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || currentPage >= lastPage) return;

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;

        const params = new URLSearchParams();
        if (selectedCategory) {
            params.set('category', selectedCategory);
        }
        // Добавляем locality_id только если он был выбран вручную
        if (isCityManuallySelected && selectedCity?.id) {
            params.set('locality_id', String(selectedCity.id));
        }
        params.set('page', String(nextPage));

        router.get(
            `/projects?${params.toString()}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['projects'],
                onSuccess: (page) => {
                    const newProjects = page.props
                        .projects as typeof initialProjects;
                    setProjects((prev) => [...prev, ...newProjects.data]);
                    setCurrentPage(newProjects.current_page);
                    setLastPage(newProjects.last_page);
                    setIsLoadingMore(false);
                },
                onError: () => {
                    setIsLoadingMore(false);
                },
            },
        );
    }, [
        isLoadingMore,
        currentPage,
        lastPage,
        selectedCategory,
        selectedCity,
        isCityManuallySelected,
    ]);

    const hasMore = currentPage < lastPage;

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            pageTitle="Проекты"
            pageDescription="Список всех проектов"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Проекты', href: '' },
            ]}
        >
            <div className="space-y-8">
                {/* Заголовок */}
                <h1 className="page__title">Проекты</h1>

                {/* Фильтры */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <CategoryFilter
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        categories={categories}
                    />
                    <div className="w-full md:w-auto">
                        <CitySelector
                            value={selectedCity}
                            onChange={handleCityChange}
                            variant="dark"
                            disableAutoSet={!isCityManuallySelected}
                        />
                    </div>
                </div>

                {/* Список проектов */}
                {projects.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                />
                            ))}
                        </div>
                        <LoadMoreButton
                            onClick={handleLoadMore}
                            isLoading={isLoadingMore}
                            hasMore={hasMore}
                        />
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-gray-500">Проекты не найдены</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
