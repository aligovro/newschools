import LoadMoreButton from '@/components/main-site/LoadMoreButton';
import NewsWideCard, {
    type NewsSummary,
} from '@/components/news/NewsWideCard';
import MainLayout from '@/layouts/MainLayout';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface PaginatorMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface NewsPaginator {
    data: NewsSummary[];
    meta?: PaginatorMeta;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
}

interface LayoutProps {
    site: any;
    positions: any[];
    position_settings?: any[];
}

interface NewsPageProps extends LayoutProps {
    news: NewsPaginator;
    filters?: {
        search?: string | null;
        type?: string | null;
    };
    seo?: any;
}

const resolveMeta = (payload: NewsPaginator): PaginatorMeta => {
    if (payload.meta) {
        return payload.meta;
    }

    return {
        current_page: payload.current_page ?? 1,
        last_page: payload.last_page ?? 1,
        per_page: payload.per_page ?? payload.data.length ?? 0,
        total: payload.total ?? payload.data.length ?? 0,
    };
};

export default function NewsPage({
    site,
    positions,
    position_settings = [],
    news,
    filters,
    seo,
}: NewsPageProps) {
    const meta = useMemo(() => resolveMeta(news), [news]);

    const [items, setItems] = useState<NewsSummary[]>(news.data ?? []);
    const [currentPage, setCurrentPage] = useState(meta.current_page);
    const [lastPage, setLastPage] = useState(meta.last_page);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchValue, setSearchValue] = useState(filters?.search ?? '');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Синхронизация с новыми данными при изменении фильтров (поиск/тип).
    // При догрузке страниц через "Загрузить ещё" фильтры не меняются, поэтому
    // здесь не сбрасываем локальный список новостей.
    useEffect(() => {
        setItems(news.data ?? []);
        const nextMeta = resolveMeta(news);
        setCurrentPage(nextMeta.current_page);
        setLastPage(nextMeta.last_page);
    }, [filters?.search, filters?.type]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const updateFilters = useCallback(
        (next: { search?: string | null; page?: number }) => {
            const params = new URLSearchParams();

            const search =
                next.search !== undefined ? next.search : searchValue || '';
            if (search) {
                params.set('search', search);
            }

            if (next.page && next.page > 1) {
                params.set('page', String(next.page));
            }

            const url = `/news${params.toString() ? `?${params.toString()}` : ''}`;
            router.get(
                url,
                {},
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: ['news', 'filters'],
                },
            );
        },
        [searchValue],
    );

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchValue(value);
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            searchTimeoutRef.current = setTimeout(() => {
                updateFilters({ search: value || null, page: 1 });
            }, 400);
        },
        [updateFilters],
    );

    const handleLoadMore = useCallback(() => {
        if (isLoadingMore || currentPage >= lastPage) {
            return;
        }

        setIsLoadingMore(true);
        const nextPage = currentPage + 1;
        const params = new URLSearchParams();
        if (searchValue) {
            params.set('search', searchValue);
        }
        params.set('page', String(nextPage));

        router.get(`/news?${params.toString()}`, {}, {
            preserveScroll: true,
            preserveState: true,
            only: ['news'],
            onSuccess: (page) => {
                const payload = page.props.news as NewsPaginator;
                const incomingMeta = resolveMeta(payload);
                setItems((prev) => [...prev, ...(payload.data ?? [])]);
                setCurrentPage(incomingMeta.current_page);
                setLastPage(incomingMeta.last_page);
                setIsLoadingMore(false);
            },
            onError: () => {
                setIsLoadingMore(false);
            },
        });
    }, [currentPage, isLoadingMore, lastPage, searchValue]);

    const hasMore = currentPage < lastPage;

    return (
        <MainLayout
            site={site}
            positions={positions}
            position_settings={position_settings}
            seo={seo}
            pageTitle="Новости"
            pageDescription="Новости и события главного сайта"
            breadcrumbs={[
                { title: 'Главная', href: '/' },
                { title: 'Новости', href: '' },
            ]}
        >
            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="page__title">Новости</h1>
                        <p className="mt-2 text-base text-gray-600">
                            Мы рассказываем о важных событиях, инициативах и
                            проектах выпускников.
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={searchValue ?? ''}
                            onChange={(event) =>
                                handleSearchChange(event.target.value)
                            }
                            placeholder="Поиск по заголовку или описанию..."
                            className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>

                {items.length > 0 ? (
                    <>
                        <div className="space-y-6">
                            {items.map((newsItem) => (
                                <NewsWideCard key={newsItem.id} news={newsItem} />
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <LoadMoreButton
                                onClick={handleLoadMore}
                                isLoading={isLoadingMore}
                                hasMore={hasMore}
                            />
                        </div>
                    </>
                ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
                        Новости не найдены
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

