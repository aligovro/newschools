import { router } from '@inertiajs/react';
import { useState, useCallback } from 'react';
import type {
    OrganizationClubMember,
    ClubFormData,
} from '@/components/dashboard/pages/organizations/types';

interface UseOrganizationClubsOptions {
    organizationId: number;
    initialClubs?: OrganizationClubMember[];
}

export function useOrganizationClubs({
    organizationId,
    initialClubs = [],
}: UseOrganizationClubsOptions) {
    const safeInitial = Array.isArray(initialClubs) ? initialClubs : [];
    const [clubList, setClubList] = useState<OrganizationClubMember[]>(safeInitial);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(safeInitial.length >= 20);

    const fetchClubs = useCallback(
        async (page = 1) => {
            try {
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/clubs?page=${page}&per_page=20`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = await res.json();
                if (page === 1) {
                    setClubList(data.data || []);
                } else {
                    setClubList((prev) => [...prev, ...(data.data || [])]);
                }
                setHasMore(
                    data.pagination?.current_page < data.pagination?.last_page,
                );
            } catch (e) {
                console.error('Error fetching clubs:', e);
            }
        },
        [organizationId],
    );

    const loadMore = useCallback(() => {
        const next = currentPage + 1;
        setCurrentPage(next);
        fetchClubs(next);
    }, [currentPage, fetchClubs]);

    const fetchClub = useCallback(
        async (id: number): Promise<OrganizationClubMember | null> => {
            try {
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/clubs/${id}`,
                    { headers: { Accept: 'application/json' } },
                );
                const data = await res.json();
                return data.data ?? null;
            } catch (e) {
                console.error('Error fetching club:', e);
                return null;
            }
        },
        [organizationId],
    );

    const submitClub = useCallback(
        async (
            formData: ClubFormData,
            editingId: number | null,
        ): Promise<boolean> => {
            const fd = new FormData();
            fd.append('name', formData.name);
            fd.append('description', formData.description);
            fd.append('sort_order', String(formData.sort_order ?? 0));
            if (formData.schedule && typeof formData.schedule === 'object') {
                const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
                days.forEach((d) => {
                    const v = formData.schedule?.[d as keyof typeof formData.schedule];
                    fd.append(`schedule[${d}]`, v && String(v).trim() ? String(v) : '');
                });
            }
            if (formData.image && formData.image instanceof File) {
                fd.append('image', formData.image);
            }

            const url = editingId
                ? `/dashboard/organizations/${organizationId}/clubs/${editingId}`
                : `/dashboard/organizations/${organizationId}/clubs`;

            if (editingId) fd.append('_method', 'PUT');

            try {
                const token =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';
                const res = await fetch(url, {
                    method: 'POST',
                    body: fd,
                    headers: {
                        'X-CSRF-TOKEN': token,
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'same-origin',
                });

                if (!res.ok) throw new Error('Failed to save club');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error saving club:', e);
                return false;
            }
        },
        [organizationId],
    );

    const deleteClub = useCallback(
        async (id: number): Promise<boolean> => {
            try {
                const token =
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '';
                const res = await fetch(
                    `/dashboard/organizations/${organizationId}/clubs/${id}`,
                    {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': token },
                    },
                );
                if (!res.ok) throw new Error('Failed to delete');
                router.reload();
                return true;
            } catch (e) {
                console.error('Error deleting club:', e);
                return false;
            }
        },
        [organizationId],
    );

    return {
        clubList,
        hasMore,
        fetchClubs,
        loadMore,
        fetchClub,
        submitClub,
        deleteClub,
    };
}
