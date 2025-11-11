import { newsApi, type NewsItem, type NewsPayload, type PaginatedNewsResponse } from '@/lib/api';
import { useCallback } from 'react';

export const useNewsApi = () => {
    const list = useCallback(
        async (params: Record<string, unknown> = {}): Promise<PaginatedNewsResponse> => {
            return newsApi.list(params);
        },
        [],
    );

    const show = useCallback(async (id: number): Promise<NewsItem> => {
        return newsApi.show(id);
    }, []);

    const create = useCallback(async (payload: NewsPayload): Promise<NewsItem> => {
        return newsApi.create(payload);
    }, []);

    const update = useCallback(
        async (id: number, payload: Partial<NewsPayload>): Promise<NewsItem> => {
            return newsApi.update(id, payload);
        },
        [],
    );

    const destroy = useCallback(async (id: number): Promise<void> => {
        return newsApi.delete(id);
    }, []);

    return {
        list,
        show,
        create,
        update,
        destroy,
    };
};

