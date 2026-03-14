import { useCallback, useEffect, useState } from 'react';

export interface DonationFeedItem {
    id: number;
    donor_name: string;
    amount_formatted: string;
    payment_method_label: string;
    paid_at: string;
    date_label?: string;
    datetime_formatted?: string;
    project_title?: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UseOrgDonationsFeedResult {
    items: DonationFeedItem[];
    pagination: Pagination;
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => void;
    refetch: () => void;
}

export function useOrgDonationsFeed(
    slug: string | undefined,
    isProject: boolean,
    perPage: number,
): UseOrgDonationsFeedResult {
    const [items, setItems] = useState<DonationFeedItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const baseUrl = isProject
        ? `/project/${encodeURIComponent(slug!)}/donations`
        : `/organization/${encodeURIComponent(slug!)}/donations`;

    const fetchPage = useCallback(
        async (pageNum: number, append: boolean) => {
            if (!slug) {
                setItems([]);
                setLoading(false);
                return;
            }

            if (pageNum === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }
            setError(null);

            try {
                const res = await fetch(
                    `${baseUrl}?page=${pageNum}&per_page=${perPage}`,
                );
                const json = await res.json();

                if (json.success && Array.isArray(json.data)) {
                    const newItems = json.data as DonationFeedItem[];
                    setItems((prev) => (append ? [...prev, ...newItems] : newItems));
                    if (json.pagination) {
                        setPagination(json.pagination);
                    }
                } else if (!append) {
                    setItems([]);
                }
            } catch {
                setError('Не удалось загрузить данные');
                if (!append) setItems([]);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        },
        [slug, baseUrl, perPage],
    );

    const refetch = useCallback(() => {
        fetchPage(1, false);
    }, [fetchPage]);

    useEffect(() => {
        fetchPage(1, false);
    }, [fetchPage]);

    const loadMore = useCallback(() => {
        const nextPage = pagination.current_page + 1;
        if (nextPage <= pagination.last_page && !loadingMore) {
            fetchPage(nextPage, true);
        }
    }, [pagination.current_page, pagination.last_page, loadingMore, fetchPage]);

    return {
        items,
        pagination,
        loading,
        loadingMore,
        error,
        hasMore: pagination.current_page < pagination.last_page,
        loadMore,
        refetch,
    };
}
