import { useCallback, useState } from 'react';

import {
    suggestedOrganizationsApi,
    type SuggestedOrganization,
    type SuggestedOrganizationFilters,
    type SuggestedOrganizationListResponse,
    type SuggestedOrganizationStatus,
} from '@/lib/api/suggested-organizations';

export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from?: number | null;
    to?: number | null;
}

const DEFAULT_META: PaginationMeta = {
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,
    from: 0,
    to: 0,
};

interface SupportPayload {
    statuses: SuggestedOrganizationStatus[];
    sortableFields: string[];
}

interface UseSuggestedOrganizationsState {
    items: SuggestedOrganization[];
    meta: PaginationMeta;
    loading: boolean;
    error: string | null;
    support: SupportPayload;
}

const transformMeta = (
    response: SuggestedOrganizationListResponse,
): PaginationMeta => ({
    currentPage: response.meta.current_page,
    lastPage: response.meta.last_page,
    perPage: response.meta.per_page,
    total: response.meta.total,
    from: response.meta.from ?? null,
    to: response.meta.to ?? null,
});

const transformSupport = (
    response: SuggestedOrganizationListResponse,
): SupportPayload => ({
    statuses: response.support?.statuses ?? [
        'pending',
        'approved',
        'rejected',
    ],
    sortableFields: response.support?.sortable_fields ?? [
        'created_at',
        'updated_at',
        'name',
        'status',
    ],
});

export const useSuggestedOrganizations = () => {
    const [state, setState] = useState<UseSuggestedOrganizationsState>({
        items: [],
        meta: DEFAULT_META,
        loading: false,
        error: null,
        support: {
            statuses: ['pending', 'approved', 'rejected'],
            sortableFields: ['created_at', 'updated_at', 'name', 'status'],
        },
    });

    const fetch = useCallback(async (filters: SuggestedOrganizationFilters) => {
        setState((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));

        try {
            const response = await suggestedOrganizationsApi.list(filters);

            setState((prev) => ({
                ...prev,
                items: response.data,
                meta: transformMeta(response),
                loading: false,
                error: null,
                support: transformSupport(response),
            }));
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'Не удалось загрузить предложенные организации';

            setState((prev) => ({
                ...prev,
                loading: false,
                error: message,
            }));
        }
    }, []);

    return {
        items: state.items,
        meta: state.meta,
        loading: state.loading,
        error: state.error,
        support: state.support,
        fetch,
    };
};


