import { apiClient } from '@/lib/api';

export type SuggestedOrganizationStatus = 'pending' | 'approved' | 'rejected';

export interface SuggestedOrganization {
    id: number;
    name: string;
    city_name: string | null;
    city?: {
        id: number | null;
        name: string | null;
    } | null;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    status: SuggestedOrganizationStatus;
    admin_notes: string | null;
    reviewed_by: number | null;
    reviewer?: {
        id: number;
        name: string;
        email: string;
    } | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface SuggestedOrganizationFilters {
    search?: string;
    status?: SuggestedOrganizationStatus;
    sort_by: string;
    sort_direction: 'asc' | 'desc';
    per_page: number;
    page: number;
    city_id?: number;
}

export interface SuggestedOrganizationListResponse {
    data: SuggestedOrganization[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number | null;
        to?: number | null;
    };
    links: Record<string, string | null>;
    filters?: SuggestedOrganizationFilters;
    support?: {
        statuses?: SuggestedOrganizationStatus[];
        sortable_fields?: string[];
    };
}

export interface UpdateSuggestedOrganizationPayload {
    name?: string;
    city_id?: number | null;
    city_name?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    status?: SuggestedOrganizationStatus;
    admin_notes?: string | null;
}

export const suggestedOrganizationsApi = {
    list: async (
        params: Partial<SuggestedOrganizationFilters> = {},
    ): Promise<SuggestedOrganizationListResponse> => {
        const response =
            await apiClient.getPaginated<SuggestedOrganizationListResponse>(
                '/dashboard/suggested-organizations',
                params,
            );

        return response.data;
    },

    update: async (
        id: number,
        payload: UpdateSuggestedOrganizationPayload,
    ): Promise<SuggestedOrganization> => {
        const response = await apiClient.patch<SuggestedOrganization>(
            `/dashboard/suggested-organizations/${id}`,
            payload,
        );

        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/dashboard/suggested-organizations/${id}`);
    },
};


