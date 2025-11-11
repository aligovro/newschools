import { apiClient } from '@/lib/api';

export interface NewsTargetPayload {
    type: 'organization' | 'project' | 'site';
    id: number;
}

export interface NewsPayload {
    organization_id?: number | null;
    title: string;
    subtitle?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    content?: string | null;
    image?: string | null;
    gallery?: string[];
    status?: string;
    type?: string;
    visibility?: string;
    is_featured?: boolean;
    tags?: string[];
    starts_at?: string | null;
    ends_at?: string | null;
    timezone?: string | null;
    location?: {
        name?: string | null;
        address?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    };
    registration?: {
        url?: string | null;
        required?: boolean;
    };
    seo_settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    target?: NewsTargetPayload | null;
    is_main_site?: boolean;
}

export interface NewsItem {
    id: number;
    organization_id: number | null;
    newsable_type?: string | null;
    newsable_id?: number | null;
    title: string;
    subtitle?: string | null;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    image?: string | null;
    gallery: string[];
    status: string;
    status_label: string;
    type: string;
    visibility: string;
    visibility_label: string;
    is_featured: boolean;
    tags: string[];
    starts_at?: string | null;
    ends_at?: string | null;
    timezone?: string | null;
    location: {
        name?: string | null;
        address?: string | null;
        latitude?: number | null;
        longitude?: number | null;
    };
    registration_url?: string | null;
    registration_required: boolean;
    seo_settings: Record<string, unknown>;
    metadata: Record<string, unknown>;
    published_at?: string | null;
    views_count: number;
    created_at?: string | null;
    updated_at?: string | null;
    organization?: {
        id: number;
        name: string;
        slug: string;
    } | null;
    target?: {
        type: string;
        id: number;
        name?: string | null;
        slug?: string | null;
    } | null;
}

export interface PaginatedNewsResponse {
    data: NewsItem[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface NewsTargetResponse {
    data: Array<{
        value: number;
        label: string;
        description?: string | null;
        meta: {
            organization_id: number | null;
            organization_name?: string | null;
        };
    }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        has_more: boolean;
    };
}

export const newsApi = {
    list: async (
        params: Record<string, unknown> = {},
    ): Promise<PaginatedNewsResponse> => {
        const response = await apiClient.getPaginated<PaginatedNewsResponse>(
            '/news',
            params,
        );
        return response.data;
    },

    show: async (id: number): Promise<NewsItem> => {
        const response = await apiClient.get<{ data: NewsItem }>(`/news/${id}`);
        return response.data.data;
    },

    create: async (payload: NewsPayload): Promise<NewsItem> => {
        const response = await apiClient.post<{ data: NewsItem }>(
            '/news',
            payload,
        );
        return response.data.data;
    },

    update: async (
        id: number,
        payload: Partial<NewsPayload>,
    ): Promise<NewsItem> => {
        const response = await apiClient.patch<{ data: NewsItem }>(
            `/news/${id}`,
            payload,
        );
        return response.data.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/news/${id}`);
    },

    targets: async (
        params: Record<string, unknown>,
    ): Promise<NewsTargetResponse> => {
        const response = await apiClient.get<NewsTargetResponse>(
            '/news/targets',
            {
                params,
            },
        );
        return response.data;
    },

    mainSite: async (): Promise<{
        site_id: number;
        site_name: string;
    } | null> => {
        const response = await apiClient.get<{
            data: {
                site_id: number;
                site_name: string;
            } | null;
        }>('/news/main-site');
        return response.data.data ?? null;
    },
};
